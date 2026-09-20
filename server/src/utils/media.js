function requestOrigin(req) {
  const host = req?.get?.('host');
  if (!host) return '';
  const protocol = req.protocol || 'https';
  return `${protocol}://${host}`;
}

function absolutizeMediaUrl(url, origin) {
  if (!url) return '';
  if (typeof url === 'object') {
    return absolutizeMediaUrl(url.url || url.secure_url || url.src || '', origin);
  }
  const value = String(url).trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (!origin) return value;
  if (value.startsWith('/')) return `${origin}${value}`;
  return value;
}

function withPublicImages(doc, req) {
  const origin = requestOrigin(req);
  const obj = doc?.toObject ? doc.toObject() : { ...doc };
  obj.images = (obj.images || []).map((url) => absolutizeMediaUrl(url, origin)).filter(Boolean);
  if (obj.image) obj.image = absolutizeMediaUrl(obj.image, origin);
  return obj;
}

function withPublicImageField(doc, req, field = 'image') {
  const origin = requestOrigin(req);
  const obj = doc?.toObject ? doc.toObject() : { ...doc };
  if (obj[field]) obj[field] = absolutizeMediaUrl(obj[field], origin);
  return obj;
}

module.exports = {
  requestOrigin,
  absolutizeMediaUrl,
  withPublicImages,
  withPublicImageField,
};
