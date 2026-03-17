const Stripe = require('stripe');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const env = require('../../config/env');
const { ROLES, PAYMENT_STATUS, ORDER_STATUS } = require('../../constants/enums');
const Order = require('../orders/order.model');
const Payment = require('./payment.model');
const {
  normalizePaymentPayload,
  signPaymentPayload,
  verifyPaymentSignature,
  signVnpay,
  verifyVnpay,
  signMomo,
  sortObjectByKey,
  toQueryString
} = require('./payments.utils');

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

function canAccessOrder(order, auth) {
  if (!order || !auth) return false;
  if (auth.role === ROLES.ADMIN) return true;
  return String(order.userId) === String(auth.sub);
}

async function applyGatewayResult(payload) {
  const normalized = normalizePaymentPayload(payload);
  const order = await Order.findById(normalized.orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  if (normalized.amount !== Number(order.totalAmount)) {
    throw new ApiError(400, 'Payment amount mismatch');
  }

  const isPaid = normalized.status === PAYMENT_STATUS.PAID;
  order.paymentStatus = isPaid ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;
  if (isPaid && order.status === ORDER_STATUS.PENDING) {
    order.status = ORDER_STATUS.CONFIRMED;
  }
  if (!isPaid && order.status === ORDER_STATUS.PENDING) {
    order.status = ORDER_STATUS.CANCELLED;
  }
  await order.save();

  await Payment.findOneAndUpdate(
    { orderId: order._id },
    {
      orderId: order._id,
      amount: normalized.amount,
      method: normalized.provider,
      status: order.paymentStatus,
      transactionId: normalized.transactionId
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    orderId: String(order._id),
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    transactionId: normalized.transactionId,
    provider: normalized.provider
  };
}

async function buildStripeCheckout(order) {
  if (!stripe) throw new ApiError(400, 'Stripe is not configured');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'vnd',
          product_data: { name: `Order ${order._id}` },
          unit_amount: Math.round(Number(order.totalAmount))
        },
        quantity: 1
      }
    ],
    success_url: `${env.stripeSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.stripeCancelUrl,
    metadata: { orderId: String(order._id) }
  });

  return {
    provider: 'stripe',
    orderId: String(order._id),
    amount: Number(order.totalAmount),
    checkoutUrl: session.url,
    sessionId: session.id
  };
}

function buildVnpayCheckout(order) {
  if (!env.vnpayTmnCode || !env.vnpayHashSecret) {
    throw new ApiError(400, 'VNPay is not configured');
  }

  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const createDate = `${y}${mo}${d}${h}${mi}${s}`;

  const txnRef = `${String(order._id).slice(-8)}${Date.now()}`;
  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: env.vnpayTmnCode,
    vnp_Amount: Math.round(Number(order.totalAmount) * 100),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: env.vnpayReturnUrl,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: createDate,
    orderId: String(order._id)
  };

  const sorted = sortObjectByKey(params);
  const hash = signVnpay(sorted, env.vnpayHashSecret);
  const checkoutUrl = `${env.vnpayUrl}?${toQueryString({ ...sorted, vnp_SecureHash: hash })}`;

  return {
    provider: 'vnpay',
    orderId: String(order._id),
    amount: Number(order.totalAmount),
    checkoutUrl,
    transactionRef: txnRef
  };
}

async function buildMomoCheckout(order) {
  if (!env.momoPartnerCode || !env.momoAccessKey || !env.momoSecretKey) {
    throw new ApiError(400, 'Momo is not configured');
  }

  const requestId = `${order._id}-${Date.now()}`;
  const momoOrderId = `${order._id}-${Date.now()}`;
  const amount = String(Math.round(Number(order.totalAmount)));
  const orderInfo = `Thanh toan don hang ${order._id}`;
  const extraData = Buffer.from(String(order._id)).toString('base64');

  const rawSignature =
    `accessKey=${env.momoAccessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${env.momoNotifyUrl}` +
    `&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${env.momoPartnerCode}` +
    `&redirectUrl=${env.momoReturnUrl}&requestId=${requestId}&requestType=captureWallet`;

  const signature = signMomo(rawSignature, env.momoSecretKey);

  const response = await fetch(env.momoEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partnerCode: env.momoPartnerCode,
      partnerName: 'Ice Cream Shop',
      storeId: 'ice-cream-shop',
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo,
      redirectUrl: env.momoReturnUrl,
      ipnUrl: env.momoNotifyUrl,
      lang: 'vi',
      requestType: 'captureWallet',
      autoCapture: true,
      extraData,
      signature
    })
  });

  const data = await response.json();
  if (!response.ok || data.resultCode !== 0) {
    throw new ApiError(400, data.message || 'Momo create payment failed');
  }

  return {
    provider: 'momo',
    orderId: String(order._id),
    amount: Number(order.totalAmount),
    checkoutUrl: data.payUrl,
    transactionRef: momoOrderId
  };
}

const createCheckoutSession = asyncHandler(async (req, res) => {
  const provider = String(req.body.provider || 'demo').toLowerCase();
  const order = await Order.findById(req.body.orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (!canAccessOrder(order, req.auth)) throw new ApiError(403, 'Forbidden');

  let result;
  if (provider === 'stripe') result = await buildStripeCheckout(order);
  else if (provider === 'vnpay') result = buildVnpayCheckout(order);
  else if (provider === 'momo') result = await buildMomoCheckout(order);
  else {
    const payload = normalizePaymentPayload({
      provider,
      orderId: String(order._id),
      status: PAYMENT_STATUS.PAID,
      amount: Number(order.totalAmount),
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString()
    });
    const signature = signPaymentPayload(payload, env.paymentWebhookSecret);
    result = {
      provider: payload.provider,
      orderId: payload.orderId,
      amount: payload.amount,
      checkoutUrl: `${env.appBaseUrl}/api/v1/payments/demo/redirect?orderId=${payload.orderId}`,
      webhook: {
        method: 'POST',
        url: `${env.appBaseUrl}/api/v1/payments/webhook/${payload.provider}`,
        payload: { ...payload, signature }
      }
    };
  }

  res.json(result);
});

async function handleStripeWebhookLogic(req, res) {
  if (!stripe || !env.stripeWebhookSecret) {
    throw new ApiError(400, 'Stripe webhook is not configured');
  }

  const signature = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.rawBody || '', signature, env.stripeWebhookSecret);

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    const orderId = session.metadata && session.metadata.orderId;
    if (orderId) {
      await applyGatewayResult({
        provider: 'stripe',
        orderId,
        status: PAYMENT_STATUS.PAID,
        amount: Number(session.amount_total || 0),
        transactionId: String(session.payment_intent || session.id),
        timestamp: new Date().toISOString()
      });
    }
  }

  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object;
    const orderId = session.metadata && session.metadata.orderId;
    if (orderId) {
      await applyGatewayResult({
        provider: 'stripe',
        orderId,
        status: PAYMENT_STATUS.FAILED,
        amount: Number(session.amount_total || 0),
        transactionId: String(session.payment_intent || session.id),
        timestamp: new Date().toISOString()
      });
    }
  }

  res.json({ received: true });
}

const handleGatewayWebhook = asyncHandler(async (req, res) => {
  const provider = String(req.params.provider || '').trim().toLowerCase();

  if (provider === 'stripe') {
    await handleStripeWebhookLogic(req, res);
    return;
  }

  if (provider === 'momo') {
    const signature = String(req.body.signature || '');
    const rawSignature =
      `accessKey=${env.momoAccessKey}&amount=${req.body.amount}&extraData=${req.body.extraData}` +
      `&message=${req.body.message}&orderId=${req.body.orderId}&orderInfo=${req.body.orderInfo}` +
      `&orderType=${req.body.orderType}&partnerCode=${req.body.partnerCode}&payType=${req.body.payType}` +
      `&requestId=${req.body.requestId}&responseTime=${req.body.responseTime}` +
      `&resultCode=${req.body.resultCode}&transId=${req.body.transId}`;
    const expected = signMomo(rawSignature, env.momoSecretKey);
    if (expected !== signature) throw new ApiError(401, 'Invalid momo signature');

    const orderId = Buffer.from(String(req.body.extraData || ''), 'base64').toString('utf8');
    const result = await applyGatewayResult({
      provider: 'momo',
      orderId,
      status: Number(req.body.resultCode) === 0 ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED,
      amount: Number(req.body.amount),
      transactionId: String(req.body.transId || req.body.orderId),
      timestamp: new Date().toISOString()
    });

    res.json({ ok: true, result });
    return;
  }

  const payload = normalizePaymentPayload({ ...req.body, provider });
  const signature = String(req.body.signature || '');
  const isValid = verifyPaymentSignature(payload, signature, env.paymentWebhookSecret);
  if (!isValid) throw new ApiError(401, 'Invalid payment signature');

  const result = await applyGatewayResult(payload);
  res.json({ ok: true, result });
});

const handleGatewayCallback = asyncHandler(async (req, res) => {
  const provider = String(req.params.provider || '').toLowerCase();

  if (provider === 'vnpay') {
    const secureHash = req.query.vnp_SecureHash;
    const isValid = verifyVnpay(req.query, secureHash, env.vnpayHashSecret);
    if (!isValid) throw new ApiError(401, 'Invalid VNPay signature');

    const orderId = String(req.query.orderId || '');
    const amount = Number(req.query.vnp_Amount || 0) / 100;
    const paid = String(req.query.vnp_ResponseCode || '') === '00';

    const result = await applyGatewayResult({
      provider: 'vnpay',
      orderId,
      status: paid ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED,
      amount,
      transactionId: String(req.query.vnp_TransactionNo || req.query.vnp_TxnRef || ''),
      timestamp: new Date().toISOString()
    });

    res.json({ ok: true, result });
    return;
  }

  if (provider === 'momo') {
    const status = Number(req.query.resultCode || 1) === 0 ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;
    res.json({ ok: true, provider: 'momo', status, orderId: req.query.orderId || null, message: req.query.message || '' });
    return;
  }

  res.json({ ok: true, provider, message: 'Callback received' });
});

const getOrderPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (!canAccessOrder(order, req.auth)) throw new ApiError(403, 'Forbidden');

  const payment = await Payment.findOne({ orderId: order._id }).lean();
  res.json({ orderId: String(order._id), paymentStatus: order.paymentStatus, payment: payment || null });
});

const demoRedirect = asyncHandler(async (req, res) => {
  const orderId = String(req.query.orderId || '').trim();
  if (!orderId) throw new ApiError(400, 'Missing orderId');
  res.json({
    message: 'Demo redirect endpoint is ready. Use /api/v1/payments/checkout-session then POST the signed payload to webhook.',
    orderId
  });
});

module.exports = {
  createCheckoutSession,
  handleGatewayWebhook,
  handleGatewayCallback,
  getOrderPayment,
  demoRedirect
};
