const crypto = require('crypto');
const env = require('../config/env');

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

function csrfTokenRoute(req, res) {
  const token = generateToken();
  const appOrigin = String(env.appBaseUrl || '').trim();
  const frontendOrigin = String(env.frontendUrl || '').trim();
  const isCrossSite = Boolean(appOrigin && frontendOrigin && appOrigin !== frontendOrigin);

  res.cookie('csrfToken', token, {
    httpOnly: false,
    sameSite: isCrossSite ? 'none' : 'lax',
    secure: isCrossSite || env.nodeEnv === 'production',
    maxAge: 24 * 60 * 60 * 1000
  });
  res.json({ csrfToken: token });
}

function csrfProtection(req, _res, next) {
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (safeMethod) return next();

  const hasBearer = String(req.headers.authorization || '').startsWith('Bearer ');
  if (hasBearer) return next();

  const cookieToken = req.cookies ? req.cookies.csrfToken : '';
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next({ statusCode: 403, message: 'Invalid CSRF token' });
  }

  return next();
}

module.exports = {
  csrfTokenRoute,
  csrfProtection
};
