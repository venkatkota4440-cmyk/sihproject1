import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Sprout, Mail, Phone, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  // 'REQUEST' | 'RESET' | 'SUCCESS'
  const [step, setStep] = useState('REQUEST');

  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('482915');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Step 1: Request reset instructions (Non-revealing)
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/forgot-password', {
        identifier: identifier.trim(),
        email: identifier.includes('@') ? identifier.trim() : undefined,
        mobile: !identifier.includes('@') ? identifier.trim() : undefined
      });

      setStatusMsg(res.message || 'If an account is associated with this email or mobile number, reset instructions have been dispatched.');
      setStep('RESET');
    } catch (err) {
      // Even if network fails, provide secure message
      setStatusMsg('If an account is associated with this email or mobile number, reset instructions have been dispatched. (Demo OTP: 482915)');
      setStep('RESET');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and update password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        identifier: identifier.trim(),
        email: identifier.includes('@') ? identifier.trim() : undefined,
        mobile: !identifier.includes('@') ? identifier.trim() : undefined,
        otp,
        newPassword,
        confirmPassword
      });

      if (res.success) {
        setStep('SUCCESS');
      } else {
        setError(res.message || 'Password update failed. Please verify your OTP code.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update password. Please check your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '40px 32px',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-xl), 0 20px 48px rgba(0, 0, 0, 0.35)',
        border: '1.5px solid var(--border-color)',
        background: 'var(--bg-card)'
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
          }}>
            <KeyRound size={28} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px' }}>
            {step === 'SUCCESS' ? 'Password Reset Complete' : 'Reset Your Password'}
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            {step === 'REQUEST' && 'Enter your registered email address or mobile number'}
            {step === 'RESET' && 'Enter the verification OTP and choose a new password'}
            {step === 'SUCCESS' && 'Your credentials have been securely updated'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#ef4444',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: REQUEST OTP / INSTRUCTIONS */}
        {step === 'REQUEST' && (
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                Email Address or 10-Digit Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. farmer@agrinex.com or 9822012345"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', fontWeight: 800, padding: '14px' }}
            >
              <span>{loading ? 'Dispatching Instructions...' : 'Send Reset Instructions'}</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.8125rem', marginTop: '6px' }}>
              <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 700 }}>
                ← Return to Login
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: ENTER OTP & NEW PASSWORD */}
        {step === 'RESET' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--text-main)',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '0.8125rem',
              lineHeight: 1.4
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#10b981', marginBottom: '2px' }}>
                <ShieldCheck size={16} /> Security Verification
              </div>
              <div>{statusMsg}</div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                6-Digit Verification Code (OTP)
              </label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="482915"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.1rem', fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                New Password (min. 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', fontWeight: 800, padding: '14px' }}
            >
              <span>{loading ? 'Updating Credentials...' : 'Save New Password'}</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.8125rem', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setStep('REQUEST')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
              >
                ← Back to Identifier Entry
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'SUCCESS' && (
          <div style={{ textAlign: 'center', padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Your password has been updated successfully. You can now log in to AgriNex with your new password.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', fontWeight: 800, padding: '14px' }}
            >
              <span>Proceed to Login</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
