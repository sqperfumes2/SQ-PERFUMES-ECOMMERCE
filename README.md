# SQ Perfumes — Ecommerce Monorepo

Premium perfume ecommerce (MERN). Independently deployable packages for storefront, admin, and API.

## Structure

```text
storefront/   Customer site → Vercel
admin/        Owner admin → Vercel (separate project)
server/       Express API → Railway
docs/         Owner capabilities, E2E checklist, deploy & backup
```

DNS via Hostinger · Database via MongoDB Atlas.

## Live

Not deployed yet. MongoDB Atlas URI and Cloudinary keys will be added before launch.

## Phases (complete)

| Phase | Focus |
|-------|--------|
| 1 | Storefront frontend |
| 2 | Admin frontend |
| 3 | Backend API + MongoDB + auth |
| 4 | Live API integration |
| 5 | SEO, performance, testing checklist, deploy docs |

## Local development

### 1. API (`:5000`)

```bash
cd server
cp .env.example .env   # set MONGODB_URI to your Atlas connection string
npm install
npm run seed:admin     # owner login only — catalog stays empty
npm run dev
```

Do **not** run `npm run seed:demo` against Atlas. The store starts from scratch; add real products in admin. `seed:demo` is blocked on Atlas/production unless `ALLOW_DEMO_SEED=true` (throwaway local DB only).

Health: http://localhost:5000/api/health

Default owner (from `.env`): `ADMIN_EMAIL` / `ADMIN_PASSWORD`  
There is **no** public admin signup.

### 2. Storefront (`:5173`)

```bash
cd storefront
cp .env.example .env
npm install
npm run dev
```

### 3. Admin (`:5174`)

```bash
cd admin
cp .env.example .env
npm install
npm run dev
```

## Production builds

```bash
cd storefront && npm run build
cd admin && npm run build
cd server && npm start
```

## Environment

| Package | Example file | Key vars |
|---------|--------------|----------|
| server | `server/.env.example` | `MONGODB_URI`, JWT secrets, `CLIENT_URL`, `ADMIN_URL`, `COOKIE_SECURE` |
| storefront | `storefront/.env.example` | `VITE_API_URL`, `VITE_STOREFRONT_URL` |
| admin | `admin/.env.example` | `VITE_API_URL`, `VITE_ADMIN_URL`, `VITE_STOREFRONT_URL` |

Never commit real `.env` files.

## Documentation

- [Owner product controls](docs/OWNER_CAPABILITIES.md)
- [End-to-end checklist](docs/E2E_CHECKLIST.md)
- [Deployment (Vercel + Railway + Atlas + Hostinger)](docs/DEPLOYMENT.md)
- [Backup & seed notes](docs/BACKUP.md)
- [API README](server/README.md)

## Owner capabilities (summary)

From the admin panel the owner can manage real catalog data:

- Categories: **For Him / For Her / Unisex**
- **Actual price** (struck) + **Discounted price**
- Badges: Most popular, Featured, New, Sale
- Sold out (stock 0), archive, multi-image, descriptions, bottle sizes
- Duplicate product, storefront preview link, orders, coupons, banners

## Branding

- Storefront brand: `storefront/src/lib/brand.js`
- Theme tokens: `storefront/src/index.css`
- Logo: `storefront/src/assets/logo.jpeg` (also under `admin/src/assets/`)

## Notes

Do not push or deploy without explicit approval. After Phase 5, remaining launch work is real product images/content, Cloudinary keys, and the actual deploy when you request it. Atlas stays empty of mock catalog — seed the owner only, then add real products in admin.
