const mongoose = require('mongoose');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const StoreSetting = require('../models/StoreSetting');
const { ApiError } = require('../utils/ApiError');

async function getSettings() {
  let settings = await StoreSetting.findOne({ key: 'default' });
  if (!settings) {
    settings = await StoreSetting.create({
      key: 'default',
      shippingCities: [
        { city: 'Karachi', fee: 250, eta: '2–4 days' },
        { city: 'Lahore', fee: 200, eta: '1–3 days' },
        { city: 'Islamabad', fee: 220, eta: '2–4 days' },
        { city: 'Rawalpindi', fee: 220, eta: '2–4 days' },
        { city: 'Faisalabad', fee: 250, eta: '2–4 days' },
        { city: 'Multan', fee: 280, eta: '3–5 days' },
        { city: 'Peshawar', fee: 300, eta: '3–5 days' },
        { city: 'Quetta', fee: 350, eta: '4–7 days' },
        { city: 'Other', fee: 350, eta: '4–7 days' },
      ],
      announcement:
        'Complimentary shipping on orders above Rs. 8,000 · COD available nationwide',
      about:
        'SQ Perfumes crafts refined perfume oils and eau de parfum for lasting presence.',
      productDeliveryText: '2–4 business days in major cities. COD available.',
      productReturnsText: 'Unopened bottles eligible within 7 days.',
      paymentMethods: { cod: true, online: true },
    });
  }
  return settings;
}

async function validateCoupon(code, subtotal) {
  if (!code) return { discount: 0, coupon: null, freeShipping: false };

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
  if (!coupon || coupon.status !== 'active') throw new ApiError(400, 'Invalid coupon code');
  if (coupon.expires < new Date()) throw new ApiError(400, 'Coupon has expired');
  if (coupon.used >= coupon.usageLimit) throw new ApiError(400, 'Coupon usage limit reached');
  if (subtotal < (coupon.minSubtotal || 0)) {
    throw new ApiError(400, `Minimum subtotal for coupon is ${coupon.minSubtotal}`);
  }

  if (coupon.type === 'percent') {
    return {
      discount: Math.round((subtotal * coupon.value) / 100),
      coupon,
      freeShipping: false,
    };
  }
  if (coupon.type === 'fixed') {
    return {
      discount: Math.min(subtotal, coupon.value),
      coupon,
      freeShipping: false,
    };
  }
  return { discount: 0, coupon, freeShipping: true };
}

function nextOrderStatusesThatDeduct() {
  return ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
}

function statusesThatRestore() {
  return ['Cancelled', 'Returned'];
}

async function nextOrderNumber(session) {
  let settings = await StoreSetting.findOne({ key: 'default' }).session(session);
  if (!settings) {
    settings = await getSettings();
  }

  if (!settings.orderSequence) {
    const numbered = await Order.find({ orderNumber: /^SQ-\d{1,5}$/ })
      .select('orderNumber')
      .session(session);
    let max = 0;
    for (const order of numbered) {
      const n = Number(String(order.orderNumber).replace(/^SQ-/, ''));
      if (Number.isFinite(n) && n > max) max = n;
    }
    if (!max) {
      max = await Order.countDocuments().session(session);
    }
    settings.orderSequence = max;
    await settings.save({ session });
  }

  const updated = await StoreSetting.findOneAndUpdate(
    { key: 'default' },
    { $inc: { orderSequence: 1 } },
    { new: true, session },
  );
  return `SQ-${String(updated.orderSequence).padStart(3, '0')}`;
}

