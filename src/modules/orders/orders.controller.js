const mongoose = require('mongoose');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const Order = require('./order.model');
const User = require('../users/user.model');
const Product = require('../products/product.model');
const cartsService = require('../carts/carts.service');
const { resolveCouponDiscount, consumeCoupon } = require('../coupons/coupons.service');
const { getActiveFlashSales, computeFlashPrice, increaseSoldQuantity } = require('../flashSales/flashSales.service');
const { checkLowStockAndNotify } = require('../inventory/inventory.service');
const { sendMail } = require('../../services/mailer');
const { ORDER_STATUS } = require('../../constants/enums');
const { canTransition } = require('./order.state');

async function buildOrderPayload({ items, deliveryAddress, phoneNumber, paymentMethod, notes, couponCode, userId, session }) {
  const productIds = items.map((it) => it.productId);
  const productsQuery = Product.find({ _id: { $in: productIds }, isArchived: false });
  const products = session ? await productsQuery.session(session) : await productsQuery;
  const flashSalesMap = await getActiveFlashSales(products.map((p) => p._id));

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  const orderItems = [];
  let subtotalAmount = 0;
  const flashUpdates = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) throw new ApiError(400, `Product not found: ${item.productId}`);
    if (product.inventoryCount < item.quantity) {
      throw new ApiError(400, `Insufficient inventory for ${product.name}`);
    }

    const sale = flashSalesMap.get(String(product._id));
    let unitPrice = Number(product.price);
    if (sale) {
      const remainingFlash = Number(sale.maxQuantity || 0) > 0 ? Number(sale.maxQuantity) - Number(sale.soldQuantity || 0) : Number.MAX_SAFE_INTEGER;
      if (remainingFlash >= item.quantity) {
        unitPrice = computeFlashPrice(product.price, sale);
        flashUpdates.push({ saleId: sale._id, quantity: item.quantity });
      }
    }

    const subtotal = unitPrice * item.quantity;
    subtotalAmount += subtotal;

    orderItems.push({
      productId: product._id,
      nameSnapshot: product.name,
      priceSnapshot: unitPrice,
      quantity: item.quantity,
      subtotal
    });

    product.inventoryCount -= item.quantity;
    product.soldCount = (product.soldCount || 0) + item.quantity;
    await product.save(session ? { session } : undefined);

    await checkLowStockAndNotify(product);
  }

  const coupon = await resolveCouponDiscount({ code: couponCode, subtotal: subtotalAmount });
  const discountAmount = coupon.discountAmount;
  const totalAmount = Math.max(0, subtotalAmount - discountAmount);

  return {
    payload: {
      userId,
      orderItems,
      subtotalAmount,
      discountAmount,
      couponCode: coupon.couponCode,
      totalAmount,
      status: ORDER_STATUS.PENDING,
      paymentMethod,
      deliveryAddress,
      phoneNumber,
      notes: notes || ''
    },
    couponId: coupon.couponId,
    flashUpdates
  };
}

async function finalizeAfterOrder({ couponId, flashUpdates }) {
  await consumeCoupon(couponId);
  for (const item of flashUpdates) {
    await increaseSoldQuantity(item.saleId, item.quantity);
  }
}

async function createOrderWithTransaction(params) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { payload, couponId, flashUpdates } = await buildOrderPayload({ ...params, session });
    const [order] = await Order.create([payload], { session });
    await session.commitTransaction();
    await finalizeAfterOrder({ couponId, flashUpdates });
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function createOrderWithoutTransaction(params) {
  const { payload, couponId, flashUpdates } = await buildOrderPayload({ ...params, session: null });
  const order = await Order.create(payload);
  await finalizeAfterOrder({ couponId, flashUpdates });
  return order;
}

async function createOrderInternal(payload) {
  try {
    return await createOrderWithTransaction(payload);
  } catch (error) {
    const unsupportedTransaction =
      error &&
      typeof error.message === 'string' &&
      error.message.includes('Transaction numbers are only allowed on a replica set member or mongos');

    if (!unsupportedTransaction) throw error;
    return createOrderWithoutTransaction(payload);
  }
}

async function sendOrderConfirmation(order) {
  const user = await User.findById(order.userId).lean();
  if (!user || !user.email) return;

  await sendMail({
    to: user.email,
    subject: `Xac nhan don hang ${order._id}`,
    html: `<p>Cam on ${user.name || 'ban'} da dat hang.</p><p>Ma don: <strong>${order._id}</strong></p><p>Tong thanh toan: <strong>${order.totalAmount}</strong></p>`
  });
}

const createOrder = asyncHandler(async (req, res) => {
  const payload = {
    items: req.body.items,
    deliveryAddress: req.body.deliveryAddress,
    phoneNumber: req.body.phoneNumber,
    paymentMethod: req.body.paymentMethod,
    notes: req.body.notes,
    couponCode: req.body.couponCode,
    userId: req.auth.sub
  };

  const order = await createOrderInternal(payload);
  await sendOrderConfirmation(order);
  res.status(201).json(order);
});

const checkoutCart = asyncHandler(async (req, res) => {
  const cartItems = await cartsService.getCheckoutItems(req.auth.sub);

  const payload = {
    items: cartItems,
    deliveryAddress: req.body.deliveryAddress,
    phoneNumber: req.body.phoneNumber,
    paymentMethod: req.body.paymentMethod,
    notes: req.body.notes,
    couponCode: req.body.couponCode,
    userId: req.auth.sub
  };

  const order = await createOrderInternal(payload);
  await cartsService.clearCart(req.auth.sub);
  await sendOrderConfirmation(order);
  res.status(201).json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.auth.sub }).sort({ createdAt: -1 }).lean();
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const nextStatus = req.body.status;
  if (!canTransition(order.status, nextStatus)) {
    throw new ApiError(400, `Invalid transition: ${order.status} -> ${nextStatus}`);
  }

  order.status = nextStatus;
  await order.save();
  res.json(order);
});

module.exports = { createOrder, checkoutCart, getMyOrders, getAllOrders, updateOrderStatus };
