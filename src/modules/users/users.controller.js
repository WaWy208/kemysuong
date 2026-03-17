const asyncHandler = require('../../utils/asyncHandler');
const usersService = require('./users.service');

const getMe = asyncHandler(async (req, res) => {
  const data = await usersService.getMe(req.auth.sub);
  res.json(data);
});

const listMembers = asyncHandler(async (req, res) => {
  const data = await usersService.listMembers(req.query);
  res.json(data);
});

const updateMember = asyncHandler(async (req, res) => {
  const data = await usersService.updateMember(req.params.id, req.body, req.auth.sub);
  res.json(data);
});

const memberStats = asyncHandler(async (_req, res) => {
  const data = await usersService.memberStats();
  res.json(data);
});

module.exports = { getMe, listMembers, updateMember, memberStats };
