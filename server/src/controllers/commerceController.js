const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { getPagination } = require('../utils/query');
const { createOrder, updateOrderStatus, validateCoupon, trackOrder } = require('../services/orderService');
const { getOrderSummary } = require('../services/analyticsService');
const { logActivity } = require('../utils/activity');

const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.userType === 'customer' ? req.user._id : null;
  const order = await createOrder(req.body, customerId);
  sendSuccess(res, { statusCode: 201, message: 'Order placed', data: order });
});

const validateCouponCode = asyncHandler(async (req, res) => {
  const subtotal = Number(req.body.subtotal || 0);
  const result = await validateCoupon(req.body.code, subtotal);
  sendSuccess(res, {
    message: 'Coupon valid',
    data: {
      code: result.coupon.code,
      type: result.coupon.type,
      value: result.coupon.value,
      discount: result.discount,
      freeShipping: result.freeShipping,
    },
  });
});

const trackCustomerOrder = asyncHandler(async (req, res) => {
  const order = await trackOrder(req.body.orderNumber, req.body.phone);
  sendSuccess(res, { data: order });
});

const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { limit: 20 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) {
    filter.$or = [
      { orderNumber: new RegExp(req.query.q, 'i') },
      { 'customerSnapshot.name': new RegExp(req.query.q, 'i') },
      { 'shippingAddress.city': new RegExp(req.query.q, 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, {
    data: items,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
  if (!order) throw new ApiError(404, 'Order not found');
  sendSuccess(res, { data: order });
});

const myOrders = asyncHandler(async (req, res) => {
  const email = String(req.user.email || '').toLowerCase();
  await Order.updateMany(
    { customer: null, 'customerSnapshot.email': email },
    { $set: { customer: req.user._id } },
  );
  const orders = await Order.find({
    $or: [{ customer: req.user._id }, { 'customerSnapshot.email': email }],
  }).sort({ createdAt: -1 });
  sendSuccess(res, { data: orders });
});

const orderSummary = asyncHandler(async (req, res) => {
  const data = await getOrderSummary();
  sendSuccess(res, { data });
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  const order = await updateOrderStatus(req.params.id, req.body.status, req.body.note);
  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'Updated order status',
    target: `${order.orderNumber} → ${order.status}`,
  });
  sendSuccess(res, { message: 'Order status updated', data: order });
});

const changePaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: req.body.paymentStatus },
    { new: true },
  );
  if (!order) throw new ApiError(404, 'Order not found');
  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'Updated payment status',
    target: `${order.orderNumber} → ${order.paymentStatus}`,
  });
  sendSuccess(res, { message: 'Payment status updated', data: order });
});

const listCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 }).select('-wishlist');
  sendSuccess(res, {
    data: customers.map((c) => ({
      id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      isActive: c.isActive,
      createdAt: c.createdAt,
    })),
  });
});

const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendSuccess(res, { data: coupons });
});

const upsertCoupon = asyncHandler(async (req, res) => {
  const payload = { ...req.body, code: String(req.body.code).toUpperCase() };
  let coupon;
  if (req.params.id) {
    coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!coupon) throw new ApiError(404, 'Coupon not found');
  } else {
    coupon = await Coupon.create(payload);
  }
  sendSuccess(res, {
    statusCode: req.params.id ? 200 : 201,
    message: 'Coupon saved',
    data: coupon,
  });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  sendSuccess(res, { message: 'Coupon deleted' });
});

const listReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.productId) filter.product = req.query.productId;
  if (req.userType !== 'admin') filter.status = 'approved';

  const reviews = await Review.find(filter)
    .populate('product', 'name slug')
    .sort({ createdAt: -1 });
  sendSuccess(res, { data: reviews });
});

const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const review = await Review.create({
    product: product._id,
    customer: req.userType === 'customer' ? req.user._id : null,
    customerName:
      req.body.customerName || (req.userType === 'customer' ? req.user.name : 'Guest'),
    rating: req.body.rating,
    title: req.body.title,
    body: req.body.body,
    status: 'pending',
  });

  sendSuccess(res, { statusCode: 201, message: 'Review submitted for moderation', data: review });
});

const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  review.status = req.body.status;
  await review.save();

  if (req.body.status === 'approved' || req.body.status === 'rejected') {
    const approved = await Review.find({ product: review.product, status: 'approved' });
    const avg =
      approved.length === 0
        ? 0
        : approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: approved.length,
    });
  }

  sendSuccess(res, { message: 'Review updated', data: review });
});

module.exports = {
  placeOrder,
  validateCouponCode,
  trackCustomerOrder,
  listOrders,
  getOrder,
  myOrders,
  orderSummary,
  changeOrderStatus,
  changePaymentStatus,
  listCustomers,
  listCoupons,
  upsertCoupon,
  deleteCoupon,
  listReviews,
  createReview,
  moderateReview,
};
