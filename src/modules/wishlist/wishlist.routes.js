const { Router } = require('express');
const { authRequired } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const WishlistItem = require('./wishlist.model');

const router = Router();

const addSchema = z.object({
  body: z.object({ productId: z.string().min(1) }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

const removeSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({ productId: z.string().min(1) }),
  query: z.object({}).default({})
});

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const items = await WishlistItem.find({ userId: req.auth.sub }).populate('productId').lean();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/items', authRequired, validate(addSchema), async (req, res, next) => {
  try {
    await WishlistItem.findOneAndUpdate(
      { userId: req.auth.sub, productId: req.body.productId },
      { userId: req.auth.sub, productId: req.body.productId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const items = await WishlistItem.find({ userId: req.auth.sub }).populate('productId').lean();
    res.status(201).json(items);
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:productId', authRequired, validate(removeSchema), async (req, res, next) => {
  try {
    await WishlistItem.findOneAndDelete({ userId: req.auth.sub, productId: req.params.productId });
    const items = await WishlistItem.find({ userId: req.auth.sub }).populate('productId').lean();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
