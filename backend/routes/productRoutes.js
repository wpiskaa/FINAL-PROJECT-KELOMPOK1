const express = require('express');
const router = express.Router();
const {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
  generateDescription, getCategories, createCategory
} = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../config/auth');

// Category routes (standalone, sesuai ERD)
router.get('/categories', authenticate, getCategories);
router.post('/categories', authenticate, authorizeAdmin, createCategory);

// Product routes
router.get('/', authenticate, getAllProducts);
router.get('/:id', authenticate, getProductById);
router.post('/', authenticate, authorizeAdmin, createProduct);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);
router.post('/:id/generate-description', authenticate, generateDescription);

module.exports = router;
