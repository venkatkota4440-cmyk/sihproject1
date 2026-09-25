// AgriNex Verification Controller
const otpService = require('../services/otpService');
const aadhaarService = require('../services/aadhaarVerificationService');
const verificationService = require('../services/verificationService');
const db = require('../config/db');

// Request Phone OTP
exports.requestPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const targetPhone = phone || req.user?.phone;
    if (!targetPhone) {
      return res.status(400).json({ success: false, message: 'Valid mobile number is required' });
    }

    const result = otpService.sendPhoneOtp(targetPhone);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Verify Phone OTP
exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const targetPhone = phone || req.user?.phone;
    if (!targetPhone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and 6-digit OTP are required' });
    }

    const result = otpService.verifyPhoneOtp(targetPhone, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Update authenticated user verification record if user is logged in
    let updatedUser = null;
    if (req.user?.id) {
      updatedUser = verificationService.updateUserVerification(req.user.id, {
        phone: targetPhone,
        phoneVerified: true,
        verificationProvider: 'phone_otp',
        verificationReference: `ref_ph_${Date.now()}`
      });
    }

    res.json({
      success: true,
      message: 'Mobile number verified successfully',
      data: {
        verified: true,
        user: updatedUser ? { id: updatedUser.id, verificationStatus: updatedUser.verificationStatus } : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Request Email OTP
exports.requestEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const targetEmail = email || req.user?.email;
    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    const result = otpService.sendEmailOtp(targetEmail);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Verify Email OTP
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const targetEmail = email || req.user?.email;
    if (!targetEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required' });
    }

    const result = otpService.verifyEmailOtp(targetEmail, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    let updatedUser = null;
    if (req.user?.id) {
      updatedUser = verificationService.updateUserVerification(req.user.id, {
        emailVerified: true,
        verificationProvider: 'email_otp',
        verificationReference: `ref_em_${Date.now()}`
      });
    }

    res.json({
      success: true,
      message: 'Email address verified successfully',
      data: {
        verified: true,
        user: updatedUser ? { id: updatedUser.id, verificationStatus: updatedUser.verificationStatus } : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Request Aadhaar Verification Challenge
exports.requestAadhaarVerification = async (req, res) => {
  try {
    // SECURITY: DO NOT store or log the incoming Aadhaar number.
    const { maskedHint } = req.body;
    const result = await aadhaarService.requestVerification(maskedHint || '**** **** 9012');
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify Aadhaar OTP
exports.verifyAadhaarOtp = async (req, res) => {
  try {
    const { referenceId, otp } = req.body;
    if (!referenceId || !otp) {
      return res.status(400).json({ success: false, message: 'Verification reference and OTP are required' });
    }

    const verificationResult = await aadhaarService.verifyOtp(referenceId, otp);
    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    let updatedUser = null;
    if (req.user?.id) {
      updatedUser = verificationService.updateUserVerification(req.user.id, {
        identityVerified: true,
        verificationProvider: verificationResult.data.verificationProvider,
        verificationReference: verificationResult.data.verificationReference
      });
    }

    res.json({
      success: true,
      message: 'Identity verification completed successfully',
      data: {
        verified: true,
        user: updatedUser ? { id: updatedUser.id, verificationStatus: updatedUser.verificationStatus } : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get current user verification status & config
exports.getVerificationStatus = (req, res) => {
  try {
    const config = verificationService.getConfig();
    const user = req.user ? db.findById('users', req.user.id) : null;

    res.json({
      success: true,
      data: {
        config,
        verificationStatus: user ? user.verificationStatus || 'UNVERIFIED' : 'UNVERIFIED',
        phoneVerified: !!user?.phoneVerified,
        emailVerified: !!user?.emailVerified,
        identityVerified: !!user?.identityVerified,
        isFullyVerified: user ? verificationService.isUserFullyVerified(user) : false,
        verifiedAt: user?.verifiedAt || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
