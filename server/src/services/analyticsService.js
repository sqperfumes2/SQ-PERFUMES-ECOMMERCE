const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { getSettings } = require('./orderService');

function startOfTodayPakistan() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return new Date(`${value('year')}-${value('month')}-${value('day')}T00:00:00+05:00`);
}

async function getOrderSummary() {
  const todayStart = startOfTodayPakistan();
  const [pendingOrders, openOrders, ordersToday] = await Promise.all([
    Order.countDocuments({ status: 'Pending' }),
    Order.countDocuments({ status: { $nin: ['Delivered', 'Cancelled', 'Returned'] } }),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
  ]);
  return { pendingOrders, openOrders, ordersToday };
}

async function getDashboardAnalytics() {
  const settings = await getSettings();
  const deliveredMatch = { status: 'Delivered' };
  const todayStart = startOfTodayPakistan();
  const [
    totalSalesAgg,
    totalOrders,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    ordersToday,
    totalCustomers,
    totalProducts,
    recentOrders,
    topProducts,
    salesByPayment,
  ] = await Promise.all([
    Order.aggregate([
      { $match: deliveredMatch },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ status: 'Pending' }),
    Order.countDocuments({ status: 'Confirmed' }),
    Order.countDocuments({ status: 'Shipped' }),
    Order.countDocuments({ status: 'Delivered' }),
    Order.countDocuments({ status: 'Cancelled' }),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Customer.countDocuments(),
    Product.countDocuments({ status: 'active' }),
    Order.find().sort({ createdAt: -1 }).limit(8),
    Product.find({ status: 'active' }).sort({ popularity: -1 }).limit(5).select('name popularity'),
    Order.aggregate([
      { $match: deliveredMatch },
      { $group: { _id: '$paymentMethod', value: { $sum: '$total' } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
    ]),
  ]);

  const products = await Product.find({ status: 'active' });
  const lowStockProducts = products.filter((p) =>
    p.variants.some((v) => v.stock > 0 && v.stock <= settings.lowStockThreshold),
  ).length;

  const revenueTrend = await Order.aggregate([
    { $match: deliveredMatch },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: '$_id', revenue: 1, _id: 0 } },
  ]);

  const salesByCategory = await Order.aggregate([
    { $match: deliveredMatch },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$product.category',
        value: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
      },
    },
    { $project: { name: { $ifNull: ['$_id', 'Unknown'] }, value: 1, _id: 0 } },
  ]);

  return {
    kpis: {
      totalSales: totalSalesAgg[0]?.total || 0,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      ordersToday,
      totalCustomers,
      totalProducts,
      lowStockProducts,
    },
    revenueTrend,
    salesByCategory,
    salesByPayment,
    topProducts: topProducts.map((p) => ({
      name: p.name,
      sold: p.popularity || 0,
    })),
    recentOrders,
  };
}

module.exports = { getDashboardAnalytics, getOrderSummary };
