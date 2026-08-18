const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i

/**
 * Insert Cloudinary fetch/quality/size transforms so original PNG uploads are not served at full weight.
 */
export function cloudinaryUrl(url, { width, height, crop = 'limit', quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url
  const match = url.match(CLOUDINARY_UPLOAD)
  if (!match) return url

  const [, prefix, rest] = match
  if (/^(f_auto|q_auto|w_\d+)/.test(rest)) return url

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
  return widths.map((width) => `${cloudinaryUrl(url, { width })} ${width}w`).join(', ')
}
