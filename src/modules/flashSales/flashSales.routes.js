const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const { ROLES } = require('../../constants/enums');
const FlashSale = require('./flashSale.model');

const router = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    productId: z.string().min(1),
    discountPercent: z.coerce.number().min(0).max(100).optional().default(0),
    flashPrice: z.coerce.number().nonnegative().optional().default(0),
    startAt: z.string().min(1),
    endAt: z.string().min(1),
    maxQuantity: z.coerce.number().int().nonnegative().optional().default(0),
    isActive: z.boolean().optional().default(true)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

router.get('/', async (_req, res, next) => {
  try {
    const items = await FlashSale.find({}).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/', authRequired, requireRole(ROLES.ADMIN), validate(createSchema), async (req, res, next) => {
  try {
    const created = await FlashSale.create({
      ...req.body,
      startAt: new Date(req.body.startAt),
      endAt: new Date(req.body.endAt)
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
