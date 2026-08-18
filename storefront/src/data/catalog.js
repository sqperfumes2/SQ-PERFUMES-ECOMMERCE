import { getLowestPrice, getVariantPrice, discountPercent } from '../lib/format'

export function filterProducts(list, filters = {}) {
  let result = [...list]

  if (filters.gender) {
    result = result.filter((p) => p.gender === filters.gender)
  }
  if (filters.category) {
    result = result.filter((p) => p.category === filters.category)
  }
  if (filters.collection === 'new') {
    result = result.filter((p) => p.newArrival)
  }
  if (filters.collection === 'best') {
    result = result.filter((p) => p.bestSeller)
  }
  if (filters.collection === 'sale') {
    result = result.filter((p) => p.onSale || p.variants.some((v) => v.compareAtPrice))
  }
  if (filters.fragranceFamily?.length) {
    result = result.filter((p) => filters.fragranceFamily.includes(p.fragranceFamily))
  }
  if (filters.sizes?.length) {
    result = result.filter((p) => p.variants.some((v) => filters.sizes.includes(v.size)))
  }
  if (filters.availability === 'in-stock') {
    result = result.filter((p) => p.variants.some((v) => v.stock > 0))
  }
  if (filters.availability === 'out-of-stock') {
    result = result.filter((p) => p.variants.every((v) => v.stock <= 0))
  }
  if (filters.minPrice != null) {
    result = result.filter((p) => getLowestPrice(p) >= filters.minPrice)
  }
  if (filters.maxPrice != null) {
    result = result.filter((p) => getLowestPrice(p) <= filters.maxPrice)
  }
  if (filters.query) {
    const q = filters.query.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.fragranceFamily.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q) ||
        p.topNotes.some((n) => n.toLowerCase().includes(q)) ||
        p.middleNotes.some((n) => n.toLowerCase().includes(q)) ||
        p.baseNotes.some((n) => n.toLowerCase().includes(q)),
    )
  }

  switch (filters.sort) {
    case 'price-asc':
      result.sort((a, b) => getLowestPrice(a) - getLowestPrice(b))
      break
    case 'price-desc':
      result.sort((a, b) => getLowestPrice(b) - getLowestPrice(a))
      break
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'discount':
      result.sort((a, b) => {
        const da = Math.max(
          ...a.variants.map((v) => discountPercent(getVariantPrice(v), v.compareAtPrice || 0)),
        )
        const db = Math.max(
          ...b.variants.map((v) => discountPercent(getVariantPrice(v), v.compareAtPrice || 0)),
        )
        return db - da
      })
      break
    case 'popularity':
    default:
      result.sort((a, b) => b.popularity - a.popularity)
      break
  }

  return result
}

export function paginate(list, page = 1, perPage = 9) {
  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * perPage
  return {
    items: list.slice(start, start + perPage),
    total,
    page: current,
    totalPages,
    perPage,
  }
}
