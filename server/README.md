# SQ Perfumes API

Node.js + Express + MongoDB backend for the SQ Perfumes ecommerce platform.

## Setup

1. Copy environment file:

```bash
cd server
cp .env.example .env
```

2. Set `MONGODB_URI` to your MongoDB Atlas connection string (real DB).

3. Change JWT secrets and `ADMIN_PASSWORD`.

4. Install and run:

```bash
npm install
npm run seed:admin
npm run dev
```

Do **not** run `npm run seed:demo` against Atlas. The catalog stays empty until the owner adds real products in admin.

API base: `http://localhost:5000/api`  
Health: `http://localhost:5000/api/health`

## Admin bootstrap

Admin registration is **not** public. Create the first owner with:

```bash
npm run seed:admin
```

Uses `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `.env`.

## Main routes

### Auth
- `POST /api/auth/admin/login`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `PATCH /api/auth/change-password`

### Catalog
- `GET /api/products`
- `GET /api/products/slug/:slug`
- `GET /api/categories`
- `GET /api/fragrance-families`
- Admin CRUD under `/api/admin/products`, `/api/admin/categories`, `/api/admin/fragrance-families`
- `GET /api/admin/inventory`

### Commerce
- `POST /api/orders`
- `POST /api/coupons/validate`
- `GET /api/account/orders`
- Admin orders/customers/coupons/reviews under `/api/admin/*`

### Content
- `GET /api/banners`
- `GET /api/settings`
- `POST /api/newsletter`
- `POST /api/contact`
- Admin dashboard/settings/uploads/activity under `/api/admin/*`

## Security

- Helmet, CORS (storefront + admin origins), rate limiting
- HTTP-only JWT cookies + Bearer support
- bcrypt password hashing
- Zod validation
- Mongo injection sanitization
- No public admin signup

## Inventory rules

- Stock is tracked per bottle-size variant
- Orders start as `Pending` without deducting stock
- Stock deducts when moving to Confirmed / Processing / Shipped / Delivered
- Cancelled / Returned restores stock when it was previously deducted
- Oversell protection uses MongoDB transactions on order create

## Order vs payment status

Keep separate:
- Order: Pending → Confirmed → Processing → Shipped → Delivered | Cancelled | Returned
- Payment: Pending | Paid | Failed | Refunded

## Image uploads

- Admin **Homepage Media**: home BG + For Him/Her/Unisex covers � Cloudinary required
- Admin **Products**: drag & drop; Cloudinary when keys set, else local `uploads/`
- Folders: `sq-perfumes/hero`, `category-him`, `category-her`, `category-unisex`, `product`
- Max 5 MB � JPG / PNG / WebP / GIF

See [../docs/OWNER_CAPABILITIES.md](../docs/OWNER_CAPABILITIES.md) for size standards.

## Seed & backup

```bash
npm run seed:admin   # owner from ADMIN_* env — only seed allowed on Atlas
# npm run seed:demo  # blocked on Atlas/production; throwaway local DB only
```

See [../docs/BACKUP.md](../docs/BACKUP.md) and [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).

