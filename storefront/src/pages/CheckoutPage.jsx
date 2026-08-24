import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHero from '../components/ui/PageHero'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Input, { Select, TextArea } from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import Seo from '../components/seo/Seo'
import { formatPrice } from '../lib/format'
import { useAuthStore, useCartStore } from '../store'
import { storeApi, getErrorMessage } from '../lib/services'
import { useStoreSettings } from '../hooks/useStoreSettings'
import JazzCashDetails from '../components/checkout/JazzCashDetails'

const initialForm = {
  guest: true,
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: 'Lahore',
  area: '',
  notes: '',
  deliveryMethod: 'standard',
  paymentMethod: 'cod',
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getDiscount = useCartStore((s) => s.getDiscount)
  const getShipping = useCartStore((s) => s.getShipping)
  const getTotal = useCartStore((s) => s.getTotal)
  const promoCode = useCartStore((s) => s.promoCode)
  const user = useAuthStore((s) => s.user)

  const [form, setForm] = useState({
    ...initialForm,
    fullName: user?.name || '',
    email: user?.email || '',
    guest: !user,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { settings } = useStoreSettings()
  const cities = settings?.shippingCities || []
  const threshold = settings?.freeShippingThreshold ?? 8000
  const methods = settings?.paymentMethods || { cod: true, online: true }
  const canPay = true

  useEffect(() => {
    if (!cities.length) return
    if (!cities.some((city) => city.city === form.city)) {
      setForm((prev) => ({ ...prev, city: cities[0].city }))
    }
  }, [cities, form.city])

  useEffect(() => {
    if (methods.cod === false && form.paymentMethod === 'cod') {
      setForm((prev) => ({ ...prev, paymentMethod: 'online' }))
    }
  }, [methods.cod, form.paymentMethod])

  const cityFee = useMemo(
    () => cities.find((zone) => zone.city === form.city)?.fee ?? 350,
    [cities, form.city],
  )
  const selectedCity = cities.find((zone) => zone.city === form.city)

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const shipping = getShipping(cityFee, threshold)
  const total = getTotal(cityFee, threshold)

  if (!items.length) {
    return (
      <div className="container-site section-pad py-16">
        <Seo title="Checkout" path="/checkout" noindex />
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to checkout"
          description="Add a fragrance to your cart before placing an order."
          actionLabel="Browse shop"
          actionTo="/shop"
        />
      </div>
    )
  }

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required'
    if (!form.email.includes('@')) next.email = 'Valid email is required'
    if (!/^(\+92|0)?3\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
      next.phone = 'Enter a valid Pakistani mobile number'
    }
    if (!form.address.trim()) next.address = 'Shipping address is required'
    if (!form.city) next.city = 'City is required'
    if (!form.area.trim()) next.area = 'Area is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        guest: !user,
        customer: {
          name: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          qty: item.quantity,
        })),
        shippingAddress: {
          address: form.address,
          city: form.city,
          area: form.area,
          notes: form.notes,
        },
        paymentMethod: form.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online',
        couponCode: promoCode?.code || null,
      }

      const { data } = await storeApi.placeOrder(payload)
      const order = data.data
      sessionStorage.setItem(
        'sq-last-order',
        JSON.stringify({
          id: order.orderNumber,
          date: order.createdAt,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          total: order.total,
          phone: form.phone,
          shippingAddress: {
            area: order.shippingAddress.area,
            city: order.shippingAddress.city,
          },
        }),
      )
      clearCart()
      toast.success('Order placed successfully')
      navigate(`/order-success?order=${order.orderNumber}`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not place order'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Seo title="Checkout" path="/checkout" noindex />
      <PageHero
        eyebrow="Checkout"
        title="Checkout"
        description="Guest checkout is available. Signed-in orders appear in your account."
        crumbs={
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Cart', to: '/cart' },
              { label: 'Checkout' },
            ]}
          />
        }
      />

      <form
        id="checkout-form"
        onSubmit={handleSubmit}
        className="container-site section-pad pb-sticky-cta grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[1.3fr_0.7fr] md:py-14"
      >
        <div className="space-y-5 sm:space-y-6">
          <section className="border border-border p-4 sm:p-5">
            <h2 className="font-display text-lg text-ivory sm:text-xl">Customer information</h2>
            <label className="mt-4 flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.guest}
                onChange={(e) => update('guest', e.target.checked)}
                className="accent-gold"
              />
              Continue as guest
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                id="fullName"
                label="Full name"
                value={form.fullName}
                error={errors.fullName}
                onChange={(e) => update('fullName', e.target.value)}
              />
              <Input
                id="phone"
                label="Phone number"
                placeholder="03XXXXXXXXX"
                value={form.phone}
                error={errors.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
              <Input
                id="email"
                label="Email"
                type="email"
                containerClassName="sm:col-span-2"
                value={form.email}
                error={errors.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
          </section>

          <section className="border border-border p-4 sm:p-5">
            <h2 className="font-display text-lg text-ivory sm:text-xl">Shipping address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                id="address"
                label="Full address"
                containerClassName="sm:col-span-2"
                value={form.address}
                error={errors.address}
                onChange={(e) => update('address', e.target.value)}
              />
              <Select
                id="city"
                label="City"
                value={form.city}
                error={errors.city}
                onChange={(e) => update('city', e.target.value)}
              >
                {cities.length ? (
                  cities.map((zone) => (
                    <option key={zone._id || zone.city} value={zone.city}>
                      {zone.city}
                    </option>
                  ))
                ) : (
                  <option value={form.city}>{form.city}</option>
                )}
              </Select>
              <Input
                id="area"
                label="Area"
                value={form.area}
                error={errors.area}
                onChange={(e) => update('area', e.target.value)}
              />
              <TextArea
                id="notes"
                label="Order notes (optional)"
                rows={3}
                className="sm:col-span-2"
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
              />
            </div>
          </section>

          <section className="border border-border p-4 sm:p-5">
            <h2 className="font-display text-lg text-ivory sm:text-xl">Delivery & payment</h2>
            <div className="mt-4 space-y-3">
              <label className="flex min-h-11 items-start gap-3 border border-border p-3">
                <input
                  type="radio"
                  name="delivery"
                  checked={form.deliveryMethod === 'standard'}
                  onChange={() => update('deliveryMethod', 'standard')}
                  className="mt-1 accent-gold"
                />
                <span>
                  <span className="block text-ivory">Standard delivery</span>
                  <span className="text-sm text-muted">
                    {selectedCity?.eta || '2–4 business days in major cities'}
                  </span>
                </span>
              </label>
              {methods.cod !== false ? (
                <label className="flex min-h-11 items-start gap-3 border border-border p-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMethod === 'cod'}
                    onChange={() => update('paymentMethod', 'cod')}
                    className="mt-1 accent-gold"
                  />
                  <span>
                    <span className="block text-ivory">Cash on Delivery</span>
                    <span className="text-sm text-muted">Pay when your order arrives</span>
                  </span>
                </label>
              ) : null}
              <div
                className={`border p-3 ${
                  form.paymentMethod === 'online' ? 'border-gold/40 bg-gold/5' : 'border-border'
                }`}
              >
                <label className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMethod === 'online'}
                    onChange={() => update('paymentMethod', 'online')}
                    className="mt-1 accent-gold"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-ivory">Online payment — JazzCash</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 180 40"
                        className="h-6 w-[6.75rem]"
                        aria-hidden="true"
                      >
                        <rect width="180" height="40" rx="8" fill="#E2136E" />
                        <text
                          x="90"
                          y="26.5"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontFamily="Arial Black, Arial, Helvetica, sans-serif"
                          fontSize="16"
                          fontWeight="800"
                        >
                          JazzCash
                        </text>
                      </svg>
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      Send payment to MUHAMMAD ARSHAD, then WhatsApp the screenshot to 0303 2070201.
                    </span>
                  </span>
                </label>
                {form.paymentMethod === 'online' ? (
                  <JazzCashDetails total={total} className="mt-3" />
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit border border-border bg-charcoal p-4 sm:p-5">
          <h2 className="font-display text-xl text-ivory sm:text-2xl">Order summary</h2>
          <ul className="mt-4 space-y-3 border-b border-border pb-4">
            {items.map((item) => (
              <li key={item.key} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 text-muted">
                  <span className="line-clamp-2">
                    {item.name} · {item.size} × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 text-ivory">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="text-ivory">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Discount</dt>
              <dd className="text-ivory">-{formatPrice(discount)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Shipping ({form.city})</dt>
              <dd className="text-ivory">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt className="text-ivory">Total</dt>
              <dd className="text-gold-bright">{formatPrice(total)}</dd>
            </div>
          </dl>
          <Button type="submit" className="mt-6 hidden w-full lg:inline-flex" disabled={submitting || !canPay}>
            {submitting ? 'Placing order...' : 'Place order'}
          </Button>
          <p className="mt-3 hidden text-xs text-muted lg:block">
            {form.paymentMethod === 'online'
              ? 'After placing the order, send the JazzCash screenshot on WhatsApp to 0303 2070201.'
              : 'Cash on Delivery orders are paid when the courier arrives.'}
          </p>
        </aside>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-ink/95 px-3 pt-3 pb-safe backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Total</p>
            <p className="truncate text-gold-bright">{formatPrice(total)}</p>
          </div>
          <Button type="submit" form="checkout-form" className="shrink-0" disabled={submitting || !canPay}>
            {submitting ? 'Placing…' : 'Place order'}
          </Button>
        </div>
      </div>
    </>
  )
}
