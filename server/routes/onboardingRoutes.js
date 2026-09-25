const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const onboardingCtrl = require('../controllers/onboardingController');

router.post('/complete', authenticate, onboardingCtrl.completeOnboarding);
router.post('/tour-status', authenticate, onboardingCtrl.updateTourStatus);
router.get('/state', authenticate, onboardingCtrl.getOnboardingState);

module.exports = router;
