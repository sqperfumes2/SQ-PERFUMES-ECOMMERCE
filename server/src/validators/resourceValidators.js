const { z } = require('zod');

const variantSchema = z.object({
  size: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0),
});

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(2),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().min(1),
  gender: z.enum(['men', 'women', 'unisex']),
  fragranceFamily: z.string().min(1),
  topNotes: z.array(z.string()).optional(),
  middleNotes: z.array(z.string()).optional(),
  baseNotes: z.array(z.string()).optional(),
  variants: z.array(variantSchema).min(1),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  onSale: z.boolean().optional(),
  occasion: z.string().optional(),
  longevity: z.string().optional(),
  sillage: z.string().optional(),
  ingredients: z.string().optional(),
  popularity: z.coerce.number().optional(),
  status: z.enum(['active', 'archived']).optional(),
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(['active', 'hidden']).optional(),
  sortOrder: z.coerce.number().optional(),
  showInNav: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
});

const familySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
});

const orderCreateSchema = z.object({
  guest: z.boolean().optional(),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        qty: z.coerce.number().int().min(1),
      }),
    )
    .min(1),
  shippingAddress: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    area: z.string().min(2),
    notes: z.string().optional(),
  }),
  paymentMethod: z.enum(['Cash on Delivery', 'Online']).default('Cash on Delivery'),
  couponCode: z.string().optional().nullable(),
});

const orderStatusSchema = z.object({
  status: z.enum([
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Returned',
  ]),
  note: z.string().optional(),
});

const paymentStatusSchema = z.object({
  paymentStatus: z.enum(['Pending', 'Paid', 'Failed', 'Refunded']),
});

const couponSchema = z.object({
  code: z.string().min(3),
  type: z.enum(['percent', 'fixed', 'shipping']),
  value: z.coerce.number().min(0),
  usageLimit: z.coerce.number().int().min(1).optional(),
  status: z.enum(['active', 'expired', 'disabled']).optional(),
  expires: z.coerce.date(),
  minSubtotal: z.coerce.number().min(0).optional(),
});

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(2),
  body: z.string().min(5),
  customerName: z.string().optional(),
});

const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  image: z.string().min(1),
  position: z.string().optional(),
  status: z.enum(['active', 'draft']).optional(),
  sortOrder: z.coerce.number().optional(),
});

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5),
});

const newsletterSchema = z.object({
  email: z.string().email(),
});

const orderTrackSchema = z.object({
  orderNumber: z.string().min(3).max(24),
  phone: z.string().min(10).max(20),
});

module.exports = {
  productSchema,
  categorySchema,
  familySchema,
  orderCreateSchema,
  orderStatusSchema,
  paymentStatusSchema,
  couponSchema,
  reviewSchema,
  bannerSchema,
  contactSchema,
  newsletterSchema,
  orderTrackSchema,
};
