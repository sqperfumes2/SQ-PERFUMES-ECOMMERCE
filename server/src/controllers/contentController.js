const Banner = require('../models/Banner');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const ContactMessage = require('../models/ContactMessage');
const ActivityLog = require('../models/ActivityLog');
const Category = require('../models/Category');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { getSettings } = require('../services/orderService');
const { getDashboardAnalytics } = require('../services/analyticsService');
const { saveUploadedImage } = require('../middleware/upload');
const { logActivity } = require('../utils/activity');
const StoreSetting = require('../models/StoreSetting');

const DEFAULT_HOMEPAGE = {
  image: '',
  eyebrow: 'SQ Perfumes',
  title: 'Crafted for lasting presence',
  subtitle:
    'Discover the SQ Perfumes collection — refined perfume oils and eau de parfum in black and gold.',
  ctaPrimaryLabel: 'Shop All',
  ctaPrimaryHref: '/shop',
  ctaSecondaryLabel: 'New Arrivals',
  ctaSecondaryHref: '/shop/new-arrivals',
  shopAllImage: '',
  bestSellersImage: '',
  showBestSellersSection: false,
  showNewArrivalsSection: false,
  showFeaturedSection: false,
};

function normalizeHomepage(homepage) {
  const raw = homepage?.toObject ? homepage.toObject() : homepage || {};
  return {
    ...DEFAULT_HOMEPAGE,
    ...raw,
    showBestSellersSection: Boolean(raw.showBestSellersSection),
    showNewArrivalsSection: Boolean(raw.showNewArrivalsSection),
    showFeaturedSection: Boolean(raw.showFeaturedSection),
  };
}

function coerceBool(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return fallback;
}

const getBanners = asyncHandler(async (req, res) => {
  const filter = req.userType === 'admin' ? {} : { status: 'active' };
  const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  sendSuccess(res, { data: banners });
});

const upsertBanner = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  let banner;
  if (req.params.id) {
    banner = await Banner.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!banner) throw new ApiError(404, 'Banner not found');
  } else {
    banner = await Banner.create(payload);
  }
  sendSuccess(res, { message: 'Banner saved', data: banner });
});

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) throw new ApiError(404, 'Banner not found');
  sendSuccess(res, { message: 'Banner deleted' });
});

const subscribeNewsletter = asyncHandler(async (req, res) => {
  const existing = await NewsletterSubscriber.findOne({ email: req.body.email.toLowerCase() });
  if (!existing) {
    await NewsletterSubscriber.create({ email: req.body.email.toLowerCase() });
  }
  sendSuccess(res, { message: 'Subscribed successfully' });
});

const listSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
  sendSuccess(res, { data: subscribers });
});

const createContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(req.body);
  sendSuccess(res, { message: 'Message received', data: message, statusCode: 201 });
});

const listContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  sendSuccess(res, { data: messages });
});

const updateContactStatus = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  );
  if (!message) throw new ApiError(404, 'Inquiry not found');
  sendSuccess(res, { message: 'Inquiry updated', data: message });
});

const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  sendSuccess(res, {
    data: {
      storeName: settings.storeName,
      tagline: settings.tagline,
      email: settings.email,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      address: settings.address,
      currency: settings.currency,
      freeShippingThreshold: settings.freeShippingThreshold,
      announcement: settings.announcement,
      about: settings.about,
      productDeliveryText:
        settings.productDeliveryText ||
        '2–4 business days in major cities. COD available.',
      productReturnsText:
        settings.productReturnsText || 'Unopened bottles eligible within 7 days.',
      paymentMethods: settings.paymentMethods,
      shippingCities: settings.shippingCities.filter((c) => c.active),
      homepage: normalizeHomepage(settings.homepage),
    },
  });
});

const getHomepage = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const categories = await Category.find({ status: 'active' }).sort({ sortOrder: 1, name: 1 });
  sendSuccess(res, {
    data: {
      homepage: normalizeHomepage(settings.homepage),
      categories,
    },
  });
});

const updateHomepage = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const incoming = req.body?.homepage || {};
  const current = normalizeHomepage(settings.homepage);
  const nextHomepage = normalizeHomepage({
    ...current,
    ...incoming,
    showBestSellersSection: coerceBool(
      incoming.showBestSellersSection,
      current.showBestSellersSection,
    ),
    showNewArrivalsSection: coerceBool(
      incoming.showNewArrivalsSection,
      current.showNewArrivalsSection,
    ),
    showFeaturedSection: coerceBool(incoming.showFeaturedSection, current.showFeaturedSection),
  });

  settings.homepage = nextHomepage;
  await settings.save();

  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'Updated homepage media',
    target: 'Homepage',
  });

  const categories = await Category.find({ status: 'active' }).sort({ sortOrder: 1, name: 1 });
  sendSuccess(res, {
    message: 'Homepage media saved',
    data: {
      homepage: normalizeHomepage(settings.homepage),
      categories,
    },
  });
});

const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  sendSuccess(res, { data: settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await StoreSetting.findOneAndUpdate({ key: 'default' }, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  await logActivity({
    actorType: 'admin',
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'Updated store settings',
    target: 'Store settings',
  });
  sendSuccess(res, { message: 'Settings updated', data: settings });
});

const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardAnalytics();
  sendSuccess(res, { data });
});

const listActivity = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
  sendSuccess(res, { data: logs });
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided');
  const publicBaseUrl = `${req.protocol}://${req.get('host')}`;
  const slot = req.body?.slot || req.query?.slot || 'product';
  const result = await saveUploadedImage(req.file, publicBaseUrl, { slot });
  sendSuccess(res, {
    message:
      result.storage === 'local' ? 'Image uploaded (local storage)' : 'Image uploaded to Cloudinary',
    data: {
      url: result.url,
      publicId: result.publicId,
      storage: result.storage,
      slot: result.slot,
    },
  });
});

module.exports = {
  getBanners,
  upsertBanner,
  deleteBanner,
  subscribeNewsletter,
  listSubscribers,
  createContactMessage,
  listContactMessages,
  updateContactStatus,
  getPublicSettings,
  getAdminSettings,
  updateSettings,
  getHomepage,
  updateHomepage,
  dashboard,
  listActivity,
  uploadImage,
};
