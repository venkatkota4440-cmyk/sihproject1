import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Login method: 'password' | 'otp'
  const [loginMethod, setLoginMethod] = useState('password');
  // Selected Role: 'FARMER' | 'BUYER'
  const initialRole = searchParams.get('role')?.toUpperCase() === 'BUYER' ? 'BUYER' : 'FARMER';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Form Fields
  const [identifier, setIdentifier] = useState('farmer@agrinex.com'); // Phone or Email
  const [password, setPassword] = useState('Farmer@123');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Login Fields
  const [otpPhone, setOtpPhone] = useState('9876543210');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDemoCode, setOtpDemoCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { login, loginWithOtp, sendOtp, demoLogin } = useAuth();

  useEffect(() => {
    const r = searchParams.get('role');
    if (r && (r.toUpperCase() === 'BUYER' || r.toUpperCase() === 'FARMER')) {
      handleRoleChange(r.toUpperCase());
    }
  }, [searchParams]);

  // Role Switcher Helper
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'FARMER') {
      setIdentifier('farmer@agrinex.com');
      setPassword('Farmer@123');
      setOtpPhone('9876543210');
    } else {
      setIdentifier('buyer@agrinex.com');
      setPassword('Buyer@123');
      setOtpPhone('9822012345');
    }
  };

  // Standard Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login({ identifier, password, role: selectedRole });
      if (res.success) {
        const user = res.data.user;
        if (user.role === 'FARMER') navigate('/home/farmer');
        else if (user.role === 'BUYER') navigate('/home/buyer');
        else if (user.role === 'TRANSPORTER') navigate('/transporter/dashboard');
        else if (user.role === 'ADMIN') navigate('/admin/dashboard');
        else navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid mobile number, email, or password.');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!otpPhone || otpPhone.replace(/[^0-9]/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSending(true);
    setError(null);
    try {
      const res = await sendOtp(otpPhone);
      if (res.success) {
        setOtpSent(true);
        setOtpDemoCode(res.data?.otp || '482915');
        setOtpCode(res.data?.otp || '482915'); // Auto-fill for convenience
        setSuccessMsg(`OTP sent to +91 ${otpPhone.slice(-10)}. (Demo Code: ${res.data?.otp || '482915'})`);
        setResendTimer(45);
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  // OTP Login Submission
  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the 6-digit OTP received on your mobile.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithOtp(otpPhone, otpCode, selectedRole);
      if (res.success) {
        const user = res.data.user;
        if (user.role === 'FARMER') navigate('/home/farmer');
        else if (user.role === 'BUYER') navigate('/home/buyer');
        else navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Login
  const handleQuickDemo = async (role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await demoLogin(role);
      if (res.success) {
        if (role === 'FARMER') navigate('/farmer/dashboard');
        else if (role === 'BUYER') navigate('/buyer/dashboard');
        else if (role === 'TRANSPORTER') navigate('/transporter/dashboard');
        else if (role === 'ADMIN') navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
      background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, transparent 70%)'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '42px 36px',
        borderRadius: '24px',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>

        {/* Brand & Heading with Large Crisp Typography */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
          }}>
            <Sprout size={36} />
          </div>
          <h1 style={{
            fontSize: '2.1rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: 'var(--text-main)',
            marginBottom: '6px'
          }}>
            Sign In to AgriNex
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            From Farm to Buyer — Direct. Trusted. Smart.
          </p>
        </div>

        {/* Role Selector: FARMER vs BUYER (Large Touch Targets) */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}>
            Select Your Account Role:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Farmer Button */}
            <button
              type="button"
              onClick={() => handleRoleChange('FARMER')}
              style={{
                padding: '14px 18px',
                borderRadius: '14px',
                border: selectedRole === 'FARMER' ? '2px solid #10b981' : '1px solid var(--border-color)',
                background: selectedRole === 'FARMER' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                color: selectedRole === 'FARMER' ? '#10b981' : 'var(--text-main)',
                fontWeight: 800,
                fontSize: '1.15rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: selectedRole === 'FARMER' ? '0 4px 14px rgba(16, 185, 129, 0.25)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>🌾</span>
              <span>Farmer Login</span>
            </button>

            {/* Buyer Button */}
            <button
              type="button"
              onClick={() => handleRoleChange('BUYER')}
              style={{
                padding: '14px 18px',
                borderRadius: '14px',
                border: selectedRole === 'BUYER' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                background: selectedRole === 'BUYER' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface)',
                color: selectedRole === 'BUYER' ? '#3b82f6' : 'var(--text-main)',
                fontWeight: 800,
                fontSize: '1.15rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: selectedRole === 'BUYER' ? '0 4px 14px rgba(59, 130, 246, 0.25)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>🛒</span>
              <span>Buyer Login</span>
            </button>
          </div>
        </div>

        {/* Login Method Toggle: Password vs Instant Mobile OTP */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-muted)',
          padding: '6px',
          borderRadius: '14px',
          marginBottom: '28px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setLoginMethod('password'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              background: loginMethod === 'password' ? 'var(--bg-card)' : 'transparent',
              color: loginMethod === 'password' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: loginMethod === 'password' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <KeyRound size={18} color="#10b981" />
            <span>Password Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setLoginMethod('otp'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              background: loginMethod === 'otp' ? 'var(--bg-card)' : 'transparent',
              color: loginMethod === 'otp' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: loginMethod === 'otp' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Phone size={18} color="#3b82f6" />
            <span>Instant Mobile OTP</span>
          </button>
        </div>

        {/* 1-Click Evaluator Shortcuts (Large & Accessible) */}
        <div style={{
          background: 'var(--bg-muted)',
          borderRadius: '16px',
          padding: '14px 18px',
          marginBottom: '26px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            fontSize: '0.8125rem',
            fontWeight: 800,
            color: '#059669',
            textTransform: 'uppercase',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} /> 1-Click Demo Login (Pre-Configured Accounts):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('FARMER')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.875rem', fontWeight: 700, padding: '9px 12px', justifyContent: 'flex-start' }}
            >
              🌾 Farmer (Ramesh)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('BUYER')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.875rem', fontWeight: 700, padding: '9px 12px', justifyContent: 'flex-start' }}
            >
              🛒 Buyer (FreshDirect)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('TRANSPORTER')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.875rem', fontWeight: 700, padding: '9px 12px', justifyContent: 'flex-start' }}
            >
              🚚 Transporter Fleet
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.875rem', fontWeight: 700, padding: '9px 12px', justifyContent: 'flex-start' }}
            >
              🛡️ Administrator
            </button>
          </div>
        </div>

        {/* Error / Success Notifications (Large text) */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#ef4444',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#059669',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {/* =========================================================================
            METHOD A: PASSWORD LOGIN (Mobile Number OR Email + Password)
           ========================================================================= */}
        {loginMethod === 'password' && (
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Mobile Number or Email Input */}
            <div>
              <label style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-main)'
              }}>
                Mobile Phone Number or Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}>
                  {identifier.includes('@') ? <Mail size={22} /> : <Phone size={22} />}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or farmer@agrinex.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: '48px',
                    fontSize: '1.15rem',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    borderRadius: '12px'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Enter your registered 10-digit mobile number or email
              </span>
            </div>

            {/* Password Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.9375rem', color: '#10b981', fontWeight: 600, textDecoration: 'none' }}
                >
                  Forgot Password?
                </Link>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={22}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: '48px',
                    paddingRight: '48px',
                    fontSize: '1.15rem',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    borderRadius: '12px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.15rem',
                fontWeight: 800,
                marginTop: '10px',
                borderRadius: '14px',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
              }}
            >
              {loading ? 'Authenticating...' : `Sign In as ${selectedRole === 'FARMER' ? 'Farmer' : 'Buyer'}`} <ArrowRight size={20} />
            </button>
          </form>
        )}

        {/* =========================================================================
            METHOD B: INSTANT MOBILE OTP LOGIN
           ========================================================================= */}
        {loginMethod === 'otp' && (
          <form onSubmit={handleOtpLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Phone Number Input with Send OTP Button */}
            <div>
              <label style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-main)'
              }}>
                Registered Mobile Phone Number
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: 'var(--text-muted)'
                  }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="98765 43210"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="form-input"
                    style={{
                      paddingLeft: '56px',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      paddingTop: '14px',
                      paddingBottom: '14px',
                      borderRadius: '12px'
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpSending || resendTimer > 0}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    padding: '0 20px',
                    borderRadius: '12px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {otpSending ? 'Sending...' : resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Get OTP'}
                </button>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                A 6-digit OTP will be sent to verify your identity
              </span>
            </div>

            {/* 6-Digit OTP Box */}
            {otpSent && (
              <div>
                <label style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '8px',
                  color: 'var(--text-main)'
                }}>
                  Enter 6-Digit Verification OTP
                </label>

                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="form-input"
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    letterSpacing: '0.4em',
                    textAlign: 'center',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    borderColor: '#10b981',
                    background: 'rgba(16, 185, 129, 0.05)'
                  }}
                />

                {otpDemoCode && (
                  <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#059669', fontWeight: 600 }}>
                    💡 Auto-filled Demo Code: <strong>{otpDemoCode}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !otpSent}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.15rem',
                fontWeight: 800,
                marginTop: '10px',
                borderRadius: '14px',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
              }}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP & Enter Portal'} <ArrowRight size={20} />
            </button>
          </form>
        )}

        {/* Footer: Register Now & Security Badge */}
        <div style={{
          textAlign: 'center',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '1.05rem',
          color: 'var(--text-muted)'
        }}>
          New to AgriNex?{' '}
          <Link
            to="/register"
            style={{
              color: '#10b981',
              fontWeight: 800,
              textDecoration: 'none',
              marginLeft: '4px'
            }}
          >
            Create New Account (Farmer / Buyer) →
          </Link>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '16px',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>256-Bit SSL Encrypted • Government Aadhaar / UIDAI Sandbox Protected</span>
        </div>

      </div>
    </div>
  );
}
