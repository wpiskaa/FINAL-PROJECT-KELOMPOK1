const express = require('express');
const router = express.Router();
const {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
  generateDescription, getCategories
} = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../config/auth');

router.get('/', authenticate, getAllProducts);
router.get('/categories', authenticate, getCategories);
router.get('/:id', authenticate, getProductById);
router.post('/', authenticate, authorizeAdmin, createProduct);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);
router.post('/:id/generate-description', authenticate, generateDescription);

module.exports = router;
