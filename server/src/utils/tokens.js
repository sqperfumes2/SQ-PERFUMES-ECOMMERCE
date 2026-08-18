const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  const common = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
    path: '/',
  };

  // Keep cookie lifetime aligned with JWT_ACCESS_EXPIRES_IN (default 8h).
  const accessMs = parseDurationMs(env.JWT_ACCESS_EXPIRES_IN) || 8 * 60 * 60 * 1000;
  const refreshMs = parseDurationMs(env.JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60 * 1000;

  res.cookie('accessToken', accessToken, {
    ...common,
    maxAge: accessMs,
  });

  res.cookie('refreshToken', refreshToken, {
    ...common,
    maxAge: refreshMs,
  });
}

function parseDurationMs(value) {
  if (!value || typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const mult = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return amount * (mult[unit] || 0);
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
};
