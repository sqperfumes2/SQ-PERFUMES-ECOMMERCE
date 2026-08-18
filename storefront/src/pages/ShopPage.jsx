import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import ProductGrid from '../components/product/ProductGrid'
import FilterSidebar from '../components/product/FilterSidebar'
import QuickViewModal from '../components/product/QuickViewModal'
import Pagination from '../components/ui/Pagination'
import { Select } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { SlidersHorizontal } from 'lucide-react'
import Seo from '../components/seo/Seo'
import { useCategories, useProducts } from '../hooks/useCatalog'
import { filterProducts, paginate } from '../data/catalog'

const collectionMeta = {
  all: {
    title: 'Shop SQ Perfumes Perfumes',
    description:
      'Shop the official SQ Perfumes collection — premium perfumes for him, her, and unisex, with Cash on Delivery in Pakistan.',
    filters: {},
  },
  men: {
    title: 'SQ Perfumes for Him',
    description:
      'Shop SQ Perfumes perfumes for him — woody, oriental, and aromatic compositions made for lasting presence.',
    filters: { gender: 'men', category: 'men' },
  },
  women: {
    title: 'SQ Perfumes for Her',
    description:
      'Shop SQ Perfumes perfumes for her — floral, musky, and soft oriental trails with lasting elegance.',
    filters: { gender: 'women', category: 'women' },
  },
  unisex: {
    title: 'Unisex SQ Perfumes Perfumes',
    description:
      'Shop unisex SQ Perfumes perfumes — shared signatures that are clean, resinous, and quietly powerful.',
    filters: { gender: 'unisex', category: 'unisex' },
  },
  'new-arrivals': {
    title: 'New SQ Perfumes Arrivals',
    description: 'The latest SQ Perfumes perfumes added to the collection.',
    filters: { collection: 'new' },
  },
  'best-sellers': {
    title: 'SQ Perfumes Best Sellers',
    description: 'Best-selling SQ Perfumes perfumes — customer favorites with lasting trails.',
    filters: { collection: 'best' },
  },
  sale: {
    title: 'SQ Perfumes Sale',
    description: 'Selected SQ Perfumes bottles with seasonal reductions.',
    filters: { collection: 'sale' },
  },
}

export default function ShopPage({ collection: collectionProp }) {
  const { collection: collectionParam } = useParams()
  const collection = collectionProp || collectionParam || 'all'
  const categories = useCategories()

  const meta = useMemo(() => {
    if (collectionMeta[collection]) return collectionMeta[collection]
    const cat = categories.find((c) => c.slug === collection)
    if (cat) {
      return {
        title: cat.name,
        description: cat.description || `Shop the ${cat.name} collection.`,
        filters: { category: cat.slug },
      }
    }
    return {
      title: collection.replace(/-/g, ' '),
      description: 'Explore this collection.',
      filters: { category: collection },
    }
  }, [collection, categories])

  const [searchParams, setSearchParams] = useSearchParams()
  const [quickView, setQuickView] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filters = useMemo(() => {
    const fragranceFamily = searchParams.get('family')
      ? searchParams.get('family').split(',').filter(Boolean)
      : []
    const sizes = searchParams.get('sizes')
      ? searchParams.get('sizes').split(',').filter(Boolean)
      : []

    return {
      ...meta.filters,
      gender: searchParams.get('gender') || meta.filters.gender,
      category: meta.filters.category,
      fragranceFamily,
      sizes,
      minPrice: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
      maxPrice: searchParams.get('max') ? Number(searchParams.get('max')) : undefined,
      availability: searchParams.get('stock') || undefined,
      sort: searchParams.get('sort') || 'popularity',
      page: Number(searchParams.get('page') || 1),
      query: searchParams.get('q') || undefined,
    }
  }, [searchParams, meta.filters])

  const apiParams = useMemo(
    () => ({
      gender: filters.gender,
      category: filters.category,
      collection: filters.collection || meta.filters.collection,
      fragranceFamily: filters.fragranceFamily?.join(','),
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      availability: filters.availability,
      sort: filters.sort,
      q: filters.query,
      page: filters.page,
      limit: 9,
    }),
    [filters, meta.filters.collection],
  )

  const { products, meta: apiMeta, loading } = useProducts(apiParams)

  const bottleSizes = useMemo(() => {
    const sizes = new Set()
    products.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.size) sizes.add(variant.size)
      })
    })
    return [...sizes]
  }, [products])

  // Client-side size filter (API may not filter sizes yet)
  const filtered = useMemo(() => {
    if (!filters.sizes?.length) return products
    return filterProducts(products, { sizes: filters.sizes })
  }, [products, filters.sizes])

  const pageData = apiMeta && !filters.sizes?.length
    ? {
        items: filtered,
        total: apiMeta.total,
        page: apiMeta.page,
        totalPages: apiMeta.totalPages,
      }
    : paginate(filtered, filters.page, 9)

  const syncFilters = (next) => {
    const params = new URLSearchParams()
    if (next.gender && !meta.filters.gender) params.set('gender', next.gender)
    if (next.fragranceFamily?.length) params.set('family', next.fragranceFamily.join(','))
    if (next.sizes?.length) params.set('sizes', next.sizes.join(','))
    if (next.minPrice != null) params.set('min', String(next.minPrice))
    if (next.maxPrice != null) params.set('max', String(next.maxPrice))
    if (next.availability) params.set('stock', next.availability)
    if (next.sort && next.sort !== 'popularity') params.set('sort', next.sort)
    if (next.page && next.page > 1) params.set('page', String(next.page))
    if (next.query) params.set('q', next.query)
    setSearchParams(params)
  }

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={collection === 'all' ? '/shop' : `/shop/${collection}`}
      />
      <PageHero
        eyebrow="Shop"
        title={meta.title}
        description={meta.description}
        crumbs={
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Shop', to: '/shop' },
              { label: meta.title },
            ]}
          />
        }
      />

      <div className="container-site section-pad py-8 sm:py-10 md:py-14">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-muted">
            Showing <span className="text-ivory">{pageData.total}</span> fragrance
            {pageData.total === 1 ? '' : 's'}
          </p>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              className="touch-target inline-flex flex-1 items-center justify-center gap-2 border border-border px-3 py-2.5 text-sm text-muted hover:border-gold hover:text-gold sm:flex-none lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <Select
              id="sort"
              value={filters.sort}
              onChange={(e) => syncFilters({ ...filters, sort: e.target.value, page: 1 })}
              className="min-w-0 flex-1 sm:min-w-44"
            >
              <option value="popularity">Sort: Popularity</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Sort: Price low to high</option>
              <option value="price-desc">Sort: Price high to low</option>
              <option value="discount">Sort: Discount</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onChange={syncFilters}
              onClear={() => setSearchParams({})}
              bottleSizes={bottleSizes}
            />
          </div>
          <div>
            <ProductGrid products={pageData.items} loading={loading} onQuickView={setQuickView} />
            <Pagination
              page={pageData.page}
              totalPages={pageData.totalPages}
              onChange={(page) => syncFilters({ ...filters, page })}
            />
          </div>
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <FilterSidebar
          filters={filters}
          mobile
          bottleSizes={bottleSizes}
          onChange={syncFilters}
          onClear={() => {
            setSearchParams({})
            setFiltersOpen(false)
          }}
        />
      </Modal>

      <QuickViewModal
        product={quickView}
        open={Boolean(quickView)}
        onClose={() => setQuickView(null)}
      />
    </>
  )
}
