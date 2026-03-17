const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const StoreOrder = require('./storeOrder.model');

const ALLOWED_STATUS_TRANSITIONS = {
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CANCELLED'],
  CANCELLED: []
};

const createStoreOrder = asyncHandler(async (req, res) => {
  const payload = {
    orderCode: req.body.orderCode,
    customerName: req.body.customerName,
    phone: req.body.phone,
    orderType: req.body.orderType,
    address: req.body.address,
    paymentMethod: req.body.paymentMethod,
    paymentStatus: req.body.paymentStatus,
    transactionId: req.body.transactionId || '',
    items: req.body.items,
    subtotal: req.body.subtotal,
    discount: req.body.discount,
    shipping: req.body.shipping,
    total: req.body.total
  };

  let order;
  try {
    order = await StoreOrder.create(payload);
  } catch (error) {
    if (error && error.code === 11000) {
      throw new ApiError(409, 'Mã đơn hàng đã tồn tại. Vui lòng thử lại.');
    }
    throw error;
  }

  res.status(201).json({
    id: order._id,
    orderCode: order.orderCode,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt
  });
});

const getStoreOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.phone) {
    filter.phone = { $regex: String(req.query.phone).trim(), $options: 'i' };
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  const [items, total] = await Promise.all([
    StoreOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    StoreOrder.countDocuments(filter)
  ]);

  res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  });
});

const updateStoreOrderStatus = asyncHandler(async (req, res) => {
  const order = await StoreOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');

  const nextStatus = req.body.status;
  if (order.status === nextStatus) {
    return res.json({
      id: order._id,
      orderCode: order.orderCode,
      status: order.status,
      paymentStatus: order.paymentStatus,
      updatedAt: order.updatedAt
    });
  }

  const allowed = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(400, `Không thể chuyển trạng thái từ ${order.status} sang ${nextStatus}`);
  }

  order.status = nextStatus;
  await order.save();

  res.json({
    id: order._id,
    orderCode: order.orderCode,
    status: order.status,
    paymentStatus: order.paymentStatus,
    updatedAt: order.updatedAt
  });
});

module.exports = { createStoreOrder, getStoreOrders, updateStoreOrderStatus };
