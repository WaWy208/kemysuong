const ApiError = require('../../utils/apiError');
const Product = require('../products/product.model');
const cartsRepository = require('./carts.repository');

async function getCartSummary(userId) {
  const cart = await cartsRepository.getOrCreateCart(userId);
  const items = await cartsRepository.findItemsByCartId(cart._id);

  if (!items.length) {
    return { cartId: cart._id, items: [], totalItems: 0, subtotal: 0 };
  }

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isArchived: false }).lean();
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const enrichedItems = items
    .map((item) => {
      const product = productMap.get(String(item.productId));
      if (!product) return null;

      const lineTotal = product.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        name: product.name,
        slug: product.slug,
        price: product.price,
        thumbnail: product.imageUrl,
        stock: product.inventoryCount,
        lineTotal
      };
    })
    .filter(Boolean);

  const subtotal = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalItems = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

  return { cartId: cart._id, items: enrichedItems, totalItems, subtotal };
}

async function addItem(userId, payload) {
  const cart = await cartsRepository.getOrCreateCart(userId);
  const product = await Product.findOne({ _id: payload.productId, isArchived: false, isAvailable: true });
  if (!product) throw new ApiError(404, 'Product not found');

  const existing = await cartsRepository.findItem(cart._id, payload.productId);
  const nextQuantity = (existing ? existing.quantity : 0) + payload.quantity;

  if (nextQuantity > product.inventoryCount) {
    throw new ApiError(400, 'Quantity exceeds stock');
  }

  if (existing) {
    await cartsRepository.updateItemQuantity(cart._id, payload.productId, nextQuantity);
  } else {
    await cartsRepository.createItem({ cartId: cart._id, productId: payload.productId, quantity: payload.quantity });
  }

  return getCartSummary(userId);
}

async function updateItem(userId, payload) {
  const cart = await cartsRepository.findCartByUserId(userId);
  if (!cart) throw new ApiError(404, 'Cart not found');

  const existing = await cartsRepository.findItem(cart._id, payload.productId);
  if (!existing) throw new ApiError(404, 'Cart item not found');

  if (payload.quantity <= 0) {
    await cartsRepository.removeItem(cart._id, payload.productId);
    return getCartSummary(userId);
  }

  const product = await Product.findOne({ _id: payload.productId, isArchived: false, isAvailable: true });
  if (!product) throw new ApiError(404, 'Product not found');

  if (payload.quantity > product.inventoryCount) {
    throw new ApiError(400, 'Quantity exceeds stock');
  }

  await cartsRepository.updateItemQuantity(cart._id, payload.productId, payload.quantity);
  return getCartSummary(userId);
}

async function removeItem(userId, productId) {
  const cart = await cartsRepository.findCartByUserId(userId);
  if (!cart) throw new ApiError(404, 'Cart not found');

  await cartsRepository.removeItem(cart._id, productId);
  return getCartSummary(userId);
}

async function clearCart(userId) {
  const cart = await cartsRepository.getOrCreateCart(userId);
  await cartsRepository.clearItems(cart._id);
  return { message: 'Cart cleared' };
}

async function getCheckoutItems(userId) {
  const cart = await cartsRepository.findCartByUserId(userId);
  if (!cart) throw new ApiError(400, 'Cart is empty');

  const items = await cartsRepository.findItemsByCartId(cart._id);
  if (!items.length) throw new ApiError(400, 'Cart is empty');

  return items.map((item) => ({
    productId: String(item.productId),
    quantity: item.quantity
  }));
}

module.exports = {
  getCartSummary,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  getCheckoutItems
};
