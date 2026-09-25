// AgriNex Master Verification Orchestrator
const db = require('../config/db');

class VerificationService {
  getConfig() {
    return {
      mode: process.env.VERIFICATION_MODE || 'mock',
      requirePhone: process.env.REQUIRE_PHONE_VERIFICATION !== 'false',
      requireEmail: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
      requireAadhaar: process.env.REQUIRE_AADHAAR_VERIFICATION === 'true'
    };
  }

  isUserFullyVerified(user) {
    if (!user) return false;
    const config = this.getConfig();

    if (config.requirePhone && !user.phoneVerified) return false;
    if (config.requireEmail && !user.emailVerified) return false;
    if (config.requireAadhaar && !user.identityVerified) return false;

    return true;
  }

  calculateStatus(user) {
    if (!user) return 'UNVERIFIED';
    const config = this.getConfig();

    const phoneOk = !config.requirePhone || user.phoneVerified;
    const emailOk = !config.requireEmail || user.emailVerified;
    const aadhaarOk = !config.requireAadhaar || user.identityVerified;

    if (phoneOk && emailOk && aadhaarOk) {
      return 'VERIFIED';
    }

    if (user.phoneVerified || user.emailVerified || user.identityVerified) {
      return 'PENDING';
    }

    return 'UNVERIFIED';
  }

  updateUserVerification(userId, updates = {}) {
    const user = db.findById('users', userId);
    if (!user) return null;

    const merged = {
      ...user,
      ...updates
    };

    merged.verificationStatus = this.calculateStatus(merged);
    merged.isVerified = merged.verificationStatus === 'VERIFIED';

    if (merged.isVerified && !merged.verifiedAt) {
      merged.verifiedAt = new Date().toISOString();
    }

    return db.update('users', userId, merged);
  }
}

module.exports = new VerificationService();
