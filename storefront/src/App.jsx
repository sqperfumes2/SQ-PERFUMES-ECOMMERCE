import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'

const lazyNamed = (loader, name) =>
  lazy(() => loader().then((mod) => ({ default: mod[name] })))

const HomePage = lazy(() => import('./pages/HomePage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))

const LoginPage = lazyNamed(() => import('./pages/AuthPages'), 'LoginPage')
const RegisterPage = lazyNamed(() => import('./pages/AuthPages'), 'RegisterPage')
const ForgotPasswordPage = lazyNamed(() => import('./pages/AuthPages'), 'ForgotPasswordPage')
const ResetPasswordPage = lazyNamed(() => import('./pages/AuthPages'), 'ResetPasswordPage')

const AccountPage = lazyNamed(() => import('./pages/AccountPages'), 'AccountPage')
const OrdersPage = lazyNamed(() => import('./pages/AccountPages'), 'OrdersPage')
const OrderDetailsPage = lazyNamed(() => import('./pages/AccountPages'), 'OrderDetailsPage')

const AboutPage = lazyNamed(() => import('./pages/ContentPages'), 'AboutPage')
const ContactPage = lazyNamed(() => import('./pages/ContentPages'), 'ContactPage')
const FaqPage = lazyNamed(() => import('./pages/ContentPages'), 'FaqPage')
const ShippingPage = lazyNamed(() => import('./pages/ContentPages'), 'ShippingPage')
const ReturnsPage = lazyNamed(() => import('./pages/ContentPages'), 'ReturnsPage')
const PrivacyPage = lazyNamed(() => import('./pages/ContentPages'), 'PrivacyPage')
const TermsPage = lazyNamed(() => import('./pages/ContentPages'), 'TermsPage')
const NotFoundPage = lazyNamed(() => import('./pages/ContentPages'), 'NotFoundPage')

function RouteFallback() {
  return (
    <div className="container-site section-pad flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">SQ Perfumes</p>
      <p className="mt-3 font-display text-2xl text-ivory">Loading…</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="shop/:collection" element={<ShopPage />} />
            <Route path="product/:slug" element={<ProductDetailsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-success" element={<OrderSuccessPage />} />
            <Route path="track-order" element={<TrackOrderPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="account/orders" element={<OrdersPage />} />
            <Route path="account/orders/:id" element={<OrderDetailsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="shipping" element={<ShippingPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
