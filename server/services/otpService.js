// AgriNex OTP Service
// Secure generation, throttling, expiration, and verification for Phone and Email OTPs

const crypto = require('crypto');

class OtpService {
  constructor() {
    // In-memory OTP cache: key -> { code, expiresAt, attempts, createdAt }
    this.otpStore = new Map();
    // Expiry in ms (5 minutes)
    this.OTP_EXPIRY_MS = 5 * 60 * 1000;
    this.MAX_ATTEMPTS = 5;
    this.MOCK_OTP = '123456';
  }

  _getKey(type, identifier) {
    return `${type}:${identifier.trim().toLowerCase()}`;
  }

  generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
  }

  sendPhoneOtp(phone) {
    if (!phone || phone.length < 10) {
      throw new Error('Valid 10-digit mobile number is required');
    }

    const key = this._getKey('phone', phone);
    const code = process.env.VERIFICATION_MODE === 'mock' ? this.MOCK_OTP : this.generateOtp();
    
    this.otpStore.set(key, {
      code,
      expiresAt: Date.now() + this.OTP_EXPIRY_MS,
      attempts: 0,
      createdAt: Date.now()
    });

    return {
      success: true,
      message: 'Verification OTP sent to mobile number',
      expiresInSeconds: 300,
      isMock: process.env.VERIFICATION_MODE === 'mock',
      demoOtpHint: process.env.VERIFICATION_MODE === 'mock' ? '123456' : undefined
    };
  }

  verifyPhoneOtp(phone, inputOtp) {
    if (!phone || !inputOtp) {
      return { success: false, message: 'Phone number and OTP are required' };
    }

    const key = this._getKey('phone', phone);
    const record = this.otpStore.get(key);

    // In mock mode, also accept universal demo OTP 123456 or 1234
    if (process.env.VERIFICATION_MODE === 'mock' && (inputOtp === '123456' || inputOtp === '1234')) {
      this.otpStore.delete(key);
      return { success: true, message: 'Phone number verified successfully (Mock Mode)' };
    }

    if (!record) {
      return { success: false, message: 'No active OTP request found. Please request a new OTP.' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(key);
      return { success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
    }

    record.attempts += 1;

    if (record.code !== inputOtp.trim()) {
      return {
        success: false,
        message: `Invalid OTP code. ${this.MAX_ATTEMPTS - record.attempts} attempts remaining.`
      };
    }

    // Success - consume OTP
    this.otpStore.delete(key);
    return { success: true, message: 'Phone number verified successfully' };
  }

  sendEmailOtp(email) {
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required');
    }

    const key = this._getKey('email', email);
    const code = process.env.VERIFICATION_MODE === 'mock' ? this.MOCK_OTP : this.generateOtp();

    this.otpStore.set(key, {
      code,
      expiresAt: Date.now() + this.OTP_EXPIRY_MS,
      attempts: 0,
      createdAt: Date.now()
    });

    return {
      success: true,
      message: 'Verification code sent to email',
      expiresInSeconds: 300,
      isMock: process.env.VERIFICATION_MODE === 'mock',
      demoOtpHint: process.env.VERIFICATION_MODE === 'mock' ? '123456' : undefined
    };
  }

  verifyEmailOtp(email, inputOtp) {
    if (!email || !inputOtp) {
      return { success: false, message: 'Email and verification code are required' };
    }

    const key = this._getKey('email', email);
    const record = this.otpStore.get(key);

    if (process.env.VERIFICATION_MODE === 'mock' && (inputOtp === '123456' || inputOtp === '1234')) {
      this.otpStore.delete(key);
      return { success: true, message: 'Email verified successfully (Mock Mode)' };
    }

    if (!record) {
      return { success: false, message: 'No active verification code found for this email.' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      return { success: false, message: 'Verification code has expired. Please request a new code.' };
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(key);
      return { success: false, message: 'Maximum verification attempts exceeded. Please request a new code.' };
    }

    record.attempts += 1;

    if (record.code !== inputOtp.trim()) {
      return {
        success: false,
        message: `Invalid code. ${this.MAX_ATTEMPTS - record.attempts} attempts remaining.`
      };
    }

    this.otpStore.delete(key);
    return { success: true, message: 'Email verified successfully' };
  }
}

module.exports = new OtpService();
