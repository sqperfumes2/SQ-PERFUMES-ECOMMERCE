import { useEffect } from 'react'
import { brand } from '../../lib/brand'

export const SITE_URL = (import.meta.env.VITE_STOREFRONT_URL || 'https://www.sqperfumes.com').replace(
  /\/$/,
  '',
)

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function pageTitle(title) {
  if (!title) return `${brand.name} | Premium Perfumes in Pakistan`
  if (title.includes(brand.name)) return title
  return `${title} | ${brand.name}`
}

/**
 * Sets document title, description, Open Graph / Twitter tags, canonical, and optional JSON-LD.
 */
export default function Seo({
  title,
  description = brand.description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  jsonLd,
  jsonLdId = 'page-jsonld',
}) {
  const fullTitle = pageTitle(title)
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const ogImage = image && /^https?:\/\//i.test(image) ? image : `${SITE_URL}${image || '/og-default.jpg'}`

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta(
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    )
    upsertMeta('name', 'author', brand.name)
    upsertMeta('name', 'application-name', brand.name)

    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:image:alt', `${brand.name} — premium perfumes`)
    upsertMeta('property', 'og:site_name', brand.name)
    upsertMeta('property', 'og:locale', 'en_PK')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)

    upsertLink('canonical', url)
    upsertJsonLd(jsonLdId, jsonLd)

    return () => {
      if (jsonLd) upsertJsonLd(jsonLdId, null)
    }
  }, [fullTitle, description, url, ogImage, type, noindex, jsonLd, jsonLdId])

  return null
}

export function buildProductJsonLd(product, variantPrice) {
  if (!product) return null
  const url = `${SITE_URL}/product/${product.slug}`
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.name} by ${brand.name}`,
    description: product.shortDescription || product.description || brand.description,
    image: product.images?.length ? product.images : undefined,
    brand: {
      '@type': 'Brand',
      name: brand.name,
    },
    manufacturer: {
      '@type': 'Organization',
      name: brand.name,
    },
    sku: product.sku || product.slug,
    category: 'Perfume',
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: brand.currency,
      price: String(variantPrice ?? 0),
      availability: product.variants?.some((v) => v.stock > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: brand.name,
      },
    },
  }

  if (product.reviewCount > 0 && product.rating > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating),
      reviewCount: String(product.reviewCount),
      bestRating: '5',
      worstRating: '1',
    }
  }

  return data
}

export function organizationJsonLd() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: brand.name,
    alternateName: ['SQ', 'SQ Perfumes Pakistan', 'SQ Perfume'],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/favicon.jpeg`,
    },
    image: `${SITE_URL}/og-default.jpg`,
    description: brand.description,
    email: brand.contact.email,
    telephone: brand.contact.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pakistan',
      addressCountry: 'PK',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Pakistan',
    },
    sameAs: Object.values(brand.socials).filter(Boolean),
  }
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: brand.name,
    alternateName: ['SQ', 'SQ Perfumes'],
    url: SITE_URL,
    inLanguage: 'en-PK',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd(), websiteJsonLd()],
  }
}

export function faqJsonLd(items = []) {
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
