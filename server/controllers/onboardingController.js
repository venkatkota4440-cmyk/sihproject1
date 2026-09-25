// AgriNex Onboarding Controller
const db = require('../config/db');
const verificationService = require('../services/verificationService');

// Complete Onboarding & Save Role-Specific Details
exports.completeOnboarding = (req, res) => {
  try {
    const userId = req.user.id;
    const { farmInfo, businessInfo, location, preferredLanguage, preferredVoice } = req.body;

    const updates = {
      onboardingCompleted: true,
      updatedAt: new Date().toISOString()
    };

    if (farmInfo) updates.farmInfo = farmInfo;
    if (businessInfo) updates.businessInfo = businessInfo;
    if (location) updates.location = location;
    if (preferredLanguage) updates.preferredLanguage = preferredLanguage;
    if (preferredVoice) updates.preferredVoice = preferredVoice;

    const updated = db.update('users', userId, updates);
    const { password: _, ...userSafe } = updated;

    res.json({
      success: true,
      message: 'Onboarding profile saved successfully',
      data: userSafe
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Guided Tour Completion / Skip status
exports.updateTourStatus = (req, res) => {
  try {
    const userId = req.user.id;
    const { completed, skipped, preferredLanguage, preferredVoice, speechRate } = req.body;

    const updates = {
      tourCompleted: !!completed,
      tourSkipped: !!skipped,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString()
    };

    if (preferredLanguage) updates.preferredLanguage = preferredLanguage;
    if (preferredVoice) updates.preferredVoice = preferredVoice;
    if (speechRate) updates.speechRate = speechRate;

    const updated = db.update('users', userId, updates);
    const { password: _, ...userSafe } = updated;

    res.json({
      success: true,
      message: 'Tour preferences updated',
      data: userSafe
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Full Onboarding State
exports.getOnboardingState = (req, res) => {
  try {
    const user = db.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isVerified = verificationService.isUserFullyVerified(user);

    res.json({
      success: true,
      data: {
        userId: user.id,
        role: user.role,
        isVerified,
        verificationStatus: user.verificationStatus || 'UNVERIFIED',
        onboardingCompleted: !!user.onboardingCompleted,
        tourCompleted: !!user.tourCompleted,
        tourSkipped: !!user.tourSkipped,
        preferredLanguage: user.preferredLanguage || 'en-IN',
        preferredVoice: user.preferredVoice || null,
        needsVerification: !isVerified,
        needsTour: !user.tourCompleted && !user.tourSkipped
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
