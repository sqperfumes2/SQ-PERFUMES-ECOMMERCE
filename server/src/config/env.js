const { z } = require('zod');
const dotenv = require('dotenv');

// Never override host-provided vars (Railway). Local .env only fills gaps.
dotenv.config({ override: false });

function clean(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
  return trimmed === '' ? undefined : trimmed;
}

function cleanEnv(source) {
  const next = { ...source };
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') next[key] = clean(value);
  }
  if (!next.NODE_ENV && (source.RAILWAY_ENVIRONMENT || source.RAILWAY_ENVIRONMENT_NAME)) {
    next.NODE_ENV = 'production';
  }
  if (typeof next.NODE_ENV === 'string') {
    next.NODE_ENV = next.NODE_ENV.toLowerCase();
  }
  return next;
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('8h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  CLIENT_URL: z.string().url(),
  ADMIN_URL: z.string().url(),
  ADMIN_NAME: z.string().default('Owner Admin'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default('SQ Perfumes <noreply@sqperfumes.com>'),
});

const parsed = envSchema.safeParse(cleanEnv(process.env));

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

module.exports = { env };
