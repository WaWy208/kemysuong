const { Router } = require('express');
const { authRequired } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const { getMyCart, addCartItem, updateCartItem, removeCartItem, clearMyCart } = require('./carts.controller');

const router = Router();

const emptySchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const addItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().positive()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const updateItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(0)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const removeItemSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({ productId: z.string().min(1) }),
  query: z.object({}).default({})
});

router.get('/me', authRequired, validate(emptySchema), getMyCart);
router.post('/items', authRequired, validate(addItemSchema), addCartItem);
router.patch('/items', authRequired, validate(updateItemSchema), updateCartItem);
router.delete('/items/:productId', authRequired, validate(removeItemSchema), removeCartItem);
router.delete('/me', authRequired, validate(emptySchema), clearMyCart);

module.exports = router;
