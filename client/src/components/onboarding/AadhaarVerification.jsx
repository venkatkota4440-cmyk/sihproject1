import React, { useState } from 'react';
import verificationService from '../../services/verificationService';
import { Shield, ShieldCheck, CheckCircle2, ChevronLeft, Lock } from 'lucide-react';

export default function AadhaarVerification({ onVerified, onBack }) {
  const [step, setStep] = useState('NUMBER'); // 'NUMBER' | 'OTP'
  const [rawNumber, setRawNumber] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [maskedHint, setMaskedHint] = useState('');
  const [otp, setOtp] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Format with space grouping
  const formatInput = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join(' ') : raw;
  };

  const handleNumberInput = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 12);
    setRawNumber(digitsOnly);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (rawNumber.length < 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // SECURITY: Mask before sending; do not persist raw Aadhaar digits!
      const last4 = rawNumber.slice(-4);
      const hint = `**** **** ${last4}`;
      setMaskedHint(hint);

      const res = await verificationService.requestAadhaarVerification(hint);
      setLoading(false);

      if (res.success) {
        setReferenceId(res.referenceId);
        // Wipe raw digits from state immediately for privacy compliance
        setRawNumber('');
        setStep('OTP');
      } else {
        setError(res.message || 'Verification challenge failed');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error communicating with verification adapter');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the 4-digit demo verification OTP (1234)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verificationService.verifyAadhaarOtp(referenceId, otp);
      setLoading(false);

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onVerified) onVerified(res.data);
        }, 1200);
      } else {
        setError(res.message || 'Invalid OTP code');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to verify OTP');
    }
  };

  return (
    <div style={{
      maxWidth: '520px',
      margin: '0 auto',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '28px',
      padding: '38px 32px',
      boxShadow: 'var(--shadow-xl)',
      textAlign: 'center'
    }}>
      {onBack && step === 'NUMBER' && (
        <div style={{ textAlign: 'left', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>
        </div>
      )}

      {/* Security Privacy Notice */}
      <div style={{
        width: '68px',
        height: '68px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.12)',
        color: '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        {success ? <CheckCircle2 size={36} color="#10b981" /> : <Shield size={32} />}
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px' }}>
        {step === 'NUMBER' ? 'Aadhaar Identity Verification' : 'Verify Aadhaar OTP'}
      </h2>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
        {step === 'NUMBER'
          ? 'Adapter verification mode. Zero-knowledge authentication: your raw identity number is never stored.'
          : `Enter the OTP sent to mobile linked with ${maskedHint}`}
      </p>

      {/* Demo Mode Notice */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        padding: '8px 14px',
        fontSize: '0.8125rem',
        color: '#10b981',
        fontWeight: 600,
        marginBottom: '20px'
      }}>
        💡 Demo Verification Adapter: Use any 12-digit number and OTP: <strong>1234</strong>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          fontSize: '0.8125rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '14px',
          borderRadius: '16px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          fontSize: '0.95rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <CheckCircle2 size={20} />
          <span>Identity verification completed</span>
        </div>
      )}

      {step === 'NUMBER' && !success && (
        <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700, textAlign: 'left', display: 'block' }}>
              Aadhaar Number (12 Digits)
            </label>
            <input
              type="text"
              autoFocus
              value={formatInput(rawNumber)}
              onChange={handleNumberInput}
              placeholder="XXXX XXXX XXXX"
              maxLength={14}
              className="form-control"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                textAlign: 'center',
                letterSpacing: '0.12em',
                padding: '14px'
              }}
            />
          </div>

          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <Lock size={12} color="#10b981" />
            <span>Encrypted zero-storage protocol</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{
              padding: '14px',
              fontSize: '1.05rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Requesting OTP...' : 'Request Aadhaar OTP'}</span>
          </button>
        </form>
      )}

      {step === 'OTP' && !success && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
              4-Digit Aadhaar OTP Code
            </label>
            <input
              type="text"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              className="form-control"
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: '0.3em',
                padding: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setStep('NUMBER')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '12px', fontWeight: 700 }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 2, padding: '12px', fontWeight: 800 }}
            >
              {loading ? 'Verifying...' : 'Complete Verification'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
