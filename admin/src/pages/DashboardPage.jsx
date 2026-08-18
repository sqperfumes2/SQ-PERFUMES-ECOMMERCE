import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { AlertTriangle, Package, ShoppingCart, Users, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Card, PageHeader, StatCard, Table } from '../components/ui'
import { formatPrice, formatDate } from '../lib/utils'
import { contentApi, getErrorMessage } from '../lib/services'

const pieColors = ['#0f172a', '#b45309', '#64748b']

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contentApi
      .dashboard()
      .then((res) => setData(res.data.data))
      .catch((error) => toast.error(getErrorMessage(error, 'Failed to load dashboard')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-sm text-muted">Loading dashboard…</p>
  }

  if (!data) {
    return <p className="text-sm text-danger">Could not load analytics. Is the API running?</p>
  }

  const { kpis, revenueTrend, salesByCategory, salesByPayment, topProducts, recentOrders } = data

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live sales overview from MongoDB."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total sales"
          value={formatPrice(kpis.totalSales)}
          icon={Wallet}
          hint="Counted when an order is delivered"
        />
        <StatCard
          label="New orders today"
          value={kpis.ordersToday ?? 0}
          icon={ShoppingCart}
          hint={`${kpis.totalOrders} total · ${kpis.pendingOrders} pending`}
        />
        <StatCard label="Customers" value={kpis.totalCustomers} icon={Users} />
        <StatCard
          label="Low stock products"
          value={kpis.lowStockProducts}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending" value={kpis.pendingOrders} />
        <StatCard label="Confirmed" value={kpis.confirmedOrders} />
        <StatCard label="Shipped" value={kpis.shippedOrders} />
        <StatCard label="Delivered" value={kpis.deliveredOrders} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Revenue trend" className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend?.length ? revenueTrend : [{ month: '—', revenue: 0 }]}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b45309" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={(v) => formatPrice(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#b45309" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Sales by category">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory?.length ? salesByCategory : [{ name: 'None', value: 1 }]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {(salesByCategory || []).map((entry, index) => (
                    <Cell key={entry.name || index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatPrice(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Sales by payment method">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByPayment?.length ? salesByPayment : [{ name: 'COD', value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={(v) => formatPrice(v)} />
                <Bar dataKey="value" fill="#0f172a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Top products"
          action={
            <Link to="/products" className="text-sm text-gold hover:underline">
              Manage
            </Link>
          }
        >
          <Table headers={['Product', 'Sold']}>
            {(topProducts || []).map((item) => (
              <tr key={item.name} className="border-b border-line last:border-0">
                <td className="px-3 py-3 font-medium">{item.name}</td>
                <td className="px-3 py-3 text-muted">{item.sold}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <div className="mt-6">
        <Card
          title="Recent orders"
          action={
            <Link to="/orders" className="text-sm text-gold hover:underline">
              View all
            </Link>
          }
        >
          <Table headers={['Order', 'Customer', 'Status', 'Total']}>
            {(recentOrders || []).map((order) => (
              <tr key={order._id || order.id} className="border-b border-line last:border-0">
                <td className="px-3 py-3">
                  <Link
                    to={`/orders/${order._id}`}
                    className="font-medium text-gold hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-muted">{formatDate(order.createdAt || order.date)}</p>
                </td>
                <td className="px-3 py-3">{order.customerSnapshot?.name || 'Guest'}</td>
                <td className="px-3 py-3">
                  <Badge tone={order.status === 'Cancelled' ? 'danger' : 'info'}>{order.status}</Badge>
                </td>
                <td className="px-3 py-3">{formatPrice(order.total)}</td>
              </tr>
            ))}
          </Table>
          {!recentOrders?.length ? (
            <p className="mt-3 text-sm text-muted">
              <Package size={14} className="mr-1 inline" />
              No orders yet.
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
