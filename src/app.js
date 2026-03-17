const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const path = require('path');

const env = require('./config/env');

if (process.env.NODE_ENV === 'production') {
  console.log('[DEBUG] Production Environment Config:');
  console.log('[DEBUG] APP_BASE_URL:', env.appBaseUrl);
  console.log('[DEBUG] FRONTEND_URL:', env.frontendUrl);
  console.log('[DEBUG] CORS_ORIGIN:', env.corsOrigin);
  console.log('[DEBUG] PORT:', env.port);
}

const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const { getOpenApiSpec, renderSwaggerUiHtml } = require('./docs/openapi');
const { csrfTokenRoute, csrfProtection } = require('./middlewares/csrf');

const authRoutes = require('./modules/auth/auth.routes');
const authSeedRoutes = require('./modules/auth/auth.seed');
const usersRoutes = require('./modules/users/users.routes');
const categoriesRoutes = require('./modules/categories/categories.routes');
const productsRoutes = require('./modules/products/products.routes');
const cartsRoutes = require('./modules/carts/carts.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const uploadsRoutes = require('./modules/uploads/uploads.routes');
const wishlistRoutes = require('./modules/wishlist/wishlist.routes');
const reviewsRoutes = require('./modules/reviews/reviews.routes');
const couponsRoutes = require('./modules/coupons/coupons.routes');
const flashSalesRoutes = require('./modules/flashSales/flashSales.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const storeOrdersRoutes = require('./modules/storeOrders/storeOrders.routes');
const menuRoutes = require('./modules/menu/menu.routes');

const app = express();

app.use(helmet());
const configuredOrigins = [
  ...String(env.corsOrigin || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  String(env.frontendUrl || '').trim(),
  String(env.appBaseUrl || '').trim()
].filter(Boolean);
const allowedOrigins = Array.from(new Set(configuredOrigins));

if (process.env.NODE_ENV === 'production') {
  console.log('[DEBUG] Allowed Origins:', allowedOrigins);
}

function normalizeOrigin(value) {
  try {
    return new URL(String(value || '').trim()).origin;
  } catch (_error) {
    return String(value || '').trim().replace(/\/+$/, '');
  }
}

function isAllowedOrigin(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;
  if (allowedOrigins.map(normalizeOrigin).includes(normalizedOrigin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin)) return true;

  const hasVercelFrontend = allowedOrigins.some((item) => /\.vercel\.app$/i.test(normalizeOrigin(item)));
  if (hasVercelFrontend && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)) return true;

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(
  express.json({
    limit: '5mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    }
  })
);
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(csrfProtection);

app.use(express.static(path.join(process.cwd())));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Ice Cream Shop API' });
});

app.get('/api/v1/security/csrf-token', csrfTokenRoute);

app.get('/api-docs/openapi.json', (_req, res) => {
  res.json(getOpenApiSpec(env.appBaseUrl));
});

app.get('/api-docs', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderSwaggerUiHtml('/api-docs/openapi.json'));
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/auth', authSeedRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/carts', cartsRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/uploads', uploadsRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/coupons', couponsRoutes);
app.use('/api/v1/flash-sales', flashSalesRoutes);
app.use('/api/v1/inventory-alerts', inventoryRoutes);
app.use('/api/v1/store/orders', storeOrdersRoutes);
app.use('/api/v1/menu', menuRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
