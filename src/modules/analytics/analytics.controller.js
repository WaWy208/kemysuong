const asyncHandler = require('../../utils/asyncHandler');
const Order = require('../orders/order.model');
const Product = require('../products/product.model');
const { ORDER_STATUS } = require('../../constants/enums');

const overview = asyncHandler(async (_req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [completed, todayCompleted, totalOrders, totalProducts] = await Promise.all([
    Order.aggregate([
      { $match: { status: ORDER_STATUS.COMPLETED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: ORDER_STATUS.COMPLETED, createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.countDocuments(),
    Product.countDocuments({ isArchived: false })
  ]);

  res.json({
    totalRevenue: completed[0]?.total || 0,
    todayRevenue: todayCompleted[0]?.total || 0,
    totalOrders,
    totalProducts
  });
});

const revenue = asyncHandler(async (req, res) => {
  const range = req.query.range || '7d';
  const days = Number(range.replace('d', '')) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  const data = await Order.aggregate([
    { $match: { status: ORDER_STATUS.COMPLETED, createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          y: { $year: '$createdAt' },
          m: { $month: '$createdAt' },
          d: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } }
  ]);

  res.json(data);
});

const topProducts = asyncHandler(async (_req, res) => {
  const data = await Order.aggregate([
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
    { $limit: 5 }
  ]);

  res.json(data);
});

module.exports = { overview, revenue, topProducts };
