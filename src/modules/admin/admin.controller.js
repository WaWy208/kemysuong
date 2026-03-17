const asyncHandler = require('../../utils/asyncHandler');
const adminService = require('./admin.service');

const dashboardSummary = asyncHandler(async (_req, res) => {
  const data = await adminService.getDashboardSummary();
  res.json(data);
});

const revenueDaily = asyncHandler(async (req, res) => {
  const days = Math.max(1, Number(req.query.days || 30));
  const data = await adminService.getRevenueDaily(days);
  res.json(data);
});

const topSelling = asyncHandler(async (req, res) => {
  const limit = Math.max(1, Math.min(Number(req.query.limit || 10), 50));
  const data = await adminService.getTopSelling(limit);
  res.json(data);
});

module.exports = {
  dashboardSummary,
  revenueDaily,
  topSelling
};
