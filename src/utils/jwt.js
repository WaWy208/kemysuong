const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.accessSecret, { expiresIn: env.accessExpires });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.refreshSecret, { expiresIn: env.refreshExpires });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
