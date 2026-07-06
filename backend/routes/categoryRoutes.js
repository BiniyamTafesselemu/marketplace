const { getAllCategories, createCategory, updateCategory, deleteCategory, getCategoryById } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

const express = require('express');
const router = express.Router();

router.get('/', getAllCategories);
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);
router.get('/:id', getCategoryById);

module.exports = router;