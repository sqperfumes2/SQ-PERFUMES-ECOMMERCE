function getPagination(query, defaults = { page: 1, limit: 12 }) {
  const page = Math.max(1, Number(query.page) || defaults.page);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || defaults.limit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildSort(sort) {
  switch (sort) {
    case 'price-asc':
      return { 'variants.price': 1 };
    case 'price-desc':
      return { 'variants.price': -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'popularity':
      return { popularity: -1 };
    case 'name':
      return { name: 1 };
    default:
      return { createdAt: -1 };
  }
}

module.exports = { getPagination, buildSort };
