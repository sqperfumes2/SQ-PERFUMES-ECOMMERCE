const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const {
  loginSchema,
  registerCustomerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('../validators/authValidators');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, try again later' },
});

router.use(authLimiter);

router.post('/admin/login', validate(loginSchema), authController.adminLogin);
router.post(
  '/admin/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotAdminPassword,
);
router.post(
  '/admin/reset-password',
  validate(resetPasswordSchema),
  authController.resetAdminPassword,
);

router.post('/register', validate(registerCustomerSchema), authController.customerRegister);
router.post('/login', validate(loginSchema), authController.customerLogin);
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotCustomerPassword,
);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetCustomerPassword);

router.post('/refresh', authController.refresh);
router.get('/me', protect, authController.me);
router.post('/logout', protect, authController.logout);
router.patch(
  '/change-password',
  protect,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.patch('/admin/profile', protect, requireAdmin(), authController.updateAdminProfile);

module.exports = router;
