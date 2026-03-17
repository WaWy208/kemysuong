const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0, index: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
      alias: 'category_id'
    },
    inventoryCount: { type: Number, required: true, min: 0, alias: 'stock' },
    imageUrl: { type: String, default: '', alias: 'thumbnail' },
    soldCount: { type: Number, default: 0, min: 0, index: true },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model('Product', productSchema);
