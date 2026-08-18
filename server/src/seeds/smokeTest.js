const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('./smokeRequest');

async function main() {
  const mongod = await MongoMemoryServer.create();

  process.env.NODE_ENV = 'development';
  process.env.PORT = '5000';
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_ACCESS_SECRET = 'test_access_secret_32_characters!!';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_characters!';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.COOKIE_SECURE = 'false';
  process.env.CLIENT_URL = 'http://localhost:5173';
  process.env.ADMIN_URL = 'http://localhost:5174';
  process.env.ADMIN_NAME = 'Owner Admin';
  process.env.ADMIN_EMAIL = 'owner@sqperfumes.com';
  process.env.ADMIN_PASSWORD = 'ChangeMeStrongPass123!';

  Object.keys(require.cache).forEach((key) => {
    if (key.includes(`${path.sep}src${path.sep}`)) delete require.cache[key];
  });

  await mongoose.connect(process.env.MONGODB_URI);

  const AdminUser = require('../models/AdminUser');
  await AdminUser.create({
    name: 'Owner Admin',
    email: 'owner@sqperfumes.com',
    password: 'ChangeMeStrongPass123!',
    role: 'owner',
  });

  const app = require('../app');
  const server = app.listen(0);
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  const health = await request(`${base}/api/health`);
  if (!health.json.success) throw new Error('Health check failed');

  const login = await request(`${base}/api/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@sqperfumes.com',
      password: 'ChangeMeStrongPass123!',
    }),
  });
  if (!login.json.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(login.json)}`);
  }

  const products = await request(`${base}/api/products`);
  if (!products.json.success) throw new Error('Products list failed');

  console.log('Smoke test passed:');
  console.log('- GET /api/health');
  console.log('- POST /api/auth/admin/login');
  console.log('- GET /api/products');

  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

main().catch(async (error) => {
  console.error('Smoke test failed:', error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
