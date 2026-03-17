const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { ROLES } = require('../../constants/enums');
const { dashboardSummary, revenueDaily, topSelling } = require('./admin.controller');

const router = Router();

router.get('/dashboard', authRequired, requireRole(ROLES.ADMIN), dashboardSummary);
router.get('/dashboard/revenue-daily', authRequired, requireRole(ROLES.ADMIN), revenueDaily);
router.get('/dashboard/top-selling', authRequired, requireRole(ROLES.ADMIN), topSelling);

module.exports = router;
