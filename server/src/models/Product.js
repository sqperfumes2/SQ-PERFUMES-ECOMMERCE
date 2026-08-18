const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
    previousStock: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    brand: { type: String, default: 'SQ Perfumes' },
    category: { type: String, required: true },
    gender: { type: String, enum: ['men', 'women', 'unisex'], required: true },
    fragranceFamily: { type: String, required: true },
    topNotes: [{ type: String }],
    middleNotes: [{ type: String }],
    baseNotes: [{ type: String }],
    variants: {
      type: [variantSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'At least one variant is required'],
    },
    images: [{ type: String }],
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    occasion: { type: String, default: '' },
    longevity: { type: String, default: '' },
    sillage: { type: String, default: '' },
    ingredients: { type: String, default: '' },
    popularity: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', shortDescription: 'text', fragranceFamily: 'text' });
productSchema.index({ gender: 1, category: 1, status: 1 });

module.exports = mongoose.model('Product', productSchema);
