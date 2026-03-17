const User = require('./user.model');

function findPublicById(id) {
  return User.findById(id).select('_id name email role isActive createdAt updatedAt').lean();
}

function findById(id) {
  return User.findById(id);
}

function findMany(filter, { skip, limit, sort }) {
  return User.find(filter)
    .select('_id name email role isActive createdAt updatedAt')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
}

function count(filter) {
  return User.countDocuments(filter);
}

function updateById(id, payload) {
  return User.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    .select('_id name email role isActive createdAt updatedAt')
    .lean();
}

function countByRole(role) {
  return User.countDocuments({ role });
}

function countActiveUsers() {
  return User.countDocuments({ isActive: true });
}

module.exports = {
  findPublicById,
  findById,
  findMany,
  count,
  updateById,
  countByRole,
  countActiveUsers
};
