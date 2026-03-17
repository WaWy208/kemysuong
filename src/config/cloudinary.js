const crypto = require('crypto');
const env = require('./env');

function buildSignature(params, apiSecret) {
  const keys = Object.keys(params).sort();
  const toSign = keys.map((key) => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
}

async function uploadBase64ImageToCloudinary({ imageData, folder = 'ice-cream' }) {
  if (!env.cloudinaryCloudName) {
    throw new Error('Missing CLOUDINARY_CLOUD_NAME');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`;
  const body = new URLSearchParams();
  body.append('file', imageData);
  body.append('folder', folder);

  if (env.cloudinaryUploadPreset) {
    body.append('upload_preset', env.cloudinaryUploadPreset);
  } else {
    if (!env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
      throw new Error('Cloudinary credentials are missing');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signPayload = { folder, timestamp };
    const signature = buildSignature(signPayload, env.cloudinaryApiSecret);

    body.append('api_key', env.cloudinaryApiKey);
    body.append('timestamp', String(timestamp));
    body.append('signature', signature);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data && data.error && data.error.message ? data.error.message : 'Cloudinary upload failed';
    throw new Error(message);
  }

  return {
    publicId: data.public_id,
    imageUrl: data.secure_url,
    width: data.width,
    height: data.height,
    format: data.format
  };
}

module.exports = {
  uploadBase64ImageToCloudinary
};
