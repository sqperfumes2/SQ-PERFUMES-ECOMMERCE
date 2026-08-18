const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    status: { type: String, enum: ['active', 'hidden'], default: 'active' },
    sortOrder: { type: Number, default: 0 },
    showInNav: { type: Boolean, default: true },
    showOnHome: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Category', categorySchema);
