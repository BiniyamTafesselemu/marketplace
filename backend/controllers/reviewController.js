const { Review, Booking } = require("../models");

async function getAllReviews(req, res) {
    try {
        const reviews = await Review.findAll();
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
}

async function getReviewsByProvider(req, res) {
    try {
        const { provider_id } = req.params;
        const reviews = await Review.findAll({
            where: { provider_id: Number(provider_id) },
            order: [["createdAt", "DESC"]]
        });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
}

async function getReviewById(req, res) {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);
        if (!review) return res.status(404).json({ message: "Review not found" });
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: "Error fetching review" });
    }
}

async function createReview(req, res) {
    try {
        const { booking_id, rating, comment } = req.body;

        if (!booking_id || !rating) {
            return res.status(400).json({ message: "booking_id and rating are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Check booking exists and belongs to this customer
        const booking = await Booking.findByPk(booking_id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.customer_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });
        if (booking.status !== "completed") return res.status(400).json({ message: "You can only review completed bookings" });

        // Check not already reviewed
        const existing = await Review.findOne({ where: { booking_id, customer_id: req.user.id } });
        if (existing) return res.status(400).json({ message: "You already reviewed this booking" });

        const newReview = await Review.create({
            booking_id,
            rating,
            comment,
            customer_id: req.user.id,
            provider_id: booking.provider_id
        });

        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: "Error creating review", error: error.message });
    }
}

async function updateReview(req, res) {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const review = await Review.findByPk(id);

        if (!review) return res.status(404).json({ message: "Review not found" });
        if (review.customer_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });

        if (rating) {
            if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });
            review.rating = rating;
        }
        if (comment !== undefined) review.comment = comment;

        await review.save();
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: "Error updating review" });
    }
}

async function deleteReview(req, res) {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) return res.status(404).json({ message: "Review not found" });
        if (review.customer_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });

        await review.destroy();
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting review" });
    }
}

module.exports = {
    getAllReviews,
    getReviewsByProvider,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
};