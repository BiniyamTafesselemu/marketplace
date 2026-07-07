const review = require("../models/Review");

async function getAllReviews(req, res) {
    try {
        const reviews = await review.findAll();
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
}

async function getReviewById(req, res) {
    try {
        const { id } = req.params;
        const reviewFound = await review.findByPk(id);

        if (!reviewFound) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json(reviewFound);
    } catch (error) {
        res.status(500).json({ message: "Error fetching review" });
    }
}

async function createReview(req, res) {
    try {
        const { booking_id, rating, comment } = req.body;
        const newReview = await review.create({ booking_id, rating, comment, customer_id: req.user.id  });
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: "Error creating review" });
    }
}

async function updateReview(req, res) {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const reviewToUpdate = await review.findByPk(id);

       
        if (!reviewToUpdate) {
            return res.status(404).json({ message: "Review not found" });
        }
         if (reviewToUpdate.customer_id!== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        reviewToUpdate.rating = rating || reviewToUpdate.rating;
        reviewToUpdate.comment = comment || reviewToUpdate.comment;

        await reviewToUpdate.save();
        res.status(200).json(reviewToUpdate);
    } catch (error) {
        res.status(500).json({ message: "Error updating review" });
    }
}

async function deleteReview(req, res) {
    try {
        const { id } = req.params;
        const reviewToDelete = await review.findByPk(id);

        

        if (!reviewToDelete) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (reviewToDelete.customer_id!== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await reviewToDelete.destroy();
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting review" });
    }
}

module.exports = {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
};