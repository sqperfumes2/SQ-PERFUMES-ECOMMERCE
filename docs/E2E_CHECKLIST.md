# End-to-end testing checklist

Use this before every production deploy. Mark each item after verifying on the target environment (local first, then staging/production).

## Prerequisites

- [ ] API running (`server` → `npm run start` or Railway health OK)
- [ ] Storefront pointed at live API (`VITE_API_URL`)
- [ ] Admin pointed at live API
- [ ] MongoDB Atlas reachable (`MONGODB_URI` on the API)
- [ ] Owner admin seeded (`npm run seed:admin` only — do not `seed:demo` on Atlas)
- [ ] Catalog starts empty until the owner adds real products in admin

## Storefront — catalog & SEO

- [ ] Home loads with hero, categories, product rails
- [ ] Shop / For Him / For Her / Unisex / New / Popular / Sale filter correctly
- [ ] Product detail shows images, sizes, Actual (struck) + Discounted price
- [ ] Most popular / New / Sale / Sold out badges render
- [ ] Sold-out size cannot be added to cart
- [ ] Search returns matching products
- [ ] Page titles and meta description update per route
- [ ] Product page includes Product JSON-LD in page source (View Source / DevTools)
- [ ] `robots.txt` and `sitemap.xml` are reachable at site root

## Cart & checkout

- [ ] Add to cart / update qty / remove item
- [ ] Wishlist toggle persists across refresh
- [ ] Promo codes: `WELCOME10`, `SQ20`, `FREESHIP` (or live coupons)
- [ ] Guest checkout creates order (`POST /api/orders` succeeds)
- [ ] Logged-in checkout attaches order to account
- [ ] Order success page shows order number
- [ ] COD payment method available

## Auth & account

- [ ] Register new customer
- [ ] Login / logout
- [ ] Account profile view
- [ ] Account orders list and detail

## Admin

- [ ] Login with seeded owner (no public signup)
- [ ] Dashboard KPIs and recent orders load
- [ ] Create product: For Him/Her/Unisex, Actual + Discounted, badges, images, stock 0 = sold out
- [ ] Edit / duplicate / archive product
- [ ] Storefront preview link opens correct PDP
- [ ] New product appears on storefront after save
- [ ] Update order status (Pending → Confirmed → …); stock deducts/restores correctly
- [ ] Coupons validate on storefront when active
- [ ] Banners/settings load if configured

## Security & config

- [ ] Admin cannot be registered via public API
- [ ] CORS allows only storefront + admin origins
- [ ] `COOKIE_SECURE=true` in production HTTPS
- [ ] JWT secrets are unique, long, and not committed
- [ ] `.env` files are not in git

## Production builds

- [ ] `cd storefront && npm run build` succeeds
- [ ] `cd admin && npm run build` succeeds
- [ ] `cd server && npm run start` boots without errors
- [ ] Health: `GET /api/health` returns success

## Post-deploy smoke

- [ ] Storefront URL loads over HTTPS
- [ ] Admin URL loads over HTTPS
- [ ] API health over HTTPS
- [ ] Place one real test order, then cancel/mark test clearly
- [ ] DNS: www / apex / admin / api resolve as documented
