const jwt = require('jsonwebtoken');

const readAdminId = (req) => {
  const authorization = req.get('Authorization');
  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    const error = new Error('Invalid authorization header');
    error.status = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(match[1], process.env.JWT_SECRET);
    if (typeof decoded !== 'object' || typeof decoded.id !== 'string') {
      throw new Error('Invalid token payload');
    }
    return decoded.id;
  } catch {
    const error = new Error('Invalid or expired token');
    error.status = 401;
    throw error;
  }
};

const optionalAuth = (req, res, next) => {
  try {
    req.adminId = readAdminId(req);
    return next();
  } catch (error) {
    return next(error);
  }
};

const authenticate = (req, res, next) => {
  try {
    req.adminId = readAdminId(req);
    if (!req.adminId) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { authenticate, optionalAuth };
