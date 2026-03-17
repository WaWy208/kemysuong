const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const { getMenuOverrides, updateMenuOverrides } = require('./menu.service');

const getOverrides = asyncHandler(async (req, res) => {
  const overrides = await getMenuOverrides();
  res.json(Array.from(overrides.values()));
});

const saveOverrides = asyncHandler(async (req, res) => {
  // Simple password auth (same as frontend)
  const ADMIN_PASSWORD = 'buiquangquy25122007';
  const provided = req.headers['x-admin-password'];
  
  if (provided !== ADMIN_PASSWORD) {
    throw new ApiError(401, 'Admin authentication required');
  }

  const updates = req.body;
  const results = await updateMenuOverrides(updates);
  res.status(200).json({ 
    message: 'Menu overrides saved successfully', 
    updated: results.length 
  });
});

module.exports = { getOverrides, saveOverrides };

