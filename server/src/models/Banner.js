const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    ctaLabel: { type: String, default: 'Shop' },
    ctaHref: { type: String, default: '/shop' },
    image: { type: String, required: true },
    position: { type: String, default: 'Hero' },
    status: { type: String, enum: ['active', 'draft'], default: 'draft' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Banner', bannerSchema);
