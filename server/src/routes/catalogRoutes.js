const express = require('express');
const catalogController = require('../controllers/catalogController');
const { validate } = require('../middleware/validate');
const { productSchema, categorySchema, familySchema } = require('../validators/resourceValidators');
const { protect, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/products', catalogController.getProducts);
router.get('/products/slug/:slug', catalogController.getProductBySlug);
router.get('/categories', optionalAuth, catalogController.listCategories);
router.get('/fragrance-families', catalogController.listFamilies);

router.use('/admin', protect, requireAdmin());

router.get('/admin/products', catalogController.getAdminProducts);
router.get('/admin/products/:id', catalogController.getProductById);
router.post('/admin/products', validate(productSchema), catalogController.createProduct);
router.put('/admin/products/:id', validate(productSchema), catalogController.updateProduct);
router.patch('/admin/products/:id/archive', catalogController.archiveProduct);
router.patch('/admin/products/:id/stock', catalogController.adjustStock);
router.patch('/admin/products/:id/flags', catalogController.patchFlags);
router.patch('/admin/products/:id/sold-out', catalogController.setSoldOut);
router.delete('/admin/products/:id', catalogController.deleteProduct);
router.get('/admin/inventory', catalogController.getInventory);

router.post('/admin/categories', validate(categorySchema), catalogController.upsertCategory);
router.put('/admin/categories/:id', validate(categorySchema), catalogController.upsertCategory);
router.delete('/admin/categories/:id', catalogController.deleteCategory);

router.post('/admin/fragrance-families', validate(familySchema), catalogController.upsertFamily);
router.put('/admin/fragrance-families/:id', validate(familySchema), catalogController.upsertFamily);
router.delete('/admin/fragrance-families/:id', catalogController.deleteFamily);

module.exports = router;
