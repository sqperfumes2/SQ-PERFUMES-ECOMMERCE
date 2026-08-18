import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHero from '../components/ui/PageHero'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Seo from '../components/seo/Seo'
import OrderStatusTracker from '../components/order/OrderStatusTracker'
import { formatPrice } from '../lib/format'
import { storeApi, getErrorMessage } from '../lib/services'

export default function TrackOrderPage() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    orderNumber: params.get('order') || '',
    phone: params.get('phone') || '',
  })
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(
    () => form.orderNumber.trim().length >= 3 && form.phone.replace(/\s/g, '').length >= 10,
    [form],
  )

  const lookup = async (e) => {
    e?.preventDefault()
    if (!canSubmit) {
      toast.error('Enter your order number and the phone used at checkout')
      return
    }
    setLoading(true)
    try {
      const { data } = await storeApi.trackOrder({
        orderNumber: form.orderNumber.trim(),
        phone: form.phone.trim(),
      })
      setOrder(data.data)
    } catch (error) {
      setOrder(null)
      toast.error(getErrorMessage(error, 'Order not found'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Seo
        title="Track your SQ Perfumes order"
        description="Check whether your SQ Perfumes order is confirmed, shipped, or delivered."
        path="/track-order"
        noindex
      />
      <PageHero
        eyebrow="Orders"
        title="Track order"
        description="Enter the order number from your confirmation page and the mobile number used at checkout."
        crumbs={
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Track order' }]} />
        }
      />
      <div className="container-site section-pad grid gap-8 py-10 md:grid-cols-2 md:py-14">
        <form onSubmit={lookup} className="space-y-4 border border-border bg-charcoal p-5">
          <Input
            id="orderNumber"
            label="Order number"
            placeholder="SQ-001"
            value={form.orderNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, orderNumber: e.target.value }))}
          />
          <Input
            id="trackPhone"
            label="Phone number"
            placeholder="03xxxxxxxxx"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <Button type="submit" disabled={loading || !canSubmit}>
            {loading ? 'Checking…' : 'Check status'}
          </Button>
        </form>

        <div className="border border-border p-5">
          {order ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gold">{order.orderNumber}</p>
                <h2 className="mt-2 font-display text-2xl text-ivory">{order.status}</h2>
                <p className="mt-1 text-sm text-muted">
                  {order.paymentMethod} · {formatPrice(order.total)}
                  {order.shippingAddress?.city
                    ? ` · ${order.shippingAddress.area}, ${order.shippingAddress.city}`
                    : ''}
                </p>
              </div>
              <OrderStatusTracker status={order.status} history={order.statusHistory} />
            </div>
          ) : (
            <p className="text-sm text-muted">
              When admin confirms, ships, or delivers your order, the latest status appears here.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
