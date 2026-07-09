const express = require("express");
const { createPayment, verifyPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPayment);
router.get("/verify/:tx_ref", verifyPayment);

module.exports = router;