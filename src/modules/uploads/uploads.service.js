const ApiError = require('../../utils/apiError');
const { uploadBase64ImageToCloudinary } = require('../../config/cloudinary');

async function uploadImage(payload) {
  if (!payload.imageData || !String(payload.imageData).startsWith('data:image/')) {
    throw new ApiError(400, 'imageData must be a data URL (data:image/*;base64,...)');
  }

  try {
    return await uploadBase64ImageToCloudinary({
      imageData: payload.imageData,
      folder: payload.folder || 'ice-cream'
    });
  } catch (error) {
    throw new ApiError(400, error.message || 'Upload failed');
  }
}

module.exports = {
  uploadImage
};
