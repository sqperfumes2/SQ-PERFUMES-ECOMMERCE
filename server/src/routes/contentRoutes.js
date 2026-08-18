const express = require('express');
const contentController = require('../controllers/contentController');
const { validate } = require('../middleware/validate');
const {
  bannerSchema,
  contactSchema,
  newsletterSchema,
} = require('../validators/resourceValidators');
const { protect, requireAdmin, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { z } = require('zod');

const router = express.Router();

router.get('/banners', optionalAuth, contentController.getBanners);
router.get('/settings', contentController.getPublicSettings);
router.get('/homepage', contentController.getHomepage);
router.post('/newsletter', validate(newsletterSchema), contentController.subscribeNewsletter);
router.post('/contact', validate(contactSchema), contentController.createContactMessage);

router.use('/admin', protect, requireAdmin());
router.get('/admin/dashboard', contentController.dashboard);
router.get('/admin/homepage', contentController.getHomepage);
router.put('/admin/homepage', contentController.updateHomepage);
router.get('/admin/banners', contentController.getBanners);
router.post('/admin/banners', validate(bannerSchema), contentController.upsertBanner);
router.put('/admin/banners/:id', validate(bannerSchema), contentController.upsertBanner);
router.delete('/admin/banners/:id', contentController.deleteBanner);
router.get('/admin/newsletter', contentController.listSubscribers);
router.get('/admin/inquiries', contentController.listContactMessages);
router.patch(
  '/admin/inquiries/:id',
  validate(z.object({ status: z.enum(['open', 'replied', 'closed']) })),
  contentController.updateContactStatus,
);
router.get('/admin/settings', contentController.getAdminSettings);
router.put('/admin/settings', contentController.updateSettings);
router.get('/admin/activity', contentController.listActivity);
router.post('/admin/uploads', upload.single('image'), contentController.uploadImage);

module.exports = router;
