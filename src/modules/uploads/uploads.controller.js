const asyncHandler = require('../../utils/asyncHandler');
const uploadsService = require('./uploads.service');

const uploadImage = asyncHandler(async (req, res) => {
  const data = await uploadsService.uploadImage(req.body);
  res.status(201).json(data);
});

module.exports = {
  uploadImage
};
