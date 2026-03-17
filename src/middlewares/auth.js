const ApiError = require('../utils/apiError');
const { verifyAccessToken } = require('../utils/jwt');

function authRequired(req, _res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return next(new ApiError(401, 'Unauthorized'));

  try {
    req.auth = verifyAccessToken(token);
    return next();
  } catch (_e) {
    return next(new ApiError(401, 'Invalid token'));
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth) return next(new ApiError(401, 'Unauthorized'));
    if (!roles.includes(req.auth.role)) return next(new ApiError(403, 'Forbidden'));
    return next();
  };
}

module.exports = { authRequired, requireRole };
