const mongoose = require('mongoose');

const menuOverrideSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true, 
    unique: true,
    index: true
  },
  inventoryCount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  isPaused: { 
    type: Boolean, 
    default: false 
  },
  updatedBy: { 
    type: String, 
    default: 'admin' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

module.exports = mongoose.model('MenuOverride', menuOverrideSchema);

