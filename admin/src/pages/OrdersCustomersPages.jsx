import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Printer } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  EmptyRow,
  Input,
  PageHeader,
  Select,
  Table,
} from '../components/ui'
import { ORDER_STATUSES, PAYMENT_STATUSES, formatDate, formatPrice } from '../lib/utils'
import { customersApi, getErrorMessage, ordersApi } from '../lib/services'

function statusTone(status) {
  if (status === 'Delivered' || status === 'Paid') return 'success'
  if (status === 'Cancelled' || status === 'Failed' || status === 'Refunded') return 'danger'
  if (status === 'Pending') return 'warning'
  return 'info'
}

function orderId(order) {
  return order._id || order.id
}

function whatsappDigits(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('92') && digits.length >= 12) return digits
  if (digits.startsWith('0') && digits.length >= 11) return `92${digits.slice(1)}`
  if (digits.length === 10 && digits.startsWith('3')) return `92${digits}`
  return digits
}

function statusWhatsApp(order) {
  const name = String(order.customerSnapshot?.name || 'Customer').trim() || 'Customer'
  const orderNo = order.orderNumber || ''
  const status = order.status
  const lines = {
    Confirmed: `Dear ${name}, Thanks for placing order from SQ Perfumes. Your Order No ${orderNo} is Confirmed.`,
    Shipped: `Dear ${name}, Thanks for placing order from SQ Perfumes. Your Order No ${orderNo} is Shipped.`,
    Delivered: `Dear ${name}, Thanks for placing order from SQ Perfumes. Your Order No ${orderNo} is Delivered.`,
  }
  const message = lines[status] || ''
  const phone = whatsappDigits(order.customerSnapshot?.phone)
  const href =
    message && phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : ''
  return { message, href, phone, status }
}

function WhatsAppStatusCard({ order }) {
  const { message, href, phone, status } = statusWhatsApp(order)
  if (!message) return null

  return (
    <div className="rounded-md border border-gold/30 bg-gold/5 p-3">
      <p className="text-sm font-medium text-ink">WhatsApp customer — {status}</p>
      <p className="mt-2 whitespace-pre-wrap rounded-md border border-line bg-white p-3 text-sm text-slate">
        {message}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#1ebe5d]"
        >
          Send on WhatsApp
        </a>
      ) : (
        <p className="mt-2 text-xs text-danger">This order has no phone number for WhatsApp.</p>
      )}
      {phone ? <p className="mt-2 text-xs text-muted">Opens wa.me/{phone}</p> : null}
    </div>
  )
}

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await ordersApi.list({
        limit: 100,
        ...(status !== 'all' ? { status } : {}),
        ...(query.trim() ? { q: query.trim() } : {}),
      })
      setOrders(data.data || [])
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load orders'))
    } finally {
      setLoading(false)
    }
  }, [query, status])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <PageHeader title="Orders" description="Live orders from the storefront." />
      <Card>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Search order ID, customer, city"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        {loading ? (
          <p className="py-8 text-sm text-muted">Loading orders…</p>
        ) : orders.length ? (
          <Table headers={['Order', 'Customer', 'Order status', 'Payment', 'Total', '']}>
            {orders.map((order) => (
              <tr key={orderId(order)} className="border-b border-line last:border-0">
                <td className="px-3 py-3">
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                </td>
                <td className="px-3 py-3">
                  {order.customerSnapshot?.name || 'Guest'}
                  <p className="text-xs text-muted">{order.shippingAddress?.city}</p>
                </td>
                <td className="px-3 py-3">
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  <Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                  <p className="mt-1 text-xs text-muted">{order.paymentMethod}</p>
                </td>
                <td className="px-3 py-3">{formatPrice(order.total)}</td>
                <td className="px-3 py-3">
                  <Link to={`/orders/${orderId(order)}`} className="text-sm text-gold hover:underline">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyRow message="No orders yet." />
        )}
      </Card>
    </div>
  )
}

