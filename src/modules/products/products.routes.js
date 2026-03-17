const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const { ROLES } = require('../../constants/enums');
const { listProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } = require('./products.controller');

const router = Router();

const listProductsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    cursor: z.string().optional(),
    keyword: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sort: z.enum(['price', 'newest', 'popular']).optional()
  })
});

const productIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).default({})
});

router.get('/', validate(listProductsSchema), listProducts);
router.get('/:slug', getProductBySlug);
router.post('/', authRequired, requireRole(ROLES.ADMIN), createProduct);
router.patch('/:id', authRequired, requireRole(ROLES.ADMIN), validate(productIdSchema), updateProduct);
router.delete('/:id', authRequired, requireRole(ROLES.ADMIN), validate(productIdSchema), deleteProduct);

module.exports = router;
