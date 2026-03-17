const User = require('../users/user.model');

async function findByEmail(email) {
  return User.findOne({ email });
}

async function findActiveByEmail(email) {
  return User.findOne({ email, isActive: true });
}

async function createUser(payload) {
  return User.create(payload);
}

async function findById(id) {
  return User.findById(id);
}

module.exports = {
  findByEmail,
  findActiveByEmail,
  createUser,
  findById
};
