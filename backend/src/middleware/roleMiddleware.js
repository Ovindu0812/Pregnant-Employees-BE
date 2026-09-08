const ApiError = require('../utils/ApiError');

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.profile || !allowedRoles.includes(req.profile.role)) {
    return next(new ApiError(403, 'You do not have permission to access this resource.'));
  }
  return next();
};

module.exports = { requireRole };
