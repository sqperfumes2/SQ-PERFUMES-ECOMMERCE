import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  Flower2,
  Boxes,
  ShoppingCart,
  Users,
  TicketPercent,
  Megaphone,
  Image,
  Star,
  Mail,
  MessageSquare,
  FileText,
  Truck,
  CreditCard,
  Settings,
  UserRound,
  ScrollText,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { brand } from '../lib/utils'
import { useAuthStore } from '../store'
import { authApi, ordersApi } from '../lib/services'

const navSections = [
  {
    title: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Catalog',
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: Tags },
      { to: '/fragrance-families', label: 'Fragrance families', icon: Flower2 },
      { to: '/inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { to: '/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/customers', label: 'Customers', icon: Users },
      { to: '/coupons', label: 'Coupons', icon: TicketPercent },
      { to: '/campaigns', label: 'Merchandising', icon: Megaphone },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/banners', label: 'Homepage Media', icon: Image },
      { to: '/reviews', label: 'Reviews', icon: Star },
      { to: '/newsletter', label: 'Newsletter', icon: Mail },
      { to: '/inquiries', label: 'Inquiries', icon: MessageSquare },
      { to: '/content', label: 'Website content', icon: FileText },
    ],
  },
  {
    title: 'Settings',
    items: [
      { to: '/shipping', label: 'Shipping', icon: Truck },
      { to: '/payments', label: 'Payments', icon: CreditCard },
      { to: '/settings', label: 'Store settings', icon: Settings },
      { to: '/profile', label: 'Admin profile', icon: UserRound },
      { to: '/activity', label: 'Activity logs', icon: ScrollText },
    ],
  },
]

function Sidebar({ onNavigate, pendingOrders = 0 }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <img src={brand.logo} alt="" className="h-10 w-10 rounded object-cover" />
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">{brand.shortName}</p>
          <p className="text-xs text-sidebar-muted">{brand.adminTitle}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-2 text-[11px] uppercase tracking-[0.16em] text-sidebar-muted">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-sidebar-active text-white'
                        : 'text-sidebar-muted hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={16} />
                  <span className="flex-1">{item.label}</span>
                  {item.to === '/orders' && pendingOrders > 0 ? (
                    <span className="min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
                      {pendingOrders > 99 ? '99+' : pendingOrders}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [pendingOrders, setPendingOrders] = useState(0)
  const admin = useAuthStore((s) => s.admin)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    const load = () => {
      ordersApi
        .summary()
        .then(({ data }) => {
          if (alive) setPendingOrders(Number(data.data?.pendingOrders || 0))
        })
        .catch(() => {})
    }
    load()
    const timer = setInterval(load, 30000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden bg-sidebar lg:block">
        <Sidebar pendingOrders={pendingOrders} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 h-full w-72 bg-sidebar">
            <button
              type="button"
              className="absolute right-3 top-4 text-white"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} pendingOrders={pendingOrders} />
          </div>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-panel/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-line p-2 text-slate lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-sm font-medium text-ink">SQ Perfumes Admin</p>
              <p className="text-xs text-muted">Live catalog and orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink">{admin?.name}</p>
              <p className="text-xs text-muted">{admin?.role}</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-slate hover:bg-canvas"
              onClick={async () => {
                try {
                  await authApi.logout()
                } catch {
                  // ignore network logout errors
                }
                logout()
                toast.success('Signed out')
                navigate('/login')
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
        <main className="px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
