import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import StarRating from '../ui/StarRating'
import { formatPrice, getVariantPrice, discountPercent } from '../../lib/format'
import { cloudinaryUrl } from '../../lib/cloudinary'
import { useCartStore, useWishlistStore } from '../../store'

export default function QuickViewModal({ product, open, onClose }) {
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const inWishlist = useWishlistStore((s) => (product ? s.ids.includes(product.id) : false))

  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)

  const activeSize = size || product?.variants?.[0]?.size
  const variant = useMemo(
    () => product?.variants?.find((v) => v.size === activeSize) || product?.variants?.[0],
    [product, activeSize],
  )

  if (!product) return null

  const price = getVariantPrice(variant)
  const discount = discountPercent(price, variant?.compareAtPrice)

  const handleAdd = () => {
    if (!variant || variant.stock <= 0) {
      toast.error('This size is currently out of stock')
      return
    }
    addItem({ product, variant, quantity: qty })
    toast.success(`${product.name} (${variant.size}) added to cart`)
    onClose?.()
  }

  return (
    <Modal open={open} onClose={onClose} title={product.name} wide>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden border border-border bg-elevated">
          <img
            src={cloudinaryUrl(product.images[0], { width: 720 })}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {product.newArrival ? <Badge>New</Badge> : null}
            {product.bestSeller ? <Badge tone="ivory">Best seller</Badge> : null}
            {discount > 0 ? <Badge tone="danger">-{discount}%</Badge> : null}
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted">{product.reviewCount} reviews</span>
          </div>
          <p className="mt-4 text-sm text-muted">{product.shortDescription}</p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl text-gold-bright">{formatPrice(price)}</span>
            {variant?.compareAtPrice ? (
              <span className="text-muted line-through">{formatPrice(variant.compareAtPrice)}</span>
            ) : null}
          </div>

          <p className="mt-5 mb-2 text-xs uppercase tracking-[0.2em] text-muted">Bottle size</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.size}
                type="button"
                onClick={() => {
                  setSize(v.size)
                  setQty(1)
                }}
                className={`border px-3 py-2 text-sm ${
                  activeSize === v.size
                    ? 'border-gold bg-gold/15 text-gold-bright'
                    : 'border-border text-muted hover:border-gold'
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="inline-flex items-center border border-border">
              <button
                type="button"
                className="p-2 text-muted hover:text-gold"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-10 text-center text-sm">{qty}</span>
              <button
                type="button"
                className="p-2 text-muted hover:text-gold"
                onClick={() => setQty((q) => Math.min(variant?.stock || 1, q + 1))}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="text-xs text-muted">
              {variant?.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleAdd} disabled={!variant?.stock}>
              Add to cart
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const added = toggleWishlist(product.id)
                toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
              }}
            >
              {inWishlist ? 'Wishlisted' : 'Wishlist'}
            </Button>
            <Button variant="ghost" to={`/product/${product.slug}`} onClick={onClose}>
              View details
            </Button>
          </div>
          <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            className="mt-4 inline-block text-sm text-gold hover:text-gold-bright"
          >
            See full notes and reviews →
          </Link>
        </div>
      </div>
    </Modal>
  )
}
