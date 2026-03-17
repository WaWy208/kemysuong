const ApiError = require('../../utils/apiError');
const { buildPaginationQuery } = require('../../utils/pagination');
const { ROLES } = require('../../constants/enums');
const usersRepository = require('./users.repository');

async function getMe(userId) {
  const user = await usersRepository.findPublicById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function listMembers(query) {
  const { limit, page, skip } = buildPaginationQuery(query);
  const filter = {};

  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = String(query.isActive) === 'true';
  if (query.keyword) {
    const escaped = String(query.keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [items, total] = await Promise.all([
    usersRepository.findMany(filter, { skip, limit, sort: { createdAt: -1 } }),
    usersRepository.count(filter)
  ]);

  return { items, page, limit, total };
}

async function updateMember(userId, payload, actorId) {
  const user = await usersRepository.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (String(user._id) === String(actorId) && payload.role && payload.role !== user.role) {
    throw new ApiError(400, 'You cannot change your own role');
  }

  const updated = await usersRepository.updateById(userId, payload);
  if (!updated) throw new ApiError(404, 'User not found');
  return updated;
}

async function memberStats() {
  const [totalAdmins, totalCustomers, totalActive] = await Promise.all([
    usersRepository.countByRole(ROLES.ADMIN),
    usersRepository.countByRole(ROLES.CUSTOMER),
    usersRepository.countActiveUsers()
  ]);

  return { totalAdmins, totalCustomers, totalActive };
}

module.exports = {
  getMe,
  listMembers,
  updateMember,
  memberStats
};
