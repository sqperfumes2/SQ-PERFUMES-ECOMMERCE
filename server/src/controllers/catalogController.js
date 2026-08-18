const Product = require('../models/Product');
const Category = require('../models/Category');
const FragranceFamily = require('../models/FragranceFamily');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { listProducts } = require('../services/productService');
const { getSettings } = require('../services/orderService');
const { logActivity } = require('../utils/activity');

const getProducts = asyncHandler(async (req, res) => {
  const result = await listProducts(req.query, { admin: false });
  sendSuccess(res, { data: result.items, meta: result.meta });
});

const getAdminProducts = asyncHandler(async (req, res) => {
  const result = await listProducts(req.query, { admin: true });
  sendSuccess(res, { data: result.items, meta: result.meta });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' });
  if (!product) throw new ApiError(404, 'Product not found');
  sendSuccess(res, { data: product });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  sendSuccess(res, { data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'Created product',
    target: product.name,
  });
  sendSuccess(res, { statusCode: 201, message: 'Product created', data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'Updated product',
    target: product.name,
  });
  sendSuccess(res, { message: 'Product updated', data: product });
});

const archiveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  product.status = product.status === 'archived' ? 'active' : 'archived';
  await product.save();
  sendSuccess(res, { message: 'Product archive toggled', data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'Deleted product',
    target: product.name,
  });
  sendSuccess(res, { message: 'Product deleted' });
});

const getInventory = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const products = await Product.find().sort({ name: 1 });
  const rows = products.flatMap((product) => {
    const total = product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    return product.variants.map((variant) => ({
      productId: product._id,
      productName: product.name,
      productStatus: product.status,
      totalStock: total,
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock,
      low: variant.stock > 0 && variant.stock <= settings.lowStockThreshold,
      out: variant.stock <= 0,
    }));
  });
  sendSuccess(res, { data: rows, meta: { lowStockThreshold: settings.lowStockThreshold } });
});

const adjustStock = asyncHandler(async (req, res) => {
  const sku = String(req.body?.sku || '').trim();
  const delta = Number(req.body?.delta);
  if (!sku) throw new ApiError(400, 'SKU is required');
  if (!Number.isFinite(delta) || !Number.isInteger(delta)) {
    throw new ApiError(400, 'delta must be an integer');
  }

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  const variant = product.variants.find((v) => v.sku === sku);
  if (!variant) throw new ApiError(404, 'Variant not found');

  variant.stock = Math.max(0, Number(variant.stock || 0) + delta);
  await product.save();

  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'Adjusted inventory',
    target: `${product.name} ${variant.size} (${variant.sku}) → ${variant.stock}`,
  });

  sendSuccess(res, { message: 'Stock updated', data: product });
});

const patchFlags = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  for (const key of ['featured', 'bestSeller', 'newArrival', 'onSale']) {
    if (req.body[key] !== undefined) product[key] = Boolean(req.body[key]);
  }
  await product.save();
  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'Updated merchandising flags',
    target: product.name,
  });
  sendSuccess(res, { message: 'Product flags updated', data: product });
});

const setSoldOut = asyncHandler(async (req, res) => {
  const soldOut = Boolean(req.body?.soldOut);
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  product.variants = product.variants.map((variant) => {
    const next = variant.toObject ? variant.toObject() : { ...variant };
    if (soldOut) {
      if (Number(next.stock || 0) > 0) next.previousStock = next.stock;
      next.stock = 0;
    } else {
      const restore = Number(next.previousStock || 0);
      next.stock = restore > 0 ? restore : 1;
      next.previousStock = 0;
    }
    return next;
  });
  product.markModified('variants');
  await product.save();

  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: soldOut ? 'Marked product sold out' : 'Restored product from sold out',
    target: product.name,
  });

  sendSuccess(res, {
    message: soldOut ? 'Marked as sold out' : 'Product is available again',
    data: product,
  });
});

const listCategories = asyncHandler(async (req, res) => {
  const filter = req.userType === 'admin' ? {} : { status: 'active' };
  const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
  sendSuccess(res, { data: categories });
});

const upsertCategory = asyncHandler(async (req, res) => {
  let category;
  if (req.params.id) {
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new ApiError(404, 'Category not found');
  } else {
    category = await Category.create(req.body);
  }
  sendSuccess(res, {
    statusCode: req.params.id ? 200 : 201,
    message: 'Category saved',
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  sendSuccess(res, { message: 'Category deleted' });
});

const listFamilies = asyncHandler(async (req, res) => {
  const families = await FragranceFamily.find().sort({ name: 1 });
  sendSuccess(res, { data: families });
});

const upsertFamily = asyncHandler(async (req, res) => {
  let family;
  if (req.params.id) {
    family = await FragranceFamily.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!family) throw new ApiError(404, 'Fragrance family not found');
  } else {
    family = await FragranceFamily.create(req.body);
  }
  sendSuccess(res, {
    statusCode: req.params.id ? 200 : 201,
    message: 'Fragrance family saved',
    data: family,
  });
});

const deleteFamily = asyncHandler(async (req, res) => {
  const family = await FragranceFamily.findByIdAndDelete(req.params.id);
  if (!family) throw new ApiError(404, 'Fragrance family not found');
  sendSuccess(res, { message: 'Fragrance family deleted' });
});

module.exports = {
  getProducts,
  getAdminProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  archiveProduct,
  deleteProduct,
  getInventory,
  adjustStock,
  patchFlags,
  setSoldOut,
  listCategories,
  upsertCategory,
  deleteCategory,
  listFamilies,
  upsertFamily,
  deleteFamily,
};
