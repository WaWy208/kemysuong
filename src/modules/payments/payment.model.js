const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    status: { type: String, required: true },
    transactionId: { type: String, default: '' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Payment', paymentSchema);
