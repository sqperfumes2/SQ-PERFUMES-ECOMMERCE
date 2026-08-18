import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

const lazyNamed = (loader, name) =>
  lazy(() => loader().then((mod) => ({ default: mod[name] })))

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))

const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const FamiliesPage = lazyNamed(() => import('./pages/CatalogPages'), 'FamiliesPage')
const InventoryPage = lazyNamed(() => import('./pages/CatalogPages'), 'InventoryPage')

const OrdersPage = lazyNamed(() => import('./pages/OrdersCustomersPages'), 'OrdersPage')
const OrderDetailsPage = lazyNamed(() => import('./pages/OrdersCustomersPages'), 'OrderDetailsPage')
const CustomersPage = lazyNamed(() => import('./pages/OrdersCustomersPages'), 'CustomersPage')

const CouponsPage = lazyNamed(() => import('./pages/MarketingPages'), 'CouponsPage')
const CampaignsPage = lazyNamed(() => import('./pages/MarketingPages'), 'CampaignsPage')
const HomepageMediaPage = lazy(() => import('./pages/HomepageMediaPage'))
const ReviewsPage = lazyNamed(() => import('./pages/MarketingPages'), 'ReviewsPage')
const NewsletterPage = lazyNamed(() => import('./pages/MarketingPages'), 'NewsletterPage')
const InquiriesPage = lazyNamed(() => import('./pages/MarketingPages'), 'InquiriesPage')
const ContentPage = lazyNamed(() => import('./pages/MarketingPages'), 'ContentPage')

const ShippingPage = lazyNamed(() => import('./pages/SettingsPages'), 'ShippingPage')
const PaymentsPage = lazyNamed(() => import('./pages/SettingsPages'), 'PaymentsPage')
const SettingsPage = lazyNamed(() => import('./pages/SettingsPages'), 'SettingsPage')
const ProfilePage = lazyNamed(() => import('./pages/SettingsPages'), 'ProfilePage')
const ActivityPage = lazyNamed(() => import('./pages/SettingsPages'), 'ActivityPage')

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="fragrance-families" element={<FamiliesPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="banners" element={<HomepageMediaPage />} />
              <Route path="homepage-media" element={<HomepageMediaPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="newsletter" element={<NewsletterPage />} />
              <Route path="inquiries" element={<InquiriesPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="shipping" element={<ShippingPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="activity" element={<ActivityPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
