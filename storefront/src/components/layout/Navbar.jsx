import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { brand } from '../../lib/brand'
import { useAuthStore, useCartStore, useWishlistStore } from '../../store'
import { storeApi } from '../../lib/services'

const baseLinks = [
  { to: '/shop', label: 'Shop All' },
  { to: '/shop/best-sellers', label: 'Best Sellers' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [navLinks, setNavLinks] = useState(baseLinks)
  const navigate = useNavigate()

  const cartCount = useCartStore((s) => s.getItemCount())
  const wishlistCount = useWishlistStore((s) => s.ids.length)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    storeApi
      .categories()
      .then(({ data }) => {
        const cats = (data.data || [])
          .filter((c) => c.showInNav !== false && c.status !== 'hidden')
          .map((c) => ({ to: `/shop/${c.slug}`, label: c.name }))
        setNavLinks([...baseLinks, ...cats])
      })
      .catch(() => setNavLinks(baseLinks))
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSearchOpen(false)
    setMobileOpen(false)
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const iconBtn =
    'touch-target inline-flex items-center justify-center rounded-sm p-2 text-ivory hover:text-gold'

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border transition-colors ${
        scrolled ? 'bg-ink/95 backdrop-blur-md' : 'bg-ink'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="container-site section-pad">
        <div className="flex h-14 items-center justify-between gap-2 sm:gap-4 md:h-20">
          <button
            type="button"
            className={`${iconBtn} md:hidden`}
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3 md:flex-none md:justify-start"
            aria-label={`${brand.name} home`}
          >
            <img
              src={brand.logo}
              alt={`${brand.name} logo`}
              className="h-9 w-9 shrink-0 rounded-sm object-cover sm:h-10 sm:w-10 md:h-12 md:w-12"
              width={48}
              height={48}
            />
            <div className="min-w-0">
              <p className="font-display text-xs tracking-[0.18em] text-gold-bright sm:text-sm sm:tracking-[0.22em] md:tracking-[0.28em] md:text-base">
                {brand.shortName}
              </p>
              <p className="text-[9px] uppercase tracking-[0.28em] text-muted sm:text-[10px] sm:tracking-[0.3em]">
                Fragrance
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 xl:gap-5 lg:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/shop'}
                className={({ isActive }) =>
                  `whitespace-nowrap text-xs uppercase tracking-[0.16em] transition-colors ${
                    isActive ? 'text-gold-bright' : 'text-muted hover:text-ivory'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className={iconBtn}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <Link
              to={user ? '/account' : '/login'}
              className={`${iconBtn} hidden sm:inline-flex`}
              aria-label="Account"
            >
              <User size={18} />
            </Link>
            <Link to="/wishlist" className={`relative ${iconBtn}`} aria-label="Wishlist">
              <Heart size={18} />
              {wishlistCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] text-ink">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link to="/cart" className={`relative ${iconBtn}`} aria-label="Cart">
              <ShoppingBag size={18} />
              {cartCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] text-ink">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        {searchOpen ? (
          <form onSubmit={submitSearch} className="border-t border-border py-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fragrances…"
              className="w-full border border-border bg-charcoal px-4 py-3.5 text-base text-ivory placeholder:text-muted sm:text-sm"
              enterKeyHint="search"
            />
          </form>
        ) : null}
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink lg:hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="container-site section-pad flex h-14 shrink-0 items-center justify-between border-b border-border">
            <p className="font-display tracking-[0.2em] text-gold">{brand.shortName}</p>
            <button
              type="button"
              className={iconBtn}
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={22} />
            </button>
          </div>
          <nav className="container-site section-pad flex flex-1 flex-col gap-1 overflow-y-auto pb-safe pt-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/shop'}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border py-4 text-sm uppercase tracking-[0.18em] text-ivory active:text-gold"
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/track-order"
              onClick={() => setMobileOpen(false)}
              className="border-b border-border py-4 text-sm uppercase tracking-[0.18em] text-muted active:text-gold"
            >
              Track order
            </NavLink>
            <NavLink
              to={user ? '/account' : '/login'}
              onClick={() => setMobileOpen(false)}
              className="border-b border-border py-4 text-sm uppercase tracking-[0.18em] text-muted active:text-gold"
            >
              {user ? 'Account' : 'Login'}
            </NavLink>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
