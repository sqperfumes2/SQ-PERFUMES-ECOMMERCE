import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHero from '../components/ui/PageHero'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import ProductGrid from '../components/product/ProductGrid'
import EmptyState from '../components/ui/EmptyState'
import { useWishlistStore } from '../store'
import { useProducts } from '../hooks/useCatalog'

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids)
  const remove = useWishlistStore((s) => s.remove)
  const { products, loading } = useProducts({ limit: 48 })
  const list = products.filter((p) => ids.includes(p.id) || ids.includes(p._id))

  return (
    <>
      <PageHero
        eyebrow="Wishlist"
        title="Your wishlist"
        description="Save fragrances you love and return when ready."
        crumbs={<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />}
      />
      <div className="container-site section-pad py-10 md:py-14">
        {loading ? (
          <p className="text-sm text-muted">Loading wishlist…</p>
        ) : list.length ? (
          <>
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                className="text-sm text-muted hover:text-gold"
                onClick={() => {
                  ids.forEach((id) => remove(id))
                  toast.success('Wishlist cleared')
                }}
              >
                Clear wishlist
              </button>
            </div>
            <ProductGrid products={list} />
          </>
        ) : (
          <EmptyState
            icon={Heart}
            title="Wishlist is empty"
            description="Tap the heart on any fragrance to save it here."
            actionLabel="Explore shop"
            actionTo="/shop"
          />
        )}
      </div>
    </>
  )
}
