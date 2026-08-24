import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'
import OrderStatusTracker from '../components/order/OrderStatusTracker'
import { formatPrice } from '../lib/format'
import { storeApi } from '../lib/services'
import JazzCashDetails from '../components/checkout/JazzCashDetails'

export default function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const stored = sessionStorage.getItem('sq-last-order')
  const snapshot = stored ? JSON.parse(stored) : null
  const [live, setLive] = useState(null)

  useEffect(() => {
    const orderNumber = snapshot?.id || orderId
    const phone = snapshot?.phone
    if (!orderNumber || !phone) return undefined
    let alive = true
    storeApi
      .trackOrder({ orderNumber, phone })
      .then(({ data }) => {
        if (alive) setLive(data.data)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [orderId, snapshot?.id, snapshot?.phone])

  const status = live?.status || snapshot?.status || 'Pending'
  const history = live?.statusHistory || [{ status: 'Pending', note: 'Order placed' }]

  return (
    <div className="container-site section-pad py-16 md:py-24">
      <div className="mx-auto max-w-xl border border-border bg-charcoal p-8 text-center">
        <CheckCircle2 className="mx-auto text-gold" size={42} strokeWidth={1.4} />
        <h1 className="mt-4 font-display text-3xl text-ivory">Order placed</h1>
        <p className="mt-3 text-sm text-muted">
          Thank you for shopping with SQ Perfumes. Save your order number. When we confirm,
          ship, or deliver it, the status below updates — you can also check it anytime on Track
          order.
        </p>
        <p className="mt-5 text-xs uppercase tracking-[0.22em] text-gold">
          Order {snapshot?.id || orderId || 'SQ-XXXXX'}
        </p>
        <div className="mt-6 text-left">
          <OrderStatusTracker status={status} history={history} />
        </div>
        {snapshot ? (
          <div className="mt-6 space-y-2 border-t border-border pt-5 text-left text-sm text-muted">
            <p>
              <span className="text-ivory">Total:</span> {formatPrice(snapshot.total)}
            </p>
            <p>
              <span className="text-ivory">Payment:</span> {snapshot.paymentMethod}
            </p>
            {snapshot.paymentMethod === 'Online' ? (
              <JazzCashDetails
                total={snapshot.total}
                orderNumber={snapshot.id}
                className="mt-4"
              />
            ) : null}
            <p>
              <span className="text-ivory">Ship to:</span> {snapshot.shippingAddress.area},{' '}
              {snapshot.shippingAddress.city}
            </p>
          </div>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            to={`/track-order?order=${encodeURIComponent(snapshot?.id || orderId || '')}`}
          >
            Track this order
          </Button>
          <Button to="/shop" variant="secondary">
            Continue shopping
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted">
          Need help?{' '}
          <Link to="/contact" className="text-gold hover:text-gold-bright">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}
