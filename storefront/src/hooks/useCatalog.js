import { useCallback, useEffect, useState } from 'react'
import { storeApi, getErrorMessage } from '../lib/services'
import { normalizeProduct } from '../lib/normalize'

export function useProducts(params = {}, { enabled = true } = {}) {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const key = JSON.stringify(params)

  const load = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await storeApi.products(params)
      setProducts((data.data || []).map(normalizeProduct))
      setMeta(data.meta || null)
    } catch (err) {
      setError(getErrorMessage(err))
      setProducts([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [enabled, key])

  useEffect(() => {
    load()
  }, [load])

  return { products, meta, loading, error, reload: load }
}

export function useProductBySlug(slug) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return undefined
    let alive = true
    setLoading(true)
    storeApi
      .productBySlug(slug)
      .then(({ data }) => {
        if (alive) setProduct(normalizeProduct(data.data))
      })
      .catch((err) => {
        if (alive) {
          setProduct(null)
          setError(getErrorMessage(err))
        }
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [slug])

  return { product, loading, error }
}

export function useCategories() {
  const [categories, setCategories] = useState([])
  useEffect(() => {
    storeApi
      .categories()
      .then(({ data }) => {
        if (data.data?.length) {
          setCategories(
            data.data.map((c) => ({
              ...c,
              id: c._id || c.id,
            })),
          )
        }
      })
      .catch(() => {})
  }, [])
  return categories
}

export function useFamilies() {
  const [families, setFamilies] = useState([])
  useEffect(() => {
    storeApi
      .families()
      .then(({ data }) => {
        setFamilies(
          (data.data || []).map((family) => ({
            ...family,
            id: family._id || family.id,
          })),
        )
      })
      .catch(() => {})
  }, [])
  return families
}

const HOMEPAGE_CACHE_KEY = 'sq-homepage-media'

function emptyHomepage() {
  return {
    image: '',
    shopAllImage: '',
    bestSellersImage: '',
    showBestSellersSection: false,
    showNewArrivalsSection: false,
    showFeaturedSection: false,
  }
}

function readHomepageCache() {
  try {
    const raw = sessionStorage.getItem(HOMEPAGE_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeHomepageCache(payload) {
  try {
    sessionStorage.setItem(HOMEPAGE_CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota / private mode */
  }
}

export function useHomepageMedia() {
  const cached = typeof sessionStorage !== 'undefined' ? readHomepageCache() : null
  const [homepage, setHomepage] = useState(cached?.homepage || emptyHomepage())
  const [categories, setCategories] = useState(cached?.categories || [])
  const [loading, setLoading] = useState(!cached?.homepage?.image)

  useEffect(() => {
    let alive = true
    storeApi
      .homepage()
      .then(({ data }) => {
        if (!alive) return
        const nextHomepage = {
          ...emptyHomepage(),
          ...data.data?.homepage,
          shopAllImage: data.data?.homepage?.shopAllImage || '',
          bestSellersImage: data.data?.homepage?.bestSellersImage || '',
          showBestSellersSection: Boolean(data.data?.homepage?.showBestSellersSection),
          showNewArrivalsSection: Boolean(data.data?.homepage?.showNewArrivalsSection),
          showFeaturedSection: Boolean(data.data?.homepage?.showFeaturedSection),
        }
        const nextCategories = (data.data?.categories || []).map((c) => ({
          ...c,
          id: c._id || c.id,
        }))
        setHomepage(nextHomepage)
        setCategories(nextCategories)
        writeHomepageCache({ homepage: nextHomepage, categories: nextCategories })
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { homepage, categories, loading }
}
