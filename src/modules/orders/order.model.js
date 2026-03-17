const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../../constants/enums');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderItems: { type: [orderItemSchema], required: true },
    subtotalAmount: { type: Number, required: true, min: 0, default: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    couponCode: { type: String, default: '' },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING, index: true },
    paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.UNPAID },
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHOD), required: true },
    deliveryAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
