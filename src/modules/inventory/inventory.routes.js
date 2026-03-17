const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const { ROLES } = require('../../constants/enums');
const InventoryAlert = require('./inventoryAlert.model');

const router = Router();

const idSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).default({})
});

router.get('/', authRequired, requireRole(ROLES.ADMIN), async (_req, res, next) => {
  try {
    const items = await InventoryAlert.find({}).sort({ createdAt: -1 }).populate('productId', 'name slug inventoryCount').lean();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/resolve', authRequired, requireRole(ROLES.ADMIN), validate(idSchema), async (req, res, next) => {
  try {
    const item = await InventoryAlert.findByIdAndUpdate(req.params.id, { resolved: true }, { new: true });
    if (!item) return next({ statusCode: 404, message: 'Alert not found' });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
