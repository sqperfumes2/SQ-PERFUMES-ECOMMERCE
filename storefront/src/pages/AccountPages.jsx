import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHero from '../components/ui/PageHero'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { formatPrice } from '../lib/format'
import { normalizeOrder } from '../lib/normalize'
import { customerAuthApi, getErrorMessage } from '../lib/services'
import { useAuthStore } from '../store'
import { Package } from 'lucide-react'
import OrderStatusTracker from '../components/order/OrderStatusTracker'
import JazzCashDetails from '../components/checkout/JazzCashDetails'

function useMyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    customerAuthApi
      .myOrders()
      .then(({ data }) => {
        const list = Array.isArray(data?.data) ? data.data : []
        if (alive) setOrders(list.map(normalizeOrder).filter(Boolean))
      })
      .catch((error) => {
        if (error?.response?.status !== 401) {
          toast.error(getErrorMessage(error, 'Could not load orders'))
        }
        if (alive) setOrders([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { orders, loading }
}

function AccountNav({ active }) {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await customerAuthApi.logout()
    } catch {
      /* still clear local session */
    }
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <aside className="border border-border bg-charcoal p-5">
      <h2 className="font-display text-xl text-ivory">Dashboard</h2>
      <nav className="mt-4 space-y-2 text-sm">
        <Link
          to="/account"
          className={active === 'overview' ? 'block text-gold-bright' : 'block text-muted hover:text-gold-bright'}
        >
          Overview
        </Link>
        <Link
          to="/account/orders"
          className={active === 'orders' ? 'block text-gold-bright' : 'block text-muted hover:text-gold-bright'}
        >
          Order history
        </Link>
        <Link to="/track-order" className="block text-muted hover:text-gold-bright">
          Track order
        </Link>
        <Link to="/wishlist" className="block text-muted hover:text-gold-bright">
          Wishlist
        </Link>
        <button type="button" className="block text-muted hover:text-gold-bright" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </aside>
  )
}

export function AccountPage() {
  const user = useAuthStore((s) => s.user)
  const { orders, loading } = useMyOrders()
  const recent = orders.slice(0, 2)

  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <PageHero
        eyebrow="Account"
        title={`Hello, ${user.name || 'there'}`}
        description="Manage your profile and review recent orders."
        crumbs={<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />}
      />
      <div className="container-site section-pad grid gap-6 py-10 md:grid-cols-3 md:py-14">
        <AccountNav active="overview" />
        <div className="space-y-5 md:col-span-2">
          <section className="border border-border p-5">
            <h3 className="font-display text-xl text-ivory">Profile</h3>
            <dl className="mt-4 space-y-2 text-sm text-muted">
              <div className="flex justify-between gap-4">
                <dt>Name</dt>
                <dd className="text-ivory">{user.name || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Email</dt>
                <dd className="text-ivory">{user.email || '—'}</dd>
              </div>
            </dl>
          </section>
          <section className="border border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl text-ivory">Recent orders</h3>
              <Link to="/account/orders" className="text-sm text-gold hover:text-gold-bright">
                View all
              </Link>
            </div>
            {loading ? (
              <p className="mt-4 text-sm text-muted">Loading orders…</p>
            ) : recent.length ? (
              <ul className="mt-4 space-y-3">
                {recent.map((order) => (
                  <li key={order.id}>
                    <Link
                      to={`/account/orders/${order.id}`}
                      className="flex items-center justify-between gap-3 border border-border p-3 text-sm hover:border-gold/50"
                    >
                      <div>
                        <p className="text-ivory">{order.id}</p>
                        <p className="text-muted">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge>{order.status}</Badge>
                        <p className="mt-2 text-gold-bright">{formatPrice(order.total)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">No orders yet. Place an order with this email to see it here.</p>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

export function OrdersPage() {
  const user = useAuthStore((s) => s.user)
  const { orders, loading } = useMyOrders()

  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <PageHero
        eyebrow="Orders"
        title="Order history"
        description="Live status for orders placed with this email — including guest checkout."
        crumbs={
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Account', to: '/account' },
              { label: 'Orders' },
            ]}
          />
        }
      />
      <div className="container-site section-pad py-10 md:py-14">
        {loading ? (
          <p className="text-sm text-muted">Loading orders…</p>
        ) : orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-4 border border-border p-4 hover:border-gold/50"
              >
                <div>
                  <p className="font-display text-xl text-ivory">{order.id}</p>
                  <p className="mt-1 text-sm text-muted">
                    {order.date} · {(order.items || []).length} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <Badge>{order.status}</Badge>
                  <p className="mt-2 text-gold-bright">{formatPrice(order.total)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order with this email, it will appear here."
            actionLabel="Shop now"
            actionTo="/shop"
          />
        )}
      </div>
    </>
  )
}

export function OrderDetailsPage() {
  const user = useAuthStore((s) => s.user)
  const { id } = useParams()
  const { orders, loading } = useMyOrders()
  const order = orders.find((o) => o.id === id)

  if (!user) return <Navigate to="/login" replace />

  if (loading) {
    return (
      <div className="container-site section-pad py-16 text-sm text-muted">Loading order…</div>
    )
  }

  if (!order) {
    return (
      <div className="container-site section-pad py-16">
          <EmptyState
            icon={Package}
            title="Order not found"
            description="We could not find that order on this account."
            actionLabel="Back to orders"
            actionTo="/account/orders"
          />
        </div>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Order"
        title={order.id}
        description={`Placed on ${order.date}`}
        crumbs={
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Account', to: '/account' },
              { label: 'Orders', to: '/account/orders' },
              { label: order.id },
            ]}
          />
        }
      />
      <div className="container-site section-pad grid gap-6 py-10 md:grid-cols-2 md:py-14">
        <section className="border border-border p-5">
          <h2 className="font-display text-xl text-ivory">Items</h2>
          <ul className="mt-4 space-y-3">
            {(order.items || []).map((item) => (
              <li key={`${item.name}-${item.size}`} className="flex justify-between gap-3 text-sm">
                <span className="text-muted">
                  {item.name} · {item.size} × {item.qty}
                </span>
                <span className="text-ivory">{formatPrice(item.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between border-t border-border pt-4 text-base">
            <span className="text-ivory">Total</span>
            <span className="text-gold-bright">{formatPrice(order.total)}</span>
          </div>
        </section>
        <section className="space-y-4 border border-border p-5 text-sm text-muted">
          <div>
            <h2 className="font-display text-xl text-ivory">Status</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{order.status}</Badge>
              <Badge tone="ivory">Payment: {order.paymentStatus}</Badge>
            </div>
            <p className="mt-3">{order.paymentMethod}</p>
            {order.paymentMethod === 'Online' && order.paymentStatus !== 'Paid' ? (
              <JazzCashDetails total={order.total} orderNumber={order.id} className="mt-4" />
            ) : null}
            <div className="mt-5">
              <OrderStatusTracker status={order.status} history={order.statusHistory} />
            </div>
          </div>
          <div>
            <h3 className="text-ivory">Shipping address</h3>
            <p className="mt-2">
              {order.shippingAddress?.name}
              <br />
              {order.shippingAddress?.address}
              <br />
              {order.shippingAddress?.area}, {order.shippingAddress?.city}
              <br />
              {order.shippingAddress?.phone}
            </p>
          </div>
          <Button to="/account/orders" variant="secondary">
            Back to orders
          </Button>
        </section>
      </div>
    </>
  )
}
