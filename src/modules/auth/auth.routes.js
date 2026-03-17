const { Router } = require('express');
const { validate, z } = require('../../middlewares/validate');
const { ROLES } = require('../../constants/enums');
const { login, refresh, register } = require('./auth.controller');

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum([ROLES.CUSTOMER]).optional().default(ROLES.CUSTOMER)
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({})
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({})
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);

module.exports = router;
