const mongoose = require('mongoose');

const storeOrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const storeOrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    orderType: { type: String, enum: ['DELIVERY', 'PICKUP'], required: true },
    address: { type: String, required: true, trim: true },
    paymentMethod: { type: String, enum: ['CASH', 'BANK_TRANSFER', 'AUTO_GATEWAY'], required: true },
    paymentStatus: { type: String, enum: ['UNPAID', 'WAITING_TRANSFER', 'PAID', 'PENDING'], required: true },
    transactionId: { type: String, default: '', trim: true },
    items: { type: [storeOrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED'], default: 'PENDING_CONFIRMATION' },
    source: { type: String, default: 'WEBSITE' }
  },
  { timestamps: true, collection: 'store_orders' }
);

module.exports = mongoose.model('StoreOrder', storeOrderSchema);

