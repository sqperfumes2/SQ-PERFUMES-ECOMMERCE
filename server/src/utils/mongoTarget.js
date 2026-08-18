function isAtlasUri(uri = '') {
  return /mongodb\+srv:\/\//i.test(uri) || /\.mongodb\.net/i.test(uri);
}

function describeMongoTarget(uri = '') {
  if (isAtlasUri(uri)) return 'Atlas';
  if (/127\.0\.0\.1|localhost/i.test(uri)) return 'local';
  return 'MongoDB';
}

function shouldBlockDemoSeed(uri = '', nodeEnv = 'development') {
  if (process.env.ALLOW_DEMO_SEED === 'true') return false;
  return isAtlasUri(uri) || nodeEnv === 'production';
}

module.exports = { isAtlasUri, describeMongoTarget, shouldBlockDemoSeed };
