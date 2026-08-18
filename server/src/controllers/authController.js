const AdminUser = require('../models/AdminUser');
const Customer = require('../models/Customer');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { env } = require('../config/env');
const authService = require('../services/authService');
const { logActivity } = require('../utils/activity');

const adminLogin = asyncHandler(async (req, res) => {
  const admin = await authService.loginAdmin(req.body, res);
  sendSuccess(res, { message: 'Admin logged in', data: { admin } });
});

const customerRegister = asyncHandler(async (req, res) => {
  const customer = await authService.registerCustomer(req.body, res);
  sendSuccess(res, { statusCode: 201, message: 'Customer registered', data: { customer } });
});

const customerLogin = asyncHandler(async (req, res) => {
  const customer = await authService.loginCustomer(req.body, res);
  sendSuccess(res, { message: 'Customer logged in', data: { customer } });
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    data: {
      userType: req.userType,
      user: req.user.toSafeObject(),
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const user = await authService.refreshSession(req, res);
  sendSuccess(res, { message: 'Session refreshed', data: { user } });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req, res);
  sendSuccess(res, { message: 'Logged out' });
});

const forgotCustomerPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(Customer, req.body.email, {
    appUrl: env.CLIENT_URL,
  });
  sendSuccess(res, { message: result.message, data: result });
});

const resetCustomerPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(Customer, req.body);
  sendSuccess(res, { message: 'Password reset successful' });
});

const forgotAdminPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(AdminUser, req.body.email, {
    appUrl: env.ADMIN_URL,
  });
  sendSuccess(res, { message: result.message, data: result });
});

const resetAdminPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(AdminUser, req.body);
  sendSuccess(res, { message: 'Password reset successful' });
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await (req.userType === 'admin' ? AdminUser : Customer)
    .findById(req.user._id)
    .select('+password');
  if (!user || !(await user.comparePassword(req.body.currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }
  user.password = req.body.newPassword;
  await user.save();
  await logActivity({
    actorType: req.userType,
    actorId: user._id,
    actorName: user.name,
    action: 'Password changed',
    target: user.email,
  });
  sendSuccess(res, { message: 'Password updated' });
});

const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.user._id);
  if (req.body.name) admin.name = req.body.name;
  if (req.body.email) admin.email = req.body.email;
  await admin.save();
  sendSuccess(res, { message: 'Profile updated', data: { admin: admin.toSafeObject() } });
});

module.exports = {
  adminLogin,
  customerRegister,
  customerLogin,
  me,
  refresh,
  logout,
  forgotCustomerPassword,
  resetCustomerPassword,
  forgotAdminPassword,
  resetAdminPassword,
  changePassword,
  updateAdminProfile,
};
