const { getAllReviews, getReviewById, createReview, updateReview, deleteReview } = require("../controllers/reviewController");
const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;