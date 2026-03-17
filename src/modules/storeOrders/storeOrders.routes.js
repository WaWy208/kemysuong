const { Router } = require('express');
const { validate, z } = require('../../middlewares/validate');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { ROLES } = require('../../constants/enums');
const { createStoreOrder, getStoreOrders, updateStoreOrderStatus } = require('./storeOrders.controller');

const router = Router();

const createStoreOrderSchema = z.object({
  body: z.object({
    orderCode: z.string().min(6).max(32),
    customerName: z.string().min(2).max(120),
    phone: z.string().min(8).max(20),
    orderType: z.enum(['DELIVERY', 'PICKUP']),
    address: z.string().min(3).max(300),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'AUTO_GATEWAY']),
    paymentStatus: z.enum(['UNPAID', 'WAITING_TRANSFER', 'PAID', 'PENDING']),
    transactionId: z.string().max(64).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().max(80).optional(),
          name: z.string().min(1).max(180),
          unitPrice: z.number().nonnegative(),
          quantity: z.number().int().positive(),
          lineTotal: z.number().nonnegative()
        })
      )
      .min(1),
    subtotal: z.number().nonnegative(),
    discount: z.number().nonnegative(),
    shipping: z.number().nonnegative(),
    total: z.number().nonnegative()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const getStoreOrdersSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    phone: z.string().min(1).max(20).optional(),
    status: z.enum(['PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['UNPAID', 'WAITING_TRANSFER', 'PAID', 'PENDING']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional()
  }).default({})
});

const updateStoreOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED'])
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

router.post('/', validate(createStoreOrderSchema), createStoreOrder);
router.get('/', authRequired, requireRole(ROLES.ADMIN), validate(getStoreOrdersSchema), getStoreOrders);
router.patch('/:id/status', authRequired, requireRole(ROLES.ADMIN), validate(updateStoreOrderStatusSchema), updateStoreOrderStatus);

module.exports = router;
