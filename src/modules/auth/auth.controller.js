const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.cookie('refreshToken', result.refreshToken, cookieOptions);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie('refreshToken', result.refreshToken, cookieOptions);
  res.json(result);
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const result = await authService.refresh(token);
  res.json(result);
});

module.exports = { register, login, refresh };
