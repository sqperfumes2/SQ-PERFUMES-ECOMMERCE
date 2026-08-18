const { ApiError } = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/tokens');
const AdminUser = require('../models/AdminUser');
const Customer = require('../models/Customer');

function getToken(req) {
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

async function protect(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) throw new ApiError(401, 'Authentication required');

    const decoded = verifyAccessToken(token);
    req.auth = decoded;

    if (decoded.role === 'customer') {
      const customer = await Customer.findById(decoded.sub);
      if (!customer || !customer.isActive) throw new ApiError(401, 'Customer not found');
      req.user = customer;
      req.userType = 'customer';
    } else {
      const admin = await AdminUser.findById(decoded.sub);
      if (!admin || !admin.isActive) throw new ApiError(401, 'Admin not found');
      req.user = admin;
      req.userType = 'admin';
    }

    next();
  } catch (error) {
    next(error);
  }
}

function requireAdmin(...roles) {
  return (req, res, next) => {
    if (req.userType !== 'admin') {
      return next(new ApiError(403, 'Admin access required'));
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient admin privileges'));
    }
    return next();
  };
}

function requireCustomer(req, res, next) {
  if (req.userType !== 'customer') {
    return next(new ApiError(403, 'Customer access required'));
  }
  return next();
}

async function optionalAuth(req, res, next) {
  const token = getToken(req);
  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    req.auth = decoded;

    if (decoded.role === 'customer') {
      const customer = await Customer.findById(decoded.sub);
      if (customer?.isActive) {
        req.user = customer;
        req.userType = 'customer';
      }
    } else {
      const admin = await AdminUser.findById(decoded.sub);
      if (admin?.isActive) {
        req.user = admin;
        req.userType = 'admin';
      }
    }
  } catch {
    // ignore invalid optional token
  }

  return next();
}

module.exports = { protect, requireAdmin, requireCustomer, optionalAuth };
