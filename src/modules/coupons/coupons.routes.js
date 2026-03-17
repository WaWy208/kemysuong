const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const { ROLES } = require('../../constants/enums');
const Coupon = require('./coupon.model');
const { resolveCouponDiscount } = require('./coupons.service');

const router = Router();

const createSchema = z.object({
  body: z.object({
    code: z.string().min(3),
    discountType: z.enum(['PERCENT', 'FIXED']),
    discountValue: z.coerce.number().positive(),
    minOrderValue: z.coerce.number().nonnegative().optional().default(0),
    maxDiscountValue: z.coerce.number().nonnegative().optional().default(0),
    startAt: z.string().min(1),
    endAt: z.string().min(1),
    usageLimit: z.coerce.number().int().nonnegative().optional().default(0),
    isActive: z.boolean().optional().default(true)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const validateSchema = z.object({
  body: z.object({
    code: z.string().min(3),
    subtotal: z.coerce.number().nonnegative()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

router.get('/', async (_req, res, next) => {
  try {
    const items = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/', authRequired, requireRole(ROLES.ADMIN), validate(createSchema), async (req, res, next) => {
  try {
    const created = await Coupon.create({
      ...req.body,
      code: String(req.body.code).toUpperCase(),
      startAt: new Date(req.body.startAt),
      endAt: new Date(req.body.endAt)
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.post('/validate', authRequired, validate(validateSchema), async (req, res, next) => {
  try {
    const data = await resolveCouponDiscount({ code: req.body.code, subtotal: req.body.subtotal });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
