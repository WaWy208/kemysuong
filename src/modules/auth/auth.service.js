const bcrypt = require('bcryptjs');
const ApiError = require('../../utils/apiError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const authRepository = require('./auth.repository');
const { ROLES } = require('../../constants/enums');

function toPublicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  };
}

async function register(payload) {
  const { name, email, password } = payload;
  const role = payload.role || ROLES.CUSTOMER;

  if (role === ROLES.ADMIN) {
    throw new ApiError(403, 'Cannot self-register as admin');
  }

  const exists = await authRepository.findByEmail(email);
  if (exists) throw new ApiError(409, 'Email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await authRepository.createUser({ name, email, passwordHash, role });

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user)
  };
}

async function login(payload) {
  const { email, password } = payload;
  const user = await authRepository.findActiveByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const matched = await bcrypt.compare(password, user.passwordHash);
  if (!matched) throw new ApiError(401, 'Invalid credentials');

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user)
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw new ApiError(401, 'Refresh token missing');

  const payload = verifyRefreshToken(refreshToken);
  const user = await authRepository.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, 'User inactive');

  return {
    accessToken: signAccessToken(user)
  };
}

module.exports = {
  register,
  login,
  refresh
};
