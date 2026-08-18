const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed', 'shipping'], required: true },
    value: { type: Number, required: true, min: 0 },
    usageLimit: { type: Number, default: 100 },
    used: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'expired', 'disabled'], default: 'active' },
    expires: { type: Date, required: true },
    minSubtotal: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Coupon', couponSchema);
