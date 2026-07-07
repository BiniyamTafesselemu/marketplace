const { createProviderProfile, getAllProviderProfiles, getProviderProfile, updateProviderProfile, deleteProviderProfile } = require('../controllers/providerController');
const express = require('express');
const { protect } = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/', getAllProviderProfiles);
router.get('/profile', protect, getProviderProfile);
router.post('/profile', protect, createProviderProfile);
router.put('/profile', protect, updateProviderProfile);
router.delete('/profile', protect, deleteProviderProfile);

module.exports = router;