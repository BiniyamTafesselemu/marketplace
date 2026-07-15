const express = require("express");
const {
    getAllServices,
    getMyServices,
    addService,
    updateService,
    deleteService,
    getAllServicesAdmin,
    updateServiceStatus
} = require("../controllers/providerServiceController");
const { protect } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const router = express.Router();

// Public
router.get("/", getAllServices);

// Protected
router.get("/my", protect, getMyServices);
router.post("/", protect, addService);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

// Admin
router.get("/admin/all", protect, adminMiddleware, getAllServicesAdmin);
router.put("/admin/:id/status", protect, adminMiddleware, updateServiceStatus);

module.exports = router;