const express = require('express');
const router = express.Router();
const { validate } = require('../../middlewares/validate');
const { getOverrides, saveOverrides } = require('./menu.controller');

const saveSchema = {
  body: require('joi').array().items(
    require('joi').object({
      productId: require('joi').string().required(),
      inventoryCount: require('joi').number().min(0).required(),
      isPaused: require('joi').boolean().required()
    })
  )
};

router.get('/overrides', getOverrides);
router.post('/', validate(saveSchema), saveOverrides);

module.exports = router;

