const mongoose = require('mongoose');

const inventoryAlertSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    stock: { type: Number, required: true },
    threshold: { type: Number, required: true },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryAlert', inventoryAlertSchema);
