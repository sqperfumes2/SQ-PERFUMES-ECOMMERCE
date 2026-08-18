const SITE = (process.env.VITE_STOREFRONT_URL || 'https://www.sqperfumes.com').replace(/\/$/, '')
const API = (process.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  /\/$/,
  '',
)

const STATIC_PATHS = [
  ['/', '1.0', 'daily'],
  ['/shop', '0.9', 'daily'],
  ['/shop/men', '0.8', 'weekly'],
  ['/shop/women', '0.8', 'weekly'],
  ['/shop/unisex', '0.8', 'weekly'],
  ['/shop/new-arrivals', '0.7', 'weekly'],
  ['/shop/best-sellers', '0.7', 'weekly'],
  ['/shop/sale', '0.7', 'weekly'],
  ['/about', '0.6', 'monthly'],
  ['/contact', '0.5', 'monthly'],
  ['/faq', '0.5', 'monthly'],
  ['/shipping', '0.4', 'monthly'],
  ['/returns', '0.4', 'monthly'],
  ['/privacy', '0.3', 'yearly'],
  ['/terms', '0.3', 'yearly'],
]

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function urlEntry(loc, changefreq, priority, lastmod) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export default async function handler(req, res) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = STATIC_PATHS.map(([path, priority, changefreq]) =>
    urlEntry(`${SITE}${path}`, changefreq, priority, today),
  )

  try {
    const response = await fetch(`${API}/products?limit=200`)
    const json = await response.json()
    const products = json.data || []
    for (const product of products) {
      if (!product?.slug || product.status === 'archived') continue
      const lastmod = (product.updatedAt || product.createdAt || today).toString().slice(0, 10)
      urls.push(urlEntry(`${SITE}/product/${product.slug}`, 'weekly', '0.8', lastmod))
    }
  } catch {
    /* keep static URLs if the catalog API is unreachable */
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(xml)
}
