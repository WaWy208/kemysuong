const { Router } = require('express');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { validate, z } = require('../../middlewares/validate');
const { ROLES } = require('../../constants/enums');
const { getMe, listMembers, updateMember, memberStats } = require('./users.controller');

const router = Router();

const listMembersSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    keyword: z.string().optional(),
    role: z.enum([ROLES.ADMIN, ROLES.CUSTOMER]).optional(),
    isActive: z.enum(['true', 'false']).optional()
  })
});

const updateMemberSchema = z.object({
  body: z
    .object({
      role: z.enum([ROLES.ADMIN, ROLES.CUSTOMER]).optional(),
      isActive: z.boolean().optional(),
      name: z.string().min(2).optional()
    })
    .refine((value) => Object.keys(value).length > 0, { message: 'Body cannot be empty' }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).default({})
});

router.get('/me', authRequired, getMe);
router.get('/stats/summary', authRequired, requireRole(ROLES.ADMIN), memberStats);
router.get('/', authRequired, requireRole(ROLES.ADMIN), validate(listMembersSchema), listMembers);
router.patch('/:id', authRequired, requireRole(ROLES.ADMIN), validate(updateMemberSchema), updateMember);

module.exports = router;