export function OrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await ordersApi.get(id)
      setOrder(data.data)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load order'))
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = async (status) => {
    try {
      const { data } = await ordersApi.updateStatus(id, { status })
      setOrder(data.data)
      toast.success(
        ['Confirmed', 'Shipped', 'Delivered'].includes(status)
          ? `Order ${status.toLowerCase()} — WhatsApp message is ready`
          : 'Order status updated',
      )
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update order status'))
    }
  }

  const changePayment = async (paymentStatus) => {
    try {
      const { data } = await ordersApi.updatePayment(id, { paymentStatus })
      setOrder(data.data)
      toast.success('Payment status updated')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update payment status'))
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading order…</p>
  }

  if (!order) {
    return (
      <Card>
        <EmptyRow message="Order not found." />
        <div className="mt-4">
          <Link to="/orders" className="text-sm text-gold hover:underline">
            Back to orders
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title={order.orderNumber}
          description={`Placed ${formatDate(order.createdAt)}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => window.print()}>
                <Printer size={14} />
                Print parcel label
              </Button>
              <Link to="/orders" className="text-sm text-gold hover:underline">
                Back to orders
              </Link>
            </div>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Items" className="lg:col-span-2">
          <Table headers={['Item', 'Qty', 'Price']}>
            {(order.items || []).map((item) => (
              <tr key={`${item.name}-${item.size}`} className="border-b border-line last:border-0">
                <td className="px-3 py-3">
                  {item.name}
                  <p className="text-xs text-muted">{item.size}</p>
                </td>
                <td className="px-3 py-3">{item.qty}</td>
                <td className="px-3 py-3">{formatPrice(item.price)}</td>
              </tr>
            ))}
          </Table>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Discount</dt>
              <dd>-{formatPrice(order.discount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card title="Status management">
            <div className="space-y-4">
              <Select
                label="Order status"
                value={order.status}
                onChange={(e) => changeStatus(e.target.value)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <Select
                label="Payment status"
                value={order.paymentStatus}
                onChange={(e) => changePayment(e.target.value)}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted">
                Order status and payment status are kept separate on purpose.
              </p>
              <WhatsAppStatusCard order={order} />
            </div>
          </Card>
          <Card title="Customer & shipping">
            <div className="space-y-2 text-sm text-muted">
              <p>
                <span className="text-ink">{order.customerSnapshot?.name || 'Guest'}</span>
              </p>
              <p>{order.customerSnapshot?.email}</p>
              <p>{order.customerSnapshot?.phone}</p>
              <p className="pt-2">
                {order.shippingAddress?.address}
                <br />
                {order.shippingAddress?.area}, {order.shippingAddress?.city}
              </p>
              {order.shippingAddress?.notes ? (
                <p className="pt-2">Notes: {order.shippingAddress.notes}</p>
              ) : null}
              <p className="pt-2">Payment: {order.paymentMethod}</p>
            </div>
          </Card>
        </div>
      </div>
      </div>

      <section id="parcel-label" className="parcel-label">
        <p className="parcel-brand">SQ Perfumes</p>
        <p className="parcel-order">{order.orderNumber}</p>
        <p className="parcel-name">{order.customerSnapshot?.name || 'Guest'}</p>
        <p>{order.customerSnapshot?.phone}</p>
        <p className="parcel-address">
          {order.shippingAddress?.address}
          <br />
          {order.shippingAddress?.area}, {order.shippingAddress?.city}
        </p>
        {order.shippingAddress?.notes ? <p>Notes: {order.shippingAddress.notes}</p> : null}
        <p className="parcel-pay">
          {order.paymentMethod}
          {order.paymentMethod === 'Cash on Delivery' ? ` · ${formatPrice(order.total)}` : ''}
        </p>
      </section>
    </div>
  )
}

export function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    customersApi
      .list()
      .then(({ data }) => setCustomers(data.data || []))
      .catch((error) => toast.error(getErrorMessage(error, 'Failed to load customers')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return customers.filter(
      (c) =>
        String(c.name || '')
          .toLowerCase()
          .includes(q) ||
        String(c.email || '')
          .toLowerCase()
          .includes(q) ||
        String(c.phone || '')
          .toLowerCase()
          .includes(q),
    )
  }, [customers, query])

  return (
    <div>
      <PageHeader title="Customers" description="Accounts created on the storefront." />
      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search customers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {loading ? (
          <p className="py-8 text-sm text-muted">Loading customers…</p>
        ) : filtered.length ? (
          <Table headers={['Customer', 'Contact', 'Status']}>
            {filtered.map((customer) => (
              <tr key={customer.id || customer._id} className="border-b border-line last:border-0">
                <td className="px-3 py-3">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs text-muted">Joined {formatDate(customer.createdAt)}</p>
                </td>
                <td className="px-3 py-3">
                  {customer.email}
                  <p className="text-xs text-muted">{customer.phone || '—'}</p>
                </td>
                <td className="px-3 py-3">
                  <Badge tone={customer.isActive !== false ? 'success' : 'neutral'}>
                    {customer.isActive !== false ? 'active' : 'disabled'}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyRow message="No customers yet." />
        )}
      </Card>
    </div>
  )
}
