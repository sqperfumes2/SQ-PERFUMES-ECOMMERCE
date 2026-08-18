const { env } = require('../config/env');
const { connectDB } = require('../config/db');
const { shouldBlockDemoSeed } = require('../utils/mongoTarget');
const Category = require('../models/Category');
const FragranceFamily = require('../models/FragranceFamily');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const { getSettings } = require('../services/orderService');

const categories = [
  {
    name: 'For Him',
    slug: 'men',
    description: 'Bold, woody, and amber compositions.',
    image:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'For Her',
    slug: 'women',
    description: 'Floral and musky trails with lasting elegance.',
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Unisex',
    slug: 'unisex',
    description: 'Shared signatures — clean, resinous, and powerful.',
    image:
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=80',
  },
];

const families = [
  { name: 'Woody', slug: 'woody' },
  { name: 'Oriental', slug: 'oriental' },
  { name: 'Floral', slug: 'floral' },
  { name: 'Fresh', slug: 'fresh' },
  { name: 'Citrus', slug: 'citrus' },
  { name: 'Aromatic', slug: 'aromatic' },
  { name: 'Gourmand', slug: 'gourmand' },
];

const products = [
  {
    name: 'Amber Night',
    slug: 'amber-night',
    sku: 'SQ-AN',
    category: 'men',
    gender: 'men',
    fragranceFamily: 'oriental',
    shortDescription: 'Warm amber, smoked woods, and a velvet trail.',
    description:
      'Amber Night opens with spice before sinking into resinous amber and polished woods.',
    topNotes: ['Black pepper', 'Cardamom', 'Bergamot'],
    middleNotes: ['Amber', 'Labdanum', 'Rose absolute'],
    baseNotes: ['Sandalwood', 'Vanilla', 'Musk'],
    variants: [
      { size: '30ml', sku: 'SQ-AN-30', price: 6500, compareAtPrice: 7800, stock: 24 },
      { size: '50ml', sku: 'SQ-AN-50', price: 8250, compareAtPrice: 9800, stock: 12 },
      { size: '100ml', sku: 'SQ-AN-100', price: 14500, compareAtPrice: null, stock: 6 },
    ],
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
    ],
    featured: true,
    bestSeller: true,
    onSale: true,
    rating: 4.8,
    reviewCount: 12,
    popularity: 98,
    occasion: 'Evening',
    longevity: '8–10 hours',
    sillage: 'Moderate to strong',
  },
  {
    name: 'Velvet Rose',
    slug: 'velvet-rose',
    sku: 'SQ-VR',
    category: 'women',
    gender: 'women',
    fragranceFamily: 'floral',
    shortDescription: 'Damask rose wrapped in soft musk.',
    description: 'A modern floral built around damask rose and creamy musk.',
    topNotes: ['Pink pepper', 'Lychee'],
    middleNotes: ['Damask rose', 'Peony', 'Iris'],
    baseNotes: ['White musk', 'Cedar'],
    variants: [
      { size: '30ml', sku: 'SQ-VR-30', price: 7200, compareAtPrice: null, stock: 30 },
      { size: '50ml', sku: 'SQ-VR-50', price: 9800, compareAtPrice: null, stock: 18 },
    ],
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=80',
    ],
    featured: true,
    bestSeller: true,
    rating: 4.9,
    reviewCount: 18,
    popularity: 99,
  },
  {
    name: 'Oud Noir',
    slug: 'oud-noir',
    sku: 'SQ-ON',
    category: 'unisex',
    gender: 'unisex',
    fragranceFamily: 'woody',
    shortDescription: 'Smoked oud, dark woods, and incense.',
    description: 'Balances smoky oud with polished woods and a soft incense trail.',
    topNotes: ['Saffron', 'Elemi'],
    middleNotes: ['Oud', 'Incense', 'Patchouli'],
    baseNotes: ['Guaiac wood', 'Leather', 'Musk'],
    variants: [
      { size: '30ml', sku: 'SQ-ON-30', price: 8900, compareAtPrice: null, stock: 15 },
      { size: '50ml', sku: 'SQ-ON-50', price: 12800, compareAtPrice: null, stock: 4 },
    ],
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
    ],
    featured: true,
    bestSeller: true,
    newArrival: true,
    rating: 4.7,
    reviewCount: 9,
    popularity: 95,
  },
];

async function seedDemo() {
  if (shouldBlockDemoSeed(process.env.MONGODB_URI, env.NODE_ENV)) {
    console.error('Refusing to seed demo catalog into Atlas or production.');
    console.error('Keep the real database empty except the owner admin (npm run seed:admin).');
    console.error('Disposable local DB only: set ALLOW_DEMO_SEED=true');
    process.exit(1);
  }

  await connectDB();
  await getSettings();

  for (const category of categories) {
    await Category.updateOne({ slug: category.slug }, category, { upsert: true });
  }

  for (const family of families) {
    await FragranceFamily.updateOne({ slug: family.slug }, family, { upsert: true });
  }

  for (const product of products) {
    await Product.updateOne({ slug: product.slug }, product, { upsert: true });
  }

  await Coupon.updateOne(
    { code: 'WELCOME10' },
    {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      usageLimit: 500,
      used: 0,
      status: 'active',
      expires: new Date('2026-12-31'),
    },
    { upsert: true },
  );

  await Coupon.updateOne(
    { code: 'SQ20' },
    {
      code: 'SQ20',
      type: 'percent',
      value: 20,
      usageLimit: 100,
      used: 0,
      status: 'active',
      expires: new Date('2026-12-31'),
    },
    { upsert: true },
  );

  await Banner.updateOne(
    { title: 'Crafted for lasting presence' },
    {
      title: 'Crafted for lasting presence',
      subtitle: 'Discover the SQ Perfumes collection',
      ctaLabel: 'Shop All',
      ctaHref: '/shop',
      position: 'Hero',
      status: 'active',
      image:
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1800&q=80',
    },
    { upsert: true },
  );

  console.log('Demo catalog, coupons, banners, and settings seeded.');
  process.exit(0);
}

seedDemo().catch((error) => {
  console.error('Demo seed failed:', error.message);
  process.exit(1);
});
