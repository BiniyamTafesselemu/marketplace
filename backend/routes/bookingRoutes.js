const { getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking } = require("../controllers/bookingController");
const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getAllBookings);
router.get("/:id", protect, getBookingById);
router.post("/", protect, createBooking);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);

module.exports = router;