import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import ProductGrid from '../components/product/ProductGrid'
import QuickViewModal from '../components/product/QuickViewModal'
import Pagination from '../components/ui/Pagination'
import Seo from '../components/seo/Seo'
import { useProducts } from '../hooks/useCatalog'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [quickView, setQuickView] = useState(null)
  const [page, setPage] = useState(1)
  const { products, meta, loading } = useProducts({ q, page, limit: 9, sort: 'popularity' })

  const total = meta?.total ?? products.length
  const totalPages = meta?.totalPages ?? 1
  const currentPage = meta?.page ?? page

  const description = useMemo(() => {
    if (!q) return 'Enter a fragrance name, note, or family in the header search.'
    if (loading) return 'Searching the collection…'
    return `We found ${total} fragrance${total === 1 ? '' : 's'} matching your search.`
  }, [q, loading, total])

  return (
    <>
      <Seo
        title={q ? `Search: ${q}` : 'Search'}
        description="Search SQ Perfumes perfumes by name, notes, or family."
        path={q ? `/search?q=${encodeURIComponent(q)}` : '/search'}
        noindex
      />
      <PageHero
        eyebrow="Search"
        title={q ? `Results for “${q}”` : 'Search'}
        description={description}
        crumbs={<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />}
      />
      <div className="container-site section-pad py-10 md:py-14">
        <ProductGrid products={products} onQuickView={setQuickView} />
        <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
      </div>
      <QuickViewModal
        product={quickView}
        open={Boolean(quickView)}
        onClose={() => setQuickView(null)}
      />
    </>
  )
}
