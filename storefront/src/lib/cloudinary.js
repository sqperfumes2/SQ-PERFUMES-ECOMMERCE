const CLOUDINARY_UPLOAD =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i

function apiOrigin() {
  const api = String(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
  return api.replace(/\/api$/i, '')
}

/**
 * Turn stored product/media paths into browser-loadable URLs.
 * Relative /uploads files live on the API host, not the Vercel storefront.
 */
export function mediaUrl(url) {
  if (!url) return ''
  if (typeof url === 'object') {
    return mediaUrl(url.url || url.secure_url || url.src || '')
  }
  const value = String(url).trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('/uploads/')) return `${apiOrigin()}${value}`
  if (value.startsWith('uploads/')) return `${apiOrigin()}/${value}`
  return value
}

/**
 * Insert Cloudinary fetch/quality/size transforms so original PNG uploads are not served at full weight.
 */
export function cloudinaryUrl(url, { width, height, crop = 'limit', quality = 'auto' } = {}) {
  const resolved = mediaUrl(url)
  if (!resolved) return ''
  const match = resolved.match(CLOUDINARY_UPLOAD)
  if (!match) return resolved

  const [, prefix, rest] = match
  if (/^(f_auto|q_auto|w_\d+)/.test(rest)) return resolved

  const transforms = [
    'f_auto',
    `q_${quality}`,
    width ? `w_${Math.round(width)}` : null,
    height ? `h_${Math.round(height)}` : null,
    `c_${crop}`,
  ]
    .filter(Boolean)
    .join(',')

  return `${prefix}${transforms}/${rest}`
}

export function cloudinarySrcSet(url, widths = [640, 960, 1280]) {
  const resolved = mediaUrl(url)
  if (!resolved) return ''
  return widths.map((width) => `${cloudinaryUrl(resolved, { width })} ${width}w`).join(', ')
}
