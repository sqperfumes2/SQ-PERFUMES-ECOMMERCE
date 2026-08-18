import ProductCard from './ProductCard'
import { ProductCardSkeleton } from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import { PackageOpen } from 'lucide-react'

export default function ProductGrid({ products, loading, onQuickView }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No fragrances found"
        description="Try adjusting filters or clearing your search to explore the full collection."
        actionLabel="Clear filters"
        actionTo="/shop"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  )
}
