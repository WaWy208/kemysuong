const Cart = require('./cart.model');
const CartItem = require('./cartItem.model');

async function getOrCreateCart(userId) {
  const existing = await Cart.findOne({ userId });
  if (existing) return existing;
  return Cart.create({ userId });
}

function findCartByUserId(userId) {
  return Cart.findOne({ userId });
}

function findItemsByCartId(cartId) {
  return CartItem.find({ cartId }).lean();
}

function findItem(cartId, productId) {
  return CartItem.findOne({ cartId, productId });
}

function createItem(payload) {
  return CartItem.create(payload);
}

function updateItemQuantity(cartId, productId, quantity) {
  return CartItem.findOneAndUpdate({ cartId, productId }, { quantity }, { new: true, runValidators: true });
}

function removeItem(cartId, productId) {
  return CartItem.findOneAndDelete({ cartId, productId });
}

function clearItems(cartId) {
  return CartItem.deleteMany({ cartId });
}

module.exports = {
  getOrCreateCart,
  findCartByUserId,
  findItemsByCartId,
  findItem,
  createItem,
  updateItemQuantity,
  removeItem,
  clearItems
};
