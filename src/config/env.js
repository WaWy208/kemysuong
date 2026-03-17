﻿const dotenv = require('dotenv');

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || (isProduction ? 10000 : 4000)),
  appBaseUrl: process.env.APP_BASE_URL || (isProduction ? 'https://kem-y-suong-api.onrender.com' : 'http://localhost:4000'),
  frontendUrl: process.env.FRONTEND_URL || (isProduction ? 'https://kem-y-suong.vercel.app' : 'http://localhost:4000'),
  mongoUri: required('MONGO_URI'),
  corsOrigin: process.env.CORS_ORIGIN || (isProduction ? 'https://kem-y-suong.vercel.app,https://ice-cream-123.vercel.app' : 'http://localhost:4000'),
  accessSecret: required('JWT_ACCESS_SECRET'),
  refreshSecret: required('JWT_REFRESH_SECRET'),
  accessExpires: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  refreshExpires: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  redisUrl: process.env.REDIS_URL || '',
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'change-me-payment-secret',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL || (isProduction ? 'https://kem-y-suong.vercel.app/#payment-success' : 'http://localhost:4000/#payment-success'),
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL || (isProduction ? 'https://kem-y-suong.vercel.app/#payment-cancel' : 'http://localhost:4000/#payment-cancel'),
  vnpayTmnCode: process.env.VNPAY_TMN_CODE || '',
  vnpayHashSecret: process.env.VNPAY_HASH_SECRET || '',
  vnpayUrl: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnpayReturnUrl: process.env.VNPAY_RETURN_URL || (isProduction ? 'https://kem-y-suong-api.onrender.com/api/v1/payments/callback/vnpay' : 'http://localhost:4000/api/v1/payments/callback/vnpay'),
  momoPartnerCode: process.env.MOMO_PARTNER_CODE || '',
  momoAccessKey: process.env.MOMO_ACCESS_KEY || '',
  momoSecretKey: process.env.MOMO_SECRET_KEY || '',
  momoEndpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  momoReturnUrl: process.env.MOMO_RETURN_URL || (isProduction ? 'https://kem-y-suong-api.onrender.com/api/v1/payments/callback/momo' : 'http://localhost:4000/api/v1/payments/callback/momo'),
  momoNotifyUrl: process.env.MOMO_NOTIFY_URL || (isProduction ? 'https://kem-y-suong-api.onrender.com/api/v1/payments/webhook/momo' : 'http://localhost:4000/api/v1/payments/webhook/momo'),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  mailFrom: process.env.MAIL_FROM || 'no-reply@ice-cream.local',
  lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD || 10)
};

