const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { ApiError } = require('../utils/ApiError');
const AdminUser = require('../models/AdminUser');
const Customer = require('../models/Customer');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} = require('../utils/tokens');
const { logActivity } = require('../utils/activity');
const { env } = require('../config/env');
const { isMailConfigured, sendMail } = require('../utils/mailer');

function issueTokens(res, user, role) {
  const payload = {
    sub: String(user._id),
    role,
    email: user.email,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  setAuthCookies(res, { accessToken, refreshToken });

  return { accessToken, refreshToken, payload };
}

async function persistRefreshToken(user, refreshToken) {
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save({ validateBeforeSave: false });
}

async function loginAdmin({ email, password }, res) {
  const admin = await AdminUser.findOne({ email }).select('+password +refreshTokenHash');
  if (!admin || !(await admin.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!admin.isActive) throw new ApiError(403, 'Admin account is disabled');

  const tokens = issueTokens(res, admin, admin.role);
  await persistRefreshToken(admin, tokens.refreshToken);
  await logActivity({
    actorType: 'admin',
    actorId: admin._id,
    actorName: admin.name,
    action: 'Admin login',
    target: admin.email,
  });

  return admin.toSafeObject();
}

async function loginCustomer({ email, password }, res) {
  const customer = await Customer.findOne({ email }).select('+password +refreshTokenHash');
  if (!customer || !(await customer.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!customer.isActive) throw new ApiError(403, 'Account is disabled');

  const tokens = issueTokens(res, customer, 'customer');
  await persistRefreshToken(customer, tokens.refreshToken);
  return customer.toSafeObject();
}

async function registerCustomer(payload, res) {
  const exists = await Customer.findOne({ email: payload.email });
  if (exists) throw new ApiError(409, 'Email already registered');

  const customer = await Customer.create(payload);
  const tokens = issueTokens(res, customer, 'customer');
  await persistRefreshToken(customer, tokens.refreshToken);
  return customer.toSafeObject();
}

async function refreshSession(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token missing');

  const decoded = verifyRefreshToken(token);
  const Model = decoded.role === 'customer' ? Customer : AdminUser;
  const user = await Model.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) throw new ApiError(401, 'Session expired');

  const valid = await bcrypt.compare(token, user.refreshTokenHash);
  if (!valid) throw new ApiError(401, 'Invalid refresh token');

  const role = decoded.role === 'customer' ? 'customer' : user.role;
  const tokens = issueTokens(res, user, role);
  await persistRefreshToken(user, tokens.refreshToken);

  return user.toSafeObject();
}

async function logout(req, res) {
  if (req.user) {
    req.user.refreshTokenHash = undefined;
    await req.user.save({ validateBeforeSave: false });
  }
  clearAuthCookies(res);
}

async function requestPasswordReset(Model, email, { appUrl } = {}) {
  const user = await Model.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
  if (!user) {
    return { message: 'If that email exists, a reset link will be sent.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const baseUrl = (appUrl || env.CLIENT_URL || '').replace(/\/$/, '');
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  if (isMailConfigured()) {
    await sendMail({
      to: user.email,
      subject: 'Reset your SQ Perfumes password',
      text: `Reset your password using this link (expires in 1 hour):\n${resetUrl}`,
      html: `<p>Reset your password using this link. It expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  } else {
    console.warn('SMTP is not configured; password reset email was not sent.');
  }

  return {
    message: 'If that email exists, a reset link will be sent.',
    ...(env.NODE_ENV !== 'production' ? { resetToken: token } : {}),
  };
}

async function resetPassword(Model, { token, password }) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await Model.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenHash = undefined;
  await user.save();
}

module.exports = {
  loginAdmin,
  loginCustomer,
  registerCustomer,
  refreshSession,
  logout,
  requestPasswordReset,
  resetPassword,
};
