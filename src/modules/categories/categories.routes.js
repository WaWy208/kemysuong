const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const { ROLES } = require('../../constants/enums');
const { listCategories, createCategory, updateCategory, deleteCategory } = require('./categories.controller');

const router = Router();

const categoryBody = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().default('')
});

router.get('/', listCategories);
router.post('/', authRequired, requireRole(ROLES.ADMIN), validate(z.object({ body: categoryBody, params: z.object({}).default({}), query: z.object({}).default({}) })), createCategory);
router.patch('/:id', authRequired, requireRole(ROLES.ADMIN), updateCategory);
router.delete('/:id', authRequired, requireRole(ROLES.ADMIN), deleteCategory);

module.exports = router;
