const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const { ROLES, PAYMENT_METHOD, ORDER_STATUS } = require('../../constants/enums');
const { createOrder, checkoutCart, getMyOrders, getAllOrders, updateOrderStatus } = require('./orders.controller');

const router = Router();

const checkoutSchemaBase = z.object({
  deliveryAddress: z.string().min(3),
  phoneNumber: z.string().min(8),
  paymentMethod: z.nativeEnum(PAYMENT_METHOD),
  notes: z.string().optional(),
  couponCode: z.string().optional()
});

const createOrderSchema = z.object({
  body: checkoutSchemaBase.extend({
    items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() })).min(1)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const checkoutCartSchema = z.object({
  body: checkoutSchemaBase,
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const updateStatusSchema = z.object({
  body: z.object({ status: z.nativeEnum(ORDER_STATUS) }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).default({})
});

router.post('/', authRequired, validate(createOrderSchema), createOrder);
router.post('/checkout/cart', authRequired, validate(checkoutCartSchema), checkoutCart);
router.get('/me', authRequired, getMyOrders);
router.get('/', authRequired, requireRole(ROLES.ADMIN), getAllOrders);
router.patch('/:id/status', authRequired, requireRole(ROLES.ADMIN), validate(updateStatusSchema), updateOrderStatus);

module.exports = router;
