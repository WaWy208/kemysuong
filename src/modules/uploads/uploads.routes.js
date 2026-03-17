const { Router } = require('express');
const { validate, z } = require('../../middlewares/validate');
const { authRequired, requireRole } = require('../../middlewares/auth');
const { ROLES } = require('../../constants/enums');
const { uploadImage } = require('./uploads.controller');

const router = Router();

const uploadImageSchema = z.object({
  body: z.object({
    imageData: z.string().min(30),
    folder: z.string().optional().default('ice-cream')
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

router.post('/cloudinary', authRequired, requireRole(ROLES.ADMIN), validate(uploadImageSchema), uploadImage);

module.exports = router;
