const dns = require('dns');
const mongoose = require('mongoose');
const { env } = require('./env');

// Windows/local DNS sometimes refuses MongoDB SRV lookups; use public resolvers.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  /* ignore */
}

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

module.exports = { connectDB };
