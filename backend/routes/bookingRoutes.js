const express = require("express");
const {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    getProviderBookings,
    updateBookingStatus
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Specific named routes FIRST — before /:id
router.get("/provider/all", protect, getProviderBookings);
router.put("/provider/:id/status", protect, updateBookingStatus);

// Customer routes
router.get("/", protect, getAllBookings);
router.post("/", protect, createBooking);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);

module.exports = router;