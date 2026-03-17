const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error('Missing MONGO_URI');
}

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET');
}

const User = require('../src/modules/users/user.model');
const Category = require('../src/modules/categories/category.model');
const Product = require('../src/modules/products/product.model');
const Cart = require('../src/modules/carts/cart.model');
const CartItem = require('../src/modules/carts/cartItem.model');
const Coupon = require('../src/modules/coupons/coupon.model');
const FlashSale = require('../src/modules/flashSales/flashSale.model');
const WishlistItem = require('../src/modules/wishlist/wishlist.model');
const Review = require('../src/modules/reviews/review.model');
const InventoryAlert = require('../src/modules/inventory/inventoryAlert.model');
const Order = require('../src/modules/orders/order.model');
const Payment = require('../src/modules/payments/payment.model');

async function ensureAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'System Admin';

  if (!email || !password) return;

  const existed = await User.findOne({ email });
  if (existed) {
    console.log(`[migrate] admin exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email,
    passwordHash,
    role: 'ADMIN',
    isActive: true
  });

  console.log(`[migrate] admin created: ${email}`);
}

async function run() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([
    User.syncIndexes(),
    Category.syncIndexes(),
    Product.syncIndexes(),
    Cart.syncIndexes(),
    CartItem.syncIndexes(),
    Coupon.syncIndexes(),
    FlashSale.syncIndexes(),
    WishlistItem.syncIndexes(),
    Review.syncIndexes(),
    InventoryAlert.syncIndexes(),
    Order.syncIndexes(),
    Payment.syncIndexes()
  ]);

  await ensureAdmin();
  await mongoose.disconnect();
  console.log('[migrate] done');
}

run().catch(async (error) => {
  console.error('[migrate] failed', error);
  try {
    await mongoose.disconnect();
  } catch (_err) {
    // ignore disconnect errors on failure path
  }
  process.exit(1);
});
