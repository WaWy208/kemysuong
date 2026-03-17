const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

cartItemSchema.index({ cartId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
