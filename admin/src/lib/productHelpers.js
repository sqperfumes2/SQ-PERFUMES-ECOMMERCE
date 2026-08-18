export const audienceLabels = {
  men: 'For Him',
  women: 'For Her',
  unisex: 'Unisex',
}

export function audienceLabel(value) {
  return audienceLabels[value] || value
}

export function totalStock(product) {
  return (product?.variants || []).reduce((sum, v) => sum + Number(v.stock || 0), 0)
}

export function isSoldOut(product) {
  return totalStock(product) <= 0
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function toProductPayload(form) {
  const variants = (form.variants || []).map((v) => {
    const discounted = Number(v.price)
    const actual =
      v.compareAtPrice === '' || v.compareAtPrice == null || v.compareAtPrice === undefined
        ? null
        : Number(v.compareAtPrice)
    return {
      size: v.size,
      sku: v.sku,
      price: discounted,
      compareAtPrice: actual && actual > discounted ? actual : null,
      stock: Number(v.stock || 0),
      previousStock: Number(v.previousStock || 0),
    }
  })

  const images = Array.isArray(form.images)
    ? form.images.filter(Boolean)
    : String(form.imagesText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

  const onSale = variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price)

  return {
    name: form.name,
    slug: form.slug || slugify(form.name),
    sku: form.sku,
    shortDescription: form.shortDescription || '',
    description: form.description || '',
    brand: form.brand || 'SQ Perfumes',
    category: form.gender,
    gender: form.gender,
    fragranceFamily: form.fragranceFamily,
    topNotes: splitNotes(form.topNotes),
    middleNotes: splitNotes(form.middleNotes),
    baseNotes: splitNotes(form.baseNotes),
    variants,
    images,
    featured: Boolean(form.featured),
    bestSeller: Boolean(form.bestSeller),
    newArrival: Boolean(form.newArrival),
    onSale: Boolean(form.onSale) || onSale,
    occasion: form.occasion || '',
    longevity: form.longevity || '',
    sillage: form.sillage || '',
    ingredients: form.ingredients || '',
    status: form.status || 'active',
  }
}

function splitNotes(value) {
  if (Array.isArray(value)) return value
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function notesToText(value) {
  if (Array.isArray(value)) return value.join(', ')
  return String(value || '')
}

export function fromApiProduct(product) {
  return {
    ...product,
    id: product._id || product.id,
    image: product.images?.[0] || '',
    images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
    topNotes: notesToText(product.topNotes),
    middleNotes: notesToText(product.middleNotes),
    baseNotes: notesToText(product.baseNotes),
    variants: (product.variants || []).map((v) => ({
      ...v,
      compareAtPrice: v.compareAtPrice ?? '',
    })),
  }
}
