const { connectDB } = require('../config/db');
const { env } = require('../config/env');
const { describeMongoTarget } = require('../utils/mongoTarget');
const AdminUser = require('../models/AdminUser');

async function seedAdmin() {
  await connectDB();
  console.log(`MongoDB target: ${describeMongoTarget(process.env.MONGODB_URI)}`);
  console.log('Catalog left empty — do not run npm run seed:demo against Atlas.');

  const existing = await AdminUser.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${existing.email} (${existing.role})`);
    process.exit(0);
  }

  const admin = await AdminUser.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL.toLowerCase(),
    password: env.ADMIN_PASSWORD,
    role: 'owner',
  });

  console.log('Owner admin created successfully');
  console.log(`Email: ${admin.email}`);
  console.log('Password: (value from ADMIN_PASSWORD in .env)');
  console.log('Admin registration is NOT publicly available — use this seed only.');
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error('Admin seed failed:', error.message);
  process.exit(1);
});
