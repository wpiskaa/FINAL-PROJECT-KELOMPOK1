const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authenticate, authorizeAdmin } = require('../config/auth');

// Endpoint Kategori (/api/categories)
router.get('/', authenticate, getAllCategories);
router.get('/:id', authenticate, getCategoryById);
router.post('/', authenticate, authorizeAdmin, createCategory);
router.put('/:id', authenticate, authorizeAdmin, updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

module.exports = router;
