const asyncHandler = require('../../utils/asyncHandler');
const mongoose = require('mongoose');
const ApiError = require('../../utils/apiError');
const MenuOverride = require('./menu.model');
const Product = require('../products/product.model');

async function getMenuOverrides() {
  const overrides = await MenuOverride.find().lean();
  const overrideMap = new Map(overrides.map(o => [String(o.productId), o]));
  return overrideMap;
}

async function updateMenuOverrides(updates) {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, 'No updates provided');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const results = [];
    for (const update of updates) {
      const { productId, inventoryCount, isPaused } = update;
      
      // Validate product exists
      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new ApiError(404, `Product ${productId} not found`);
      }

      // Update/upsert override
      const override = await MenuOverride.findOneAndUpdate(
        { productId },
        { 
          productId, 
          inventoryCount: Number(inventoryCount) || 0, 
          isPaused: Boolean(isPaused),
          updatedBy: 'admin'
        },
        { 
          upsert: true, 
          new: true, 
          runValidators: true,
          session 
        }
      );

      results.push(override);
    }

    await session.commitTransaction();
    return results;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = { getMenuOverrides, updateMenuOverrides };

