const express = require('express');
const router = express.Router();
const { optionalAuthenticate, authenticate } = require('../middleware/auth');
const verificationCtrl = require('../controllers/verificationController');

router.post('/phone/request', optionalAuthenticate, verificationCtrl.requestPhoneOtp);
router.post('/phone/verify', optionalAuthenticate, verificationCtrl.verifyPhoneOtp);

router.post('/email/request', optionalAuthenticate, verificationCtrl.requestEmailOtp);
router.post('/email/verify', optionalAuthenticate, verificationCtrl.verifyEmailOtp);

router.post('/aadhaar/request', optionalAuthenticate, verificationCtrl.requestAadhaarVerification);
router.post('/aadhaar/verify', optionalAuthenticate, verificationCtrl.verifyAadhaarOtp);

router.get('/status', optionalAuthenticate, verificationCtrl.getVerificationStatus);


module.exports = router;
