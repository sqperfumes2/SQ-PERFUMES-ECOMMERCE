import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'
import PageHero from '../components/ui/PageHero'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Seo from '../components/seo/Seo'
import { formatPrice } from '../lib/format'
import { useCartStore } from '../store'
import { storeApi, getErrorMessage } from '../lib/services'
import { useStoreSettings } from '../hooks/useStoreSettings'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const setPromo = useCartStore((s) => s.setPromo)
  const clearPromo = useCartStore((s) => s.clearPromo)
  const promoCode = useCartStore((s) => s.promoCode)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getDiscount = useCartStore((s) => s.getDiscount)
  const getShipping = useCartStore((s) => s.getShipping)
  const getTotal = useCartStore((s) => s.getTotal)
  const { settings } = useStoreSettings()

  const [code, setCode] = useState('')
  const [applying, setApplying] = useState(false)

  const threshold = settings?.freeShippingThreshold ?? 8000
  const defaultFee = settings?.shippingCities?.[0]?.fee ?? 250
  const subtotal = getSubtotal()
  const discount = getDiscount()
  const shipping = getShipping(defaultFee, threshold)
  const total = getTotal(defaultFee, threshold)

  const handleApplyPromo = async () => {
    if (!code.trim()) {
      toast.error('Enter a coupon code')
      return
    }
    setApplying(true)
    try {
      const { data } = await storeApi.validateCoupon({ code, subtotal })
      const promo = data.data
      setPromo({
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discount: promo.discount,
        freeShipping: promo.freeShipping,
        label: promo.freeShipping
          ? 'Free shipping'
          : promo.type === 'percent'
            ? `${promo.value}% off`
            : `Rs. ${promo.value} off`,
      })
      toast.success('Coupon applied')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid coupon code'))
    } finally {
      setApplying(false)
    }
  }

  if (!items.length) {
    return (
      <div className="container-site section-pad py-16">
        <Seo title="Cart" path="/cart" noindex />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Discover a signature scent and add a bottle size to begin."
          actionLabel="Continue shopping"
          actionTo="/shop"
        />
      </div>
    )
  }

  return (
    <>
      <Seo title="Cart" path="/cart" noindex />
      <PageHero
        eyebrow="Bag"
        title="Your cart"
        description="Review bottle sizes and quantities before checkout."
        crumbs={<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />}
      />

      <div className="container-site section-pad pb-sticky-cta grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[1.4fr_0.8fr] md:py-14">
        <div className="space-y-3 sm:space-y-4">
          {items.map((item) => (
            <article
              key={item.key}
              className="grid grid-cols-[72px_1fr] gap-3 border border-border p-3 sm:grid-cols-[96px_1fr_auto] sm:gap-4 sm:p-4"
            >
              <Link to={`/product/${item.slug}`} className="aspect-square overflow-hidden bg-elevated">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0">
                <Link
                  to={`/product/${item.slug}`}
                  className="font-display text-lg leading-snug text-ivory hover:text-gold-bright sm:text-xl"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-muted">Size: {item.size}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-gold-bright">{formatPrice(item.price)}</span>
                  {item.compareAtPrice ? (
                    <span className="text-xs text-muted line-through">
                      {formatPrice(item.compareAtPrice)}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:mt-4">
                  <div className="inline-flex items-center border border-border">
                    <button
                      type="button"
                      className="touch-target inline-flex items-center justify-center text-muted hover:text-gold"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="touch-target inline-flex items-center justify-center text-muted hover:text-gold"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 sm:hidden">
                    <p className="text-sm text-ivory">{formatPrice(item.price * item.quantity)}</p>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.key)
                        toast.success('Removed from cart')
                      }}
                      className="touch-target inline-flex items-center justify-center text-muted hover:text-danger"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="hidden flex-col items-end justify-between sm:flex">
                <p className="text-ivory">{formatPrice(item.price * item.quantity)}</p>
                <button
                  type="button"
                  onClick={() => {
                    removeItem(item.key)
                    toast.success('Removed from cart')
                  }}
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-danger"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </article>
          ))}
          <Button to="/shop" variant="secondary" className="w-full sm:w-auto">
            Continue shopping
          </Button>
        </div>

        <aside className="h-fit border border-border bg-charcoal p-4 sm:p-5">
          <h2 className="font-display text-xl text-ivory sm:text-2xl">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="text-ivory">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Discount</dt>
              <dd className="text-ivory">-{formatPrice(discount)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Estimated shipping</dt>
              <dd className="text-ivory">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt className="text-ivory">Total</dt>
              <dd className="text-gold-bright">{formatPrice(total)}</dd>
            </div>
          </dl>

          <div className="mt-5 space-y-2">
            <Input
              id="promo"
              label="Promo code"
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                disabled={applying}
                onClick={handleApplyPromo}
              >
                {applying ? 'Checking…' : 'Apply'}
              </Button>
              {promoCode ? (
                <Button variant="ghost" onClick={clearPromo}>
                  Clear
                </Button>
              ) : null}
            </div>
            {promoCode ? (
              <p className="text-xs text-gold">Applied: {promoCode.code} — {promoCode.label}</p>
            ) : null}
          </div>

          <Button to="/checkout" className="mt-6 hidden w-full lg:inline-flex">
            Proceed to checkout
          </Button>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-ink/95 px-3 pt-3 pb-safe backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Total</p>
            <p className="truncate text-gold-bright">{formatPrice(total)}</p>
          </div>
          <Button to="/checkout" className="shrink-0">
            Checkout
          </Button>
        </div>
      </div>
    </>
  )
}
