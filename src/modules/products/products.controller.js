const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const Product = require('./product.model');
const Category = require('../categories/category.model');
const { buildPaginationQuery } = require('../../utils/pagination');
const { getRedis } = require('../../config/redis');

function buildProductFilter(query) {
  const filter = { isArchived: false, isAvailable: true };

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.keyword) {
    const escaped = String(query.keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ name: regex }, { description: regex }];
  }

  return filter;
}

function buildSort(sort) {
  if (sort === 'price') return { price: 1, _id: 1 };
  if (sort === 'popular') return { soldCount: -1, createdAt: -1 };
  return { createdAt: -1 };
}

const listProducts = asyncHandler(async (req, res) => {
  const redis = getRedis();
  const cacheKey = `products:${JSON.stringify(req.query)}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
  }

  const filter = buildProductFilter(req.query);
  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category, isActive: true }).lean();
    filter.categoryId = category ? category._id : null;
  }

  const sort = buildSort(req.query.sort);

  let result;
  if (req.query.cursor) {
    filter._id = { $gt: req.query.cursor };
    const data = await Product.find(filter).sort(sort).limit(Number(req.query.limit || 10)).lean();
    result = { items: data, nextCursor: data.length ? data[data.length - 1]._id : null };
  } else {
    const { limit, page, skip } = buildPaginationQuery(req.query);
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);
    result = { items, page, limit, total };
  }

  if (redis) await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
  res.json(result);
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isArchived: false }).lean();
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const exists = await Product.findOne({ slug: req.body.slug });
  if (exists) throw new ApiError(409, 'Product slug already exists');

  const category = await Category.findById(req.body.categoryId).lean();
  if (!category || !category.isActive) throw new ApiError(400, 'Invalid category');

  const product = await Product.create(req.body);
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isArchived: true, isAvailable: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ message: 'Product archived' });
});

module.exports = { listProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };
