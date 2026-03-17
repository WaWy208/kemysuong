const { ALLOWED_TRANSITIONS } = require('../../constants/enums');

function canTransition(current, next) {
  return (ALLOWED_TRANSITIONS[current] || []).includes(next);
}

module.exports = { canTransition };
