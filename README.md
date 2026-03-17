# Ice Cream E-commerce API

Project backend e-commerce fullstack cho website ban hang kem, da trien khai day du cac nhom tinh nang theo 5 giai doan.

## Giai doan 1 - Core E-commerce
- Product CRUD
- Category
- Search (`keyword`)
- Filter gia (`minPrice`, `maxPrice`)
- Pagination (`page`, `limit`)
- Sort (`price`, `newest`, `popular`)
- Cart server-side (`carts`, `cart_items`)
- Checkout tu item va tu cart
- Tru ton kho tu dong khi tao don

## Giai doan 2 - Payment gateways
- Stripe checkout session + webhook
- VNPay redirect URL + callback verify hash
- Momo create payment + webhook verify signature
- Payment status sync vao `orders` + `payments`

## Giai doan 3 - Admin Dashboard
- Tong quan users/catalog/orders/revenue/top selling
- Revenue theo ngay: `GET /api/v1/admin/dashboard/revenue-daily`
- Top ban chay: `GET /api/v1/admin/dashboard/top-selling`
- Quan ly san pham/users/orders thong qua cac route admin hien co

## Giai doan 4 - Professional optimization
- Redis cache cho list product
- SEO assets: `robots.txt`, `sitemap.xml`
- Structured data `schema.org` trong `index.html`
- Bao mat: bcrypt, JWT, rate limiting, input validation, CSRF middleware

## Giai doan 5 - CV impress features
- Wishlist
- Review & Rating (co moderation)
- Coupon (percent/fixed, min order, usage)
- Flash Sale theo san pham
- Inventory low-stock alert
- Email notification (order confirmation + low stock)

## Tech stack
- Node.js, Express.js
- MongoDB + Mongoose
- JWT auth + RBAC (`ADMIN`, `CUSTOMER`)
- Zod validation
- Redis (optional)
- Stripe, VNPay, Momo integrations
- Nodemailer
- Jest + Supertest
- Docker

## Main APIs
- Auth: `/api/v1/auth/*`
- Products: `/api/v1/products`
- Carts: `/api/v1/carts/*`
- Orders: `/api/v1/orders/*`
- Payments: `/api/v1/payments/*`
- Wishlist: `/api/v1/wishlist/*`
- Reviews: `/api/v1/reviews/*`
- Coupons: `/api/v1/coupons/*`
- Flash Sales: `/api/v1/flash-sales/*`
- Admin: `/api/v1/admin/*`

## API docs
- Swagger UI: `/api-docs`
- OpenAPI JSON: `/api-docs/openapi.json`

## Run local
```bash
npm install
cp .env.example .env
npm run migrate
npm run dev
```

## Test
```bash
npm test
```

## Docker
```bash
docker build -t ice-cream-api .
docker run -p 4000:4000 --env-file .env ice-cream-api
```

## Luu y deploy payment that
- Stripe: set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- VNPay: set `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`
- Momo: set `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`
