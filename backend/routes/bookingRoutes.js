const {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    getProviderBookings,
    updateBookingStatus
} = require("../controllers/bookingController");
const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Customer routes
router.get("/", protect, getAllBookings);
router.get("/:id", protect, getBookingById);
router.post("/", protect, createBooking);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);

// Provider routes
router.get("/provider/all", protect, getProviderBookings);
router.put("/provider/:id/status", protect, updateBookingStatus);

module.exports = router;