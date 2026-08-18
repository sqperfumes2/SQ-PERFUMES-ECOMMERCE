## Confirmed before Phase 4

### Deployment
- Storefront → Vercel (`www`)
- Admin → Vercel (`admin` subdomain, separate project)
- API → Railway
- DB → MongoDB Atlas
- Domain DNS → Hostinger

### Owner product controls (locked)
- Add / edit / archive products
- Category audience: **For Him** / **For Her** / **Unisex** (stored as men/women/unisex)
- **Actual price** (compare-at, shown struck through) + **Discounted price** (selling price)
- Badges: Most popular (best seller), Featured, New arrival, On sale
- **Sold out** control (product or size via stock 0)
- Descriptions + multiple images (drag & drop → Cloudinary when keys set)
- Soft remove = Archive (preferred); hard delete with confirm only

### Homepage Media (Admin → Homepage Media)
- Home background + hero text
- **Shop All** and **Best Sellers** cover images (required)
- Custom category cards: create under **Categories** (any name: Unisex, For Him, etc.) with cover
- Optional rails: Best Sellers / New Arrivals / Featured — only show when enabled **and** ≥3 matching products

Requires Cloudinary keys in `server/.env`.

### Extra included
- Bottle-size variants with own price/stock
- Inventory low-stock alerts
- Orders status management
- Coupons, homepage merchandising
- Duplicate product (admin UX)
- Storefront preview link
