# Backup & seed notes

## MongoDB Atlas backups

1. Enable **Cloud Backup** (or Continuous Backup) on the Atlas cluster.
2. Before major catalog changes, take a manual snapshot.
3. Restore into a temporary database first if testing a restore.
4. Keep connection strings and Atlas org 2FA restricted to the owner.

## What to back up

| Data | Location | Notes |
|------|----------|-------|
| Products, orders, customers, coupons | Atlas | Primary business data |
| Admin users | Atlas `adminusers` | Re-seed owner if lost (`npm run seed:admin`) |
| Store settings / banners | Atlas | Recreate from admin if needed |
| Uploaded images | Cloudinary (when configured) | Atlas only stores URLs |
| Env secrets | Password manager | Never commit `.env` |

## Local dump / restore (optional)

```bash
# Dump
mongodump --uri="%MONGODB_URI%" --out=./backups/$(date +%Y%m%d)

# Restore (careful — overwrites)
mongorestore --uri="%MONGODB_URI%" --drop ./backups/YYYYMMDD
```

On Windows PowerShell, use a fixed folder name instead of `date` if preferred.

## Seed scripts

```bash
cd server
npm run seed:admin   # owner from ADMIN_* env — the only seed allowed on Atlas
```

`seed:admin` does **not** open public registration. There is no public admin signup route.

Do **not** run `npm run seed:demo` against Atlas. Production starts empty (no mock products, coupons, or banners). `seed:demo` is blocked on Atlas/production unless `ALLOW_DEMO_SEED=true` on a throwaway local database.

## After restore

1. Verify `GET /api/health`
2. Admin login
3. Spot-check product count and latest orders
4. Place a test order
