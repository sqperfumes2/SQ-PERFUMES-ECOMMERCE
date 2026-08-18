import { brand } from './brand'

export function formatPrice(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return `${brand.currencySymbol} 0`
  const formatted = Number(amount).toLocaleString('en-PK')
  return `${brand.currencySymbol} ${formatted}`
}

export function discountPercent(price, compareAtPrice) {
  if (!compareAtPrice || compareAtPrice <= price) return 0
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getVariantPrice(variant) {
  return variant?.salePrice ?? variant?.price ?? 0
}

export function getLowestPrice(product) {
  if (!product?.variants?.length) return 0
  return Math.min(...product.variants.map(getVariantPrice))
}

export function getHighestCompareAt(product) {
  if (!product?.variants?.length) return null
  const values = product.variants
    .map((v) => v.compareAtPrice)
    .filter((v) => v != null)
  return values.length ? Math.max(...values) : null
}
