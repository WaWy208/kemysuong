const Order = require('../orders/order.model');
const User = require('../users/user.model');
const Product = require('../products/product.model');
const Category = require('../categories/category.model');

function countUsers(filter = {}) {
  return User.countDocuments(filter);
}

function countProducts(filter = {}) {
  return Product.countDocuments(filter);
}

function countCategories(filter = {}) {
  return Category.countDocuments(filter);
}

function countOrders(filter = {}) {
  return Order.countDocuments(filter);
}

async function sumCompletedRevenue() {
  const data = await Order.aggregate([
    { $match: { status: 'COMPLETED' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  return data[0] ? data[0].total : 0;
}

async function topSellingProducts(limit = 5) {
  return Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.productId',
        name: { $first: '$orderItems.nameSnapshot' },
        soldQuantity: { $sum: '$orderItems.quantity' },
        revenue: { $sum: '$orderItems.subtotal' }
      }
    },
    { $sort: { soldQuantity: -1 } },
    { $limit: limit }
  ]);
}

async function revenueByDay(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  return Order.aggregate([
    { $match: { status: 'COMPLETED', createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          y: { $year: '$createdAt' },
          m: { $month: '$createdAt' },
          d: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } }
  ]);
}

module.exports = {
  countUsers,
  countProducts,
  countCategories,
  countOrders,
  sumCompletedRevenue,
  topSellingProducts,
  revenueByDay
};
