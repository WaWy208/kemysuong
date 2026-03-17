const { Router } = require('express');
const { authRequired } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const {
  createCheckoutSession,
  handleGatewayWebhook,
  handleGatewayCallback,
  getOrderPayment,
  demoRedirect
} = require('./payments.controller');

const router = Router();

const checkoutSessionSchema = z.object({
  body: z.object({
    orderId: z.string().min(1),
    provider: z.enum(['demo', 'stripe', 'vnpay', 'momo']).default('demo')
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const getOrderPaymentSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    orderId: z.string().min(1)
  }),
  query: z.object({}).default({})
});

const demoRedirectSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    orderId: z.string().min(1)
  })
});

router.post('/checkout-session', authRequired, validate(checkoutSessionSchema), createCheckoutSession);
router.post('/webhook/:provider', handleGatewayWebhook);
router.get('/callback/:provider', handleGatewayCallback);
router.get('/order/:orderId', authRequired, validate(getOrderPaymentSchema), getOrderPayment);
router.get('/demo/redirect', validate(demoRedirectSchema), demoRedirect);

module.exports = router;