async function createOrder(payload, customerId = null) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const settings = await getSettings();
    const lineItems = [];
    let subtotal = 0;

    for (const item of payload.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || product.status !== 'active') {
        throw new ApiError(400, `Product unavailable: ${item.productId}`);
      }

      const variant = product.variants.find((v) => v.size === item.size);
      if (!variant) throw new ApiError(400, `Size ${item.size} not found for ${product.name}`);
      if (variant.stock < item.qty) {
        throw new ApiError(400, `Insufficient stock for ${product.name} (${item.size})`);
      }

      const price = variant.price;
      subtotal += price * item.qty;
      lineItems.push({
        product: product._id,
        name: product.name,
        size: variant.size,
        sku: variant.sku,
        qty: item.qty,
        price,
      });
    }

    const couponResult = await validateCoupon(payload.couponCode, subtotal);
    const city = settings.shippingCities.find((c) => c.city === payload.shippingAddress.city);
    let shipping = city?.fee ?? 350;
    if (subtotal >= settings.freeShippingThreshold || couponResult.freeShipping) shipping = 0;

    const discount = couponResult.discount;
    const total = Math.max(0, subtotal - discount + shipping);
    const orderNumber = await nextOrderNumber(session);
    let linkedCustomer = customerId;
    if (!linkedCustomer && payload.customer?.email) {
      const existing = await Customer.findOne({
        email: String(payload.customer.email).toLowerCase(),
      }).session(session);
      if (existing) linkedCustomer = existing._id;
    }

    const [order] = await Order.create(
      [
        {
          orderNumber,
          customer: linkedCustomer,
          customerSnapshot: {
            ...payload.customer,
            guest: Boolean(payload.guest) || !linkedCustomer,
          },
          items: lineItems,
          status: 'Pending',
          paymentStatus: payload.paymentMethod === 'Online' ? 'Pending' : 'Pending',
          paymentMethod: payload.paymentMethod,
          shippingAddress: payload.shippingAddress,
          subtotal,
          discount,
          shipping,
          total,
          couponCode: couponResult.coupon?.code || null,
          statusHistory: [{ status: 'Pending', note: 'Order placed' }],
        },
      ],
      { session },
    );

    if (couponResult.coupon) {
      couponResult.coupon.used += 1;
      await couponResult.coupon.save({ session });
    }

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function adjustStockForOrder(order, direction = 'deduct') {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    const variant = product.variants.find((v) => v.sku === item.sku || v.size === item.size);
    if (!variant) continue;

    if (direction === 'deduct') {
      if (variant.stock < item.qty) {
        throw new ApiError(400, `Insufficient stock while confirming ${product.name}`);
      }
      variant.stock -= item.qty;
      product.popularity = (product.popularity || 0) + item.qty;
    } else {
      variant.stock += item.qty;
    }
    product.markModified('variants');
    await product.save();
  }
}

async function updateOrderStatus(orderId, status, note = '') {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  const previous = order.status;
  order.status = status;
  order.statusHistory.push({ status, note: note || `Status changed from ${previous}` });

  const shouldDeduct =
    nextOrderStatusesThatDeduct().includes(status) &&
    !order.stockDeducted &&
    !statusesThatRestore().includes(status);

  const shouldRestore =
    statusesThatRestore().includes(status) &&
    order.stockDeducted &&
    nextOrderStatusesThatDeduct().includes(previous);

  if (shouldDeduct) {
    await adjustStockForOrder(order, 'deduct');
    order.stockDeducted = true;
  }

  if (shouldRestore) {
    await adjustStockForOrder(order, 'restore');
    order.stockDeducted = false;
  }

  if (status === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
    order.paymentStatus = 'Paid';
  }

  await order.save();
  return order;
}

function phoneDigits(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length >= 12) return digits.slice(2);
  if (digits.startsWith('0') && digits.length >= 11) return digits.slice(1);
  return digits;
}

function publicOrderView(order) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    total: order.total,
    items: (order.items || []).map((item) => ({
      name: item.name,
      size: item.size,
      qty: item.qty,
    })),
    shippingAddress: {
      city: order.shippingAddress?.city || '',
      area: order.shippingAddress?.area || '',
    },
    statusHistory: (order.statusHistory || []).map((entry) => ({
      status: entry.status,
      note: entry.note || '',
      at: entry.at,
    })),
  };
}

async function trackOrder(orderNumber, phone) {
  const code = String(orderNumber || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
  const wanted = phoneDigits(phone);
  if (!code || wanted.length < 10) {
    throw new ApiError(404, 'Order not found');
  }

  const order = await Order.findOne({ orderNumber: code });
  if (!order || phoneDigits(order.customerSnapshot?.phone) !== wanted) {
    throw new ApiError(404, 'Order not found');
  }

  return publicOrderView(order);
}

module.exports = {
  getSettings,
  validateCoupon,
  createOrder,
  updateOrderStatus,
  trackOrder,
};
