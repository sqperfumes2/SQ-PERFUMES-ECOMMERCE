const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');
const { cloudinary, configureCloudinary } = require('../config/cloudinary');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const SLOT_FOLDERS = {
  hero: 'sq-perfumes/hero',
  him: 'sq-perfumes/category-him',
  her: 'sq-perfumes/category-her',
  unisex: 'sq-perfumes/category-unisex',
  product: 'sq-perfumes/product',
  promo: 'sq-perfumes/promo',
};

const CLOUDINARY_REQUIRED_SLOTS = new Set(['hero', 'him', 'her', 'unisex']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new ApiError(400, 'Only JPG, PNG, WebP, or GIF images are allowed'));
    }
    return cb(null, true);
  },
});

function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function extensionFor(mimetype) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return map[mimetype] || '.jpg';
}

function resolveFolder(slot) {
  return SLOT_FOLDERS[slot] || SLOT_FOLDERS.product;
}

function uploadBufferToCloudinary(buffer, folder = 'sq-perfumes') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(new ApiError(500, 'Image upload failed'));
        return resolve(result);
      },
    );
    stream.end(buffer);
  });
}

function saveLocalImage(file) {
  ensureUploadDir();
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extensionFor(file.mimetype)}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, file.buffer);
  return {
    filename,
    relativePath: `/uploads/products/${filename}`,
  };
}

/**
 * @param {object} file multer file
 * @param {string} publicBaseUrl
 * @param {{ slot?: string, requireCloudinary?: boolean }} options
 */
async function saveUploadedImage(file, publicBaseUrl, options = {}) {
  if (!file?.buffer) {
    throw new ApiError(400, 'No image file provided');
  }

  const slot = options.slot || 'product';
  const requireCloudinary =
    options.requireCloudinary === true ||
    CLOUDINARY_REQUIRED_SLOTS.has(slot) ||
    env.NODE_ENV === 'production';
  const folder = resolveFolder(slot);

  const configured = configureCloudinary();
  if (configured) {
    const result = await uploadBufferToCloudinary(file.buffer, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      storage: 'cloudinary',
      slot,
    };
  }

  if (requireCloudinary) {
    throw new ApiError(
      503,
      'Cloudinary is not configured on the API. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Railway Variables, then redeploy. Product photos cannot be stored on the server disk in production.',
    );
  }

  const saved = saveLocalImage(file);
  const base = String(publicBaseUrl || '').replace(/\/$/, '');
  return {
    url: `${base}${saved.relativePath}`,
    publicId: saved.filename,
    storage: 'local',
    slot,
  };
}

module.exports = {
  upload,
  uploadBufferToCloudinary,
  saveUploadedImage,
  SLOT_FOLDERS,
  UPLOAD_DIR,
};
