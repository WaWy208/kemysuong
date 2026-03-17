const { ROLES, ORDER_STATUS } = require('../../constants/enums');
const adminRepository = require('./admin.repository');

async function getDashboardSummary() {
  const [
    totalCustomers,
    totalAdmins,
    totalActiveUsers,
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    topProducts
  ] = await Promise.all([
    adminRepository.countUsers({ role: ROLES.CUSTOMER }),
    adminRepository.countUsers({ role: ROLES.ADMIN }),
    adminRepository.countUsers({ isActive: true }),
    adminRepository.countProducts({ isArchived: false }),
    adminRepository.countCategories({ isActive: true }),
    adminRepository.countOrders(),
    adminRepository.countOrders({ status: ORDER_STATUS.PENDING }),
    adminRepository.countOrders({ status: ORDER_STATUS.COMPLETED }),
    adminRepository.countOrders({ status: ORDER_STATUS.CANCELLED }),
    adminRepository.sumCompletedRevenue(),
    adminRepository.topSellingProducts(5)
  ]);

  return {
    users: {
      totalCustomers,
      totalAdmins,
      totalActiveUsers
    },
    catalog: {
      totalProducts,
      totalCategories
    },
    orders: {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders
    },
    revenue: {
      totalRevenue
    },
    topProducts
  };
}

async function getRevenueDaily(days) {
  return adminRepository.revenueByDay(days);
}

async function getTopSelling(limit) {
  return adminRepository.topSellingProducts(limit);
}

module.exports = {
  getDashboardSummary,
  getRevenueDaily,
  getTopSelling
};
