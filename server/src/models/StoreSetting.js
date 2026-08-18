const mongoose = require('mongoose');

const shippingCitySchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    fee: { type: Number, required: true, min: 0 },
    eta: { type: String, default: '2–4 days' },
    active: { type: Boolean, default: true },
  },
  { _id: true },
);

const homepageSchema = new mongoose.Schema(
  {
    image: { type: String, default: '' },
    eyebrow: { type: String, default: 'SQ Perfumes' },
    title: { type: String, default: 'Crafted for lasting presence' },
    subtitle: {
      type: String,
      default:
        'Discover the SQ Perfumes collection — refined perfume oils and eau de parfum in black and gold.',
    },
    ctaPrimaryLabel: { type: String, default: 'Shop All' },
    ctaPrimaryHref: { type: String, default: '/shop' },
    ctaSecondaryLabel: { type: String, default: 'New Arrivals' },
    ctaSecondaryHref: { type: String, default: '/shop/new-arrivals' },
    shopAllImage: { type: String, default: '' },
    bestSellersImage: { type: String, default: '' },
    showBestSellersSection: { type: Boolean, default: false },
    showNewArrivalsSection: { type: Boolean, default: false },
    showFeaturedSection: { type: Boolean, default: false },
  },
  { _id: false },
);

const storeSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    storeName: { type: String, default: 'SQ Perfumes' },
    tagline: { type: String, default: 'Scented in silence. Remembered forever.' },
    email: { type: String, default: 'hello@sqperfumes.com' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    address: { type: String, default: 'Pakistan' },
    currency: { type: String, default: 'PKR' },
    freeShippingThreshold: { type: Number, default: 8000 },
    lowStockThreshold: { type: Number, default: 8 },
    announcement: { type: String, default: '' },
    about: { type: String, default: '' },
    productDeliveryText: {
      type: String,
      default: '2–4 business days in major cities. COD available.',
    },
    productReturnsText: {
      type: String,
      default: 'Unopened bottles eligible within 7 days.',
    },
    paymentMethods: {
      cod: { type: Boolean, default: true },
      online: { type: Boolean, default: false },
    },
    shippingCities: [shippingCitySchema],
    orderSequence: { type: Number, default: 0, min: 0 },
    homepage: {
      type: homepageSchema,
      default: () => ({
        showBestSellersSection: false,
        showNewArrivalsSection: false,
        showFeaturedSection: false,
      }),
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('StoreSetting', storeSettingSchema);
