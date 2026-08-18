# Deployment guide — SQ Perfumes

Target topology:

| Service | Host | Example URL |
|---------|------|-------------|
| Storefront | Vercel | `https://www.sqperfumes.com` |
| Admin | Vercel (separate project) | `https://admin.sqperfumes.com` |
| API | Railway | `https://api.sqperfumes.com` |
| Database | MongoDB Atlas | cluster URI |
| DNS | Hostinger | A / CNAME records |

Do **not** deploy until the owner explicitly approves.

---

## First deploy — platform URLs (no custom DNS yet)

Use Railway and Vercel default hostnames first. Custom Hostinger domains come later. CORS and Vite env must match these URLs **exactly** (no trailing slash).

Order matters: the API must be live before the frontends are built, because `VITE_API_URL` is baked in at Vercel build time.

### 0. Push this repo

GitHub is the deploy source for this SQ Perfumes repo. Commit and push `main` before importing (local `.env` stays gitignored).

### 1. Atlas

In Atlas → Network Access, allow `0.0.0.0/0` (Railway egress IPs change) or Railway’s published IPs.

### 2. Railway — API

1. New project → Deploy from GitHub → this repo.
2. **Root directory:** `server`. Start command is `npm start` ([server/railway.json](../server/railway.json) health-checks `/api/health`).
3. Set variables **before** the first successful boot:

| Variable | First deploy |
|----------|----------------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas URI (same as local `server/.env`, do not commit) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | New long random strings — do not reuse the local/dev values |
| `COOKIE_SECURE` | `true` |
| `CLIENT_URL` | Storefront Vercel URL, e.g. `https://<storefront>.vercel.app` |
| `ADMIN_URL` | Admin Vercel URL, e.g. `https://<admin>.vercel.app` |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Required at boot; used by `seed:admin` |
| `CLOUDINARY_*` | Same as local if uploads should work |

If Vercel URLs are not known yet, create the two Vercel projects first (step 3) to get the `*.vercel.app` hostnames, paste them here, then deploy Railway.

4. Generate a Railway public domain. Health: `https://<api>.up.railway.app/api/health`.
5. Do **not** run `seed:demo`. After the API is up, run `seed:admin` once (local machine with this URI, or Railway shell).

### 3. Vercel — two projects

**Storefront** — Import the same GitHub repo.

- Root Directory: `storefront`
- Framework: Vite · Build: `npm run build` · Output: `dist`
- Env:

```text
VITE_API_URL=https://<api>.up.railway.app/api
VITE_STOREFRONT_URL=https://<storefront>.vercel.app
```

**Admin** — second Vercel project, same repo.

- Root Directory: `admin`
- Env:

```text
VITE_API_URL=https://<api>.up.railway.app/api
VITE_ADMIN_URL=https://<admin>.vercel.app
VITE_STOREFRONT_URL=https://<storefront>.vercel.app
```

Redeploy both after env is saved (Vite does not pick up env on a running build).

### 4. Point CORS at the real Vercel URLs

If Railway `CLIENT_URL` / `ADMIN_URL` were placeholders, update them to the live `*.vercel.app` URLs (no trailing slash). Railway restarts the API.

### 5. Smoke

- `GET https://<api>.up.railway.app/api/health`
- Storefront and admin load over HTTPS
- Admin login (seeded owner) — then change the password

When you attach `www` / `admin` / `api.sqperfumes.com`, update Railway CORS, Vercel `VITE_*` vars, and rebuild. See Hostinger DNS below.

---

## 1. MongoDB Atlas

1. Create a cluster and database user.
2. Network Access: allow Railway egress IPs (or `0.0.0.0/0` only if you accept the risk).
3. Create database `sq_perfumes` (or let the app create collections).
4. Copy the **same** Atlas connection string into Railway as `MONGODB_URI` (and into local `server/.env` for seeding). Do not commit it.

### Seed after first connect (owner only)

Atlas stays **empty of catalog data**. From a machine with the production URI (or a Railway one-off shell):

```bash
cd server
# MONGODB_URI and ADMIN_* must match production
npm run seed:admin
```

Never run `npm run seed:demo` against Atlas or in a Railway shell. The owner adds real products, categories, and coupons from the admin panel. If demo data was already inserted, delete those collections in Atlas (keep `adminusers`).

---

## 2. Railway (API)

1. New project → Deploy from GitHub (root directory: `server`).
2. Set environment variables from `server/.env.example`:

| Variable | Production notes |
|----------|------------------|
| `NODE_ENV` | `production` |
| `PORT` | Railway sets this; app already reads `process.env.PORT` |
| `MONGODB_URI` | **Required.** Same Atlas connection string as local `server/.env`. Paste it in Railway → Variables before the first deploy. |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Long random strings |
| `COOKIE_SECURE` | `true` |
| `CLIENT_URL` | `https://www.sqperfumes.com` |
| `ADMIN_URL` | `https://admin.sqperfumes.com` |
| `CLOUDINARY_*` | Optional until image uploads |
| `SMTP_*` | Optional for email |

3. Generate a public domain, then attach custom domain `api.sqperfumes.com`.
4. Health check path: `/api/health`.
5. Confirm CORS origins match the live storefront and admin URLs exactly (no trailing slash mismatch).
6. Do **not** run `npm run seed:demo` in a Railway one-off shell. After deploy, run `npm run seed:admin` once if the owner user does not already exist.

---

## 3. Vercel — Storefront

1. Import repo → Root Directory: `storefront`.
2. Framework: Vite. Build: `npm run build`. Output: `dist`.
3. Environment:

```text
VITE_API_URL=https://api.sqperfumes.com/api
VITE_STOREFRONT_URL=https://www.sqperfumes.com
```

4. `vercel.json` already rewrites SPA routes to `index.html`.
5. Attach domain `www.sqperfumes.com` (and apex if desired).

---

## 4. Vercel — Admin

1. Separate Vercel project → Root Directory: `admin`.
2. Environment:

```text
VITE_API_URL=https://api.sqperfumes.com/api
VITE_ADMIN_URL=https://admin.sqperfumes.com
VITE_STOREFRONT_URL=https://www.sqperfumes.com
```

3. Attach `admin.sqperfumes.com`.
4. Confirm cookies work cross-subdomain only if you later share a parent domain cookie strategy; today the admin uses API cookies against `api.*` with CORS credentials — keep API and frontends on HTTPS.

---

## 5. Hostinger DNS

Typical records (replace with Railway/Vercel target values from their dashboards):

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A / ALIAS | `@` | Vercel apex IP / alias | Apex site |
| CNAME | `www` | `cname.vercel-dns.com` | Storefront |
| CNAME | `admin` | `cname.vercel-dns.com` | Admin |
| CNAME | `api` | Railway domain | API |

Wait for DNS propagation, then verify SSL in Vercel and Railway.

---

## 6. Post-deploy

1. Open `/api/health`.
2. Admin login with seeded owner; change password immediately.
3. Create one real product; confirm it on the storefront.
4. Place one test COD order.
5. Walk through [E2E_CHECKLIST.md](./E2E_CHECKLIST.md).

---

## 7. Rollback notes

- Vercel: promote previous deployment.
- Railway: redeploy prior successful build.
- Atlas: restore from backup snapshot (see [BACKUP.md](./BACKUP.md)).
