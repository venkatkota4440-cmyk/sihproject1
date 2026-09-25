import React, { useState, useEffect } from 'react';
import verificationService from '../../services/verificationService';
import { Phone, ShieldCheck, RefreshCw, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function PhoneVerification({ initialPhone = '', onVerified, onBack }) {
  const [phone, setPhone] = useState(initialPhone || '9876543210');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`phone-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`phone-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setLoading(true);
    try {
      const res = await verificationService.requestPhoneOtp(phone);
      setLoading(false);
      if (res.success) {
        setTimer(45);
        setCanResend(false);
        setSuccessMsg('New 6-digit OTP sent to your mobile number');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(res.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error requesting OTP');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit verification OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verificationService.verifyPhoneOtp(phone, fullOtp);
      setLoading(false);
      if (res.success) {
        if (onVerified) onVerified(phone);
      } else {
        setError(res.message || 'Invalid verification code');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to verify code');
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
      {onBack && (
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

      {/* Icon Badge */}
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
        <Phone size={32} />
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px' }}>
        Enter Phone OTP
      </h2>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 8px' }}>
        6-digit verification code sent to
      </p>

      {/* Phone number display & edit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '22px' }}>
        {isEditingPhone ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-control"
              style={{ width: '150px', padding: '6px 10px', fontSize: '0.9rem', textAlign: 'center' }}
            />
            <button
              type="button"
              onClick={() => setIsEditingPhone(false)}
              className="btn btn-primary btn-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', letterSpacing: '0.05em' }}>
              +91 {phone}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingPhone(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#10b981',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Demo helper pill */}
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
        💡 Demo Mode: Enter <strong>123456</strong> to verify instantly
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

      {successMsg && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          fontSize: '0.8125rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleVerify}>
        {/* 6 Digit Inputs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`phone-otp-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              style={{
                width: '46px',
                height: '54px',
                borderRadius: '14px',
                border: '2px solid var(--border-color)',
                background: 'var(--bg-surface)',
                fontSize: '1.4rem',
                fontWeight: 800,
                textAlign: 'center',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'all 0.18s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
            />
          ))}
        </div>

        {/* Resend and Countdown */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Didn't receive code?
          </span>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: '#10b981',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={14} /> Resend OTP
            </button>
          ) : (
            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
              Resend in {timer}s
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
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
          <span>{loading ? 'Verifying Phone...' : 'Verify & Continue'}</span>
        </button>
      </form>
    </div>
  );
}
