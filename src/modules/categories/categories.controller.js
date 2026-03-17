const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const Category = require('./category.model');

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true }).lean();
  res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const exists = await Category.findOne({ slug: req.body.slug });
  if (exists) throw new ApiError(409, 'Category slug already exists');
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ message: 'Category soft deleted' });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
