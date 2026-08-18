const Product = require('../models/Product');
const { getPagination, buildSort } = require('../utils/query');

async function listProducts(query, { admin = false } = {}) {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (!admin) filter.status = 'active';
  if (query.status && admin) filter.status = query.status;
  if (query.gender) filter.gender = query.gender;
  if (query.category) {
    // Match either category slug/name or classic gender buckets
    const cat = String(query.category);
    if (['men', 'women', 'unisex'].includes(cat)) {
      filter.$or = [{ category: cat }, { gender: cat }];
    } else {
      filter.category = cat;
    }
  }
  if (query.fragranceFamily) {
    filter.fragranceFamily = {
      $in: String(query.fragranceFamily).split(',').filter(Boolean),
    };
  }
  if (query.collection === 'new') filter.newArrival = true;
  if (query.collection === 'best') filter.bestSeller = true;
  if (query.collection === 'sale') filter.onSale = true;
  if (query.featured === 'true') filter.featured = true;
  if (query.q) filter.$text = { $search: query.q };

  if (query.minPrice || query.maxPrice) {
    filter['variants.price'] = {};
    if (query.minPrice) filter['variants.price'].$gte = Number(query.minPrice);
    if (query.maxPrice) filter['variants.price'].$lte = Number(query.maxPrice);
  }

  if (query.availability === 'in-stock') {
    filter['variants.stock'] = { $gt: 0 };
  }
  if (query.availability === 'out-of-stock') {
    filter.variants = { $not: { $elemMatch: { stock: { $gt: 0 } } } };
  }

  const sort = buildSort(query.sort);
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

module.exports = { listProducts };
