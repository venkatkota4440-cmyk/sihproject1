import api from './api';

export const verificationService = {
  getStatus: () => api.get('/verification/status'),
  requestPhoneOtp: (phone) => api.post('/verification/phone/request', { phone }),
  verifyPhoneOtp: (phone, otp) => api.post('/verification/phone/verify', { phone, otp }),
  requestEmailOtp: (email) => api.post('/verification/email/request', { email }),
  verifyEmailOtp: (email, otp) => api.post('/verification/email/verify', { email, otp }),
  requestAadhaarVerification: (maskedHint) => api.post('/verification/aadhaar/request', { maskedHint }),
  verifyAadhaarOtp: (referenceId, otp) => api.post('/verification/aadhaar/verify', { referenceId, otp })
};

export default verificationService;
