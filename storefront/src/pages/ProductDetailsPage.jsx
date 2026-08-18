import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart, Minus, Plus, Share2, PackageOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import ProductGallery from '../components/product/ProductGallery'
import ProductCard from '../components/product/ProductCard'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import StarRating from '../components/ui/StarRating'
import EmptyState from '../components/ui/EmptyState'
import Seo, { buildProductJsonLd } from '../components/seo/Seo'
import { formatPrice, getVariantPrice, discountPercent } from '../lib/format'
import { useCartStore, useRecentlyViewedStore, useWishlistStore } from '../store'
import { useProductBySlug, useProducts } from '../hooks/useCatalog'
import { storeApi } from '../lib/services'

const DEFAULT_DELIVERY = '2–4 business days in major cities. COD available.'
const DEFAULT_RETURNS = 'Unopened bottles eligible within 7 days.'

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { product, loading } = useProductBySlug(slug)
  const { products: relatedPool } = useProducts({ limit: 24 })

  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const inWishlist = useWishlistStore((s) => (product ? s.ids.includes(product.id) : false))
  const addRecent = useRecentlyViewedStore((s) => s.add)
  const recentIds = useRecentlyViewedStore((s) => s.ids)

  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('details')
  const [deliveryText, setDeliveryText] = useState(DEFAULT_DELIVERY)
  const [returnsText, setReturnsText] = useState(DEFAULT_RETURNS)
  const [productReviews, setProductReviews] = useState([])

  useEffect(() => {
    if (product) {
      addRecent(product.id)
      setSize(product.variants[0]?.size)
      setQty(1)
    }
  }, [product, addRecent])

  useEffect(() => {
    let active = true
    storeApi
      .settings()
      .then(({ data }) => {
        if (!active) return
        const s = data.data || {}
        if (s.productDeliveryText) setDeliveryText(s.productDeliveryText)
        if (s.productReturnsText) setReturnsText(s.productReturnsText)
      })
      .catch(() => {
        /* keep defaults */
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!product?.id) {
      setProductReviews([])
      return undefined
    }
    let active = true
    storeApi
      .reviews({ productId: product.id })
      .then(({ data }) => {
        if (active) setProductReviews(data.data || [])
      })
      .catch(() => {
        if (active) setProductReviews([])
      })
    return () => {
      active = false
    }
  }, [product?.id])

  const variant = useMemo(
    () => product?.variants.find((v) => v.size === (size || product.variants[0]?.size)),
    [product, size],
  )

  if (loading) {
    return <div className="container-site section-pad py-16 text-muted">Loading product…</div>
  }

  if (!product) {
    return (
      <div className="container-site section-pad py-16">
        <EmptyState
          icon={PackageOpen}
          title="Product not found"
          description="This fragrance may have been moved or is no longer available."
          actionLabel="Back to shop"
          actionTo="/shop"
        />
      </div>
    )
  }

  const price = getVariantPrice(variant)
  const discount = discountPercent(price, variant?.compareAtPrice)
  const soldOut = !variant?.stock
  const related = relatedPool
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.gender === product.gender || p.fragranceFamily === product.fragranceFamily),
    )
    .slice(0, 4)
  const recentlyViewed = recentIds
    .filter((id) => id !== product.id)
    .map((id) => relatedPool.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4)

  const handleAdd = () => {
    if (!variant?.stock) {
      toast.error('Selected size is sold out')
      return
    }
    addItem({ product, variant, quantity: qty })
    toast.success(`${product.name} added to cart`)
  }

  const handleBuyNow = () => {
    handleAdd()
    if (variant?.stock) navigate('/checkout')
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.shortDescription, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard')
      }
    } catch {
      toast.error('Unable to share right now')
    }
  }

  return (
    <div className="container-site section-pad pb-sticky-cta py-8 sm:py-10 md:py-14">
      <Seo
        title={`${product.name} Perfume by SQ Perfumes`}
        description={
          product.shortDescription ||
          product.description ||
          `Buy ${product.name} by SQ Perfumes — official perfume store in Pakistan.`
        }
        path={`/product/${product.slug}`}
        image={product.images?.[0]}
        type="product"
        jsonLd={buildProductJsonLd(product, price)}
        jsonLdId="product-jsonld"
      />
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: product.name },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />
        <div className="min-w-0 lg:max-w-xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {product.newArrival ? <Badge>New</Badge> : null}
            {product.bestSeller ? <Badge tone="ivory">Most popular</Badge> : null}
            {discount > 0 ? <Badge tone="danger">-{discount}%</Badge> : null}
            {soldOut ? <Badge tone="danger">Sold out</Badge> : null}
          </div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {product.brand} · {product.fragranceFamily}
          </p>
          <h1 className="mt-2 font-display text-2xl leading-tight text-ivory sm:text-3xl md:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StarRating rating={product.rating} showValue />
            <span className="text-xs text-muted">({product.reviewCount} reviews)</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:mt-5">
            {product.shortDescription}
          </p>
          <div className="mt-5 flex items-baseline gap-3 sm:mt-6">
            <span className="text-xl text-gold-bright sm:text-2xl">{formatPrice(price)}</span>
            {variant?.compareAtPrice ? (
              <span className="text-sm text-muted line-through">
                {formatPrice(variant.compareAtPrice)}
              </span>
            ) : null}
          </div>
          <p className="mt-6 mb-2 text-xs uppercase tracking-[0.2em] text-muted">Bottle size</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.size}
                type="button"
                onClick={() => {
                  setSize(v.size)
                  setQty(1)
                }}
                className={`min-h-11 border px-4 py-2.5 text-sm ${
                  variant?.size === v.size
                    ? 'border-gold bg-gold/15 text-gold-bright'
                    : 'border-border text-muted hover:border-gold'
                }`}
              >
                {v.size}
                {v.stock <= 0 ? ' · Sold out' : ''}
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center border border-border">
              <button
                type="button"
                className="touch-target inline-flex items-center justify-center text-muted hover:text-gold"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-10 text-center">{qty}</span>
              <button
                type="button"
                className="touch-target inline-flex items-center justify-center text-muted hover:text-gold"
                onClick={() => setQty((q) => Math.min(variant?.stock || 1, q + 1))}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className={`text-sm ${variant?.stock ? 'text-muted' : 'text-danger'}`}>
              {variant?.stock ? `${variant.stock} in stock` : 'Sold out'}
            </p>
          </div>
          <div className="mt-6 hidden flex-wrap gap-3 lg:flex">
            <Button onClick={handleAdd} disabled={soldOut}>
              Add to cart
            </Button>
            <Button variant="secondary" onClick={handleBuyNow} disabled={soldOut}>
              Buy now
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const added = toggleWishlist(product.id)
                toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
              }}
            >
              <Heart size={16} className={inWishlist ? 'fill-gold text-gold' : ''} />
              Wishlist
            </Button>
            <Button variant="ghost" onClick={handleShare}>
              <Share2 size={16} />
              Share
            </Button>
          </div>
          <div className="mt-6 flex gap-2 lg:hidden">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                const added = toggleWishlist(product.id)
                toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
              }}
            >
              <Heart size={16} className={inWishlist ? 'fill-gold text-gold' : ''} />
              Wishlist
            </Button>
            <Button variant="ghost" className="flex-1" onClick={handleShare}>
              <Share2 size={16} />
              Share
            </Button>
          </div>
          <div className="mt-8 grid gap-3 border border-border p-4 text-sm text-muted">
            <p>
              <span className="text-ivory">Delivery:</span> {deliveryText}
            </p>
            <p>
              <span className="text-ivory">Returns:</span> {returnsText} See our{' '}
              <Link to="/returns" className="text-gold hover:text-gold-bright">
                return policy
              </Link>
              .
            </p>
            <p>
              <span className="text-ivory">SKU:</span> {variant?.sku}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-14">
        <div className="flex gap-1 overflow-x-auto border-b border-border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'details', label: 'Details' },
            { id: 'notes', label: 'Fragrance notes' },
            { id: 'reviews', label: 'Reviews' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 border-b-2 px-3 py-3 text-sm sm:px-4 ${
                tab === item.id
                  ? 'border-gold text-gold-bright'
                  : 'border-transparent text-muted hover:text-ivory'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="py-6 text-sm text-muted">
          {tab === 'details' ? (
            <div className="max-w-3xl space-y-3">
              <p>{product.description}</p>
            </div>
          ) : null}
          {tab === 'notes' ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'Top notes', notes: product.topNotes },
                { label: 'Heart notes', notes: product.middleNotes },
                { label: 'Base notes', notes: product.baseNotes },
              ].map((group) => (
                <div key={group.label} className="border border-border p-4">
                  <h3 className="font-display text-lg text-ivory">{group.label}</h3>
                  <p className="mt-2">{group.notes?.length ? group.notes.join(', ') : '—'}</p>
                </div>
              ))}
            </div>
          ) : null}
          {tab === 'reviews' ? (
            <div className="max-w-3xl space-y-4">
              {productReviews.length ? (
                productReviews.map((review) => (
                  <article key={review._id || review.id} className="border border-border p-4">
                    <StarRating rating={review.rating} />
                    <h3 className="mt-2 text-ivory">{review.title}</h3>
                    <p className="mt-2">{review.body}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gold">
                      {review.customerName}
                    </p>
                  </article>
                ))
              ) : (
                <p>No reviews for this fragrance yet.</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="mt-10">
          <h2 className="mb-5 font-display text-xl text-ivory sm:mb-6 sm:text-2xl md:text-3xl">
            Related fragrances
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {recentlyViewed.length ? (
        <section className="mt-10 sm:mt-14">
          <h2 className="mb-5 font-display text-xl text-ivory sm:mb-6 sm:text-2xl md:text-3xl">
            Recently viewed
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {recentlyViewed.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-ink/95 px-3 pt-3 pb-safe backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <Button className="flex-1" onClick={handleAdd} disabled={soldOut}>
            Add to cart
          </Button>
          <Button className="flex-1" variant="secondary" onClick={handleBuyNow} disabled={soldOut}>
            Buy now
          </Button>
        </div>
      </div>
    </div>
  )
}
