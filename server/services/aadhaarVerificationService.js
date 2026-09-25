// AgriNex Aadhaar Verification Service
// Adapter Architecture for Identity Verification
// CRITICAL SECURITY ENFORCEMENT:
// - NEVER store or persist raw Aadhaar numbers.
// - NEVER store Aadhaar OTPs.
// - NEVER log Aadhaar digits to console, disk, or analytics.
// - Only return and persist verification metadata: { verified: true, verificationProvider, verificationReference, verifiedAt }

const crypto = require('crypto');

class AadhaarVerificationService {
  constructor() {
    this.provider = process.env.VERIFICATION_MODE === 'production' ? 'uidai_api' : 'mock';
    // Ephemeral references (expires in 10 minutes, no raw identity stored)
    this.pendingRequests = new Map();
  }

  // Step 1: Initiate Identity Verification Challenge
  // Takes an ephemeral identifier token, generates transaction reference
  async requestVerification(maskedHint = '**** **** 9012') {
    const referenceId = `ref_aadh_${crypto.randomBytes(8).toString('hex')}`;
    
    // Store ONLY reference ID and expiry. DO NOT STORE AADHAAR NUMBER.
    this.pendingRequests.set(referenceId, {
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      expectedOtp: '1234' // Standard demo OTP for mock mode
    });

    return {
      success: true,
      referenceId,
      maskedAadhaarHint: maskedHint,
      message: 'OTP sent to mobile linked with Aadhaar (Demo code: 1234)',
      provider: this.provider,
      expiresInSeconds: 600
    };
  }

  // Step 2: Verify Challenge with OTP
  async verifyOtp(referenceId, otp) {
    if (!referenceId || !otp) {
      return { success: false, message: 'Verification reference and OTP are required' };
    }

    const request = this.pendingRequests.get(referenceId);

    // In mock mode, universal support for 1234 or 123456
    const isMockAccepted = this.provider === 'mock' && (otp.trim() === '1234' || otp.trim() === '123456');

    if (!request && !isMockAccepted) {
      return { success: false, message: 'Verification session expired or invalid. Please retry.' };
    }

    if (request && Date.now() > request.expiresAt) {
      this.pendingRequests.delete(referenceId);
      return { success: false, message: 'Verification session expired. Please retry.' };
    }

    if (request && request.attempts >= 4) {
      this.pendingRequests.delete(referenceId);
      return { success: false, message: 'Too many incorrect attempts. Please initiate a new request.' };
    }

    if (!isMockAccepted && request && request.expectedOtp !== otp.trim()) {
      request.attempts += 1;
      return { success: false, message: 'Invalid OTP code. Please enter the OTP sent to your registered mobile.' };
    }

    // Success! Immediately wipe ephemeral record
    if (referenceId) {
      this.pendingRequests.delete(referenceId);
    }

    // Return sanitized compliance proof
    return {
      success: true,
      data: {
        verified: true,
        verificationProvider: this.provider,
        verificationReference: referenceId || `ref_aadh_${crypto.randomBytes(6).toString('hex')}`,
        verifiedAt: new Date().toISOString(),
        statusMessage: 'Identity verification completed successfully'
      }
    };
  }
}

module.exports = new AadhaarVerificationService();
