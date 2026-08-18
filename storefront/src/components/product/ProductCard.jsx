import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../ui/Badge'
import StarRating from '../ui/StarRating'
import { formatPrice, getLowestPrice, discountPercent, getVariantPrice } from '../../lib/format'
import { cloudinaryUrl } from '../../lib/cloudinary'
import { useWishlistStore } from '../../store'

export default function ProductCard({ product, onQuickView }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const inWishlist = useWishlistStore((s) => s.ids.includes(product.id))

  const price = getLowestPrice(product)
  const saleVariant = product.variants.find((v) => v.compareAtPrice)
  const compareAt = saleVariant?.compareAtPrice
  const discount = saleVariant
    ? discountPercent(getVariantPrice(saleVariant), saleVariant.compareAtPrice)
    : 0

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleWishlist(product.id)
    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
  }

  return (
    <article className="group relative flex flex-col overflow-hidden border border-border bg-charcoal transition-colors hover:border-gold/50">
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-elevated">
        {!imgLoaded ? <div className="absolute inset-0 animate-pulse bg-elevated" /> : null}
        <img
          src={cloudinaryUrl(product.images[0], { width: 600 })}
          alt={`${product.name} by SQ Perfumes`}
          loading="lazy"
          width={600}
          height={750}
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute left-2 top-2 flex max-w-[70%] flex-col gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
          {product.newArrival ? <Badge>New</Badge> : null}
          {product.bestSeller ? <Badge tone="ivory">Popular</Badge> : null}
          {discount > 0 ? <Badge tone="danger">-{discount}%</Badge> : null}
          {product.variants?.every((v) => v.stock <= 0) ? <Badge tone="danger">Sold out</Badge> : null}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-2 sm:right-3 sm:top-3">
          <button
            type="button"
            onClick={handleWishlist}
            className={`touch-target rounded-sm border border-border bg-ink/70 p-2 backdrop-blur ${inWishlist ? 'text-gold' : 'text-ivory hover:text-gold'}`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} className={inWishlist ? 'fill-gold' : ''} />
          </button>
          {onQuickView ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onQuickView(product)
              }}
              className="touch-target hidden rounded-sm border border-border bg-ink/70 p-2 text-ivory backdrop-blur hover:text-gold sm:inline-flex"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye size={16} />
            </button>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted sm:text-[11px] sm:tracking-[0.2em]">
          {product.fragranceFamily}
        </p>
        <Link
          to={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 font-display text-base leading-snug text-ivory hover:text-gold-bright sm:text-lg"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={product.rating} size={12} />
          <span className="text-xs text-muted">({product.reviewCount})</span>
        </div>
        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-3">
          <span className="text-sm text-gold-bright sm:text-base">{formatPrice(price)}</span>
          {compareAt ? (
            <span className="text-xs text-muted line-through sm:text-sm">{formatPrice(compareAt)}</span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
