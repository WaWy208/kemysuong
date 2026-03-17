const mongoose = require('mongoose');
const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const { ROLES } = require('../../constants/enums');
const Review = require('./review.model');
const Product = require('../products/product.model');

const router = Router();

const createSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(1000).optional().default('')
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const listSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({ productId: z.string().min(1) }),
  query: z.object({}).default({})
});

const moderateSchema = z.object({
  body: z.object({ isApproved: z.boolean() }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).default({})
});

async function refreshProductRating(productId) {
  const oid = new mongoose.Types.ObjectId(String(productId));
  const stats = await Review.aggregate([
    { $match: { productId: oid, isApproved: true } },
    { $group: { _id: '$productId', ratingAvg: { $avg: '$rating' }, ratingCount: { $sum: 1 } } }
  ]);

  const ratingAvg = stats[0] ? Number(stats[0].ratingAvg.toFixed(2)) : 0;
  const ratingCount = stats[0] ? stats[0].ratingCount : 0;
  await Product.findByIdAndUpdate(productId, { ratingAvg, ratingCount });
}

router.get('/product/:productId', validate(listSchema), async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId, isApproved: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name')
      .lean();
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

router.post('/', authRequired, validate(createSchema), async (req, res, next) => {
  try {
    const review = await Review.findOneAndUpdate(
      { productId: req.body.productId, userId: req.auth.sub },
      {
        productId: req.body.productId,
        userId: req.auth.sub,
        rating: req.body.rating,
        comment: req.body.comment,
        isApproved: false
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/moderate', authRequired, requireRole(ROLES.ADMIN), validate(moderateSchema), async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    if (!review) return next({ statusCode: 404, message: 'Review not found' });

    await refreshProductRating(review.productId);
    res.json(review);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
