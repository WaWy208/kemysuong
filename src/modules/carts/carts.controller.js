const asyncHandler = require('../../utils/asyncHandler');
const cartsService = require('./carts.service');

const getMyCart = asyncHandler(async (req, res) => {
  const data = await cartsService.getCartSummary(req.auth.sub);
  res.json(data);
});

const addCartItem = asyncHandler(async (req, res) => {
  const data = await cartsService.addItem(req.auth.sub, req.body);
  res.json(data);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const data = await cartsService.updateItem(req.auth.sub, req.body);
  res.json(data);
});

const removeCartItem = asyncHandler(async (req, res) => {
  const data = await cartsService.removeItem(req.auth.sub, req.params.productId);
  res.json(data);
});

const clearMyCart = asyncHandler(async (req, res) => {
  const data = await cartsService.clearCart(req.auth.sub);
  res.json(data);
});

module.exports = {
  getMyCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearMyCart
};
