const app = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');

async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
    console.log(`Health check: http://localhost:${env.PORT}/api/health`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
