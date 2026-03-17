const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    flashPrice: { type: Number, default: 0, min: 0 },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    maxQuantity: { type: Number, default: 0, min: 0 },
    soldQuantity: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FlashSale', flashSaleSchema);
