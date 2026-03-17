function buildPaginationQuery(query) {
  const limit = Math.max(1, Math.min(Number(query.limit || 10), 50));
  const page = Math.max(1, Number(query.page || 1));
  const skip = (page - 1) * limit;
  return { limit, page, skip };
}

module.exports = { buildPaginationQuery };
