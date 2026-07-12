const {
    createProviderProfile,
    getAllProviderProfiles,
    getProviderProfile,
    updateProviderProfile,
    deleteProviderProfile,
    getAllProviderProfilesAdmin,
    updateVerificationStatus
} = require('../controllers/providerController');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.get('/', getAllProviderProfiles);

// Protected
router.get('/profile', protect, getProviderProfile);
router.post('/profile', protect, createProviderProfile);
router.put('/profile', protect, updateProviderProfile);
router.delete('/profile', protect, deleteProviderProfile);

// Admin
router.get('/admin/all', protect, adminMiddleware,  getAllProviderProfilesAdmin);
router.put('/admin/:id/verify', protect, adminMiddleware, updateVerificationStatus);

module.exports = router;