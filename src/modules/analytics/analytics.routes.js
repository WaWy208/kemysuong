const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { ROLES } = require('../../constants/enums');
const { overview, revenue, topProducts } = require('./analytics.controller');

const router = Router();
router.use(authRequired, requireRole(ROLES.ADMIN));
router.get('/overview', overview);
router.get('/revenue', revenue);
router.get('/top-products', topProducts);

module.exports = router;
