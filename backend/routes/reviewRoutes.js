const { getAllReviews, getReviewById, createReview, deleteReview } = require("../controllers/reviewController")
const express = require('express')

const router = express.Router()

router.get('/', getAllReviews);
router.post('/')
