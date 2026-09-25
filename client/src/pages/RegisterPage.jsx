import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sprout,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Sparkles,
  Wheat,
  ShoppingCart
} from 'lucide-react';
import api from '../services/api';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Role Selection: 'FARMER' | 'BUYER'
  const initialRole = searchParams.get('role')?.toUpperCase() === 'BUYER' ? 'BUYER' : 'FARMER';
  const [role, setRole] = useState(initialRole);

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Common Location
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');

  // Farmer Specific Fields
  const [village, setVillage] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('Wheat (Sharbati)');

  // Buyer Specific Fields
  const [businessType, setBusinessType] = useState('Wholesaler / Trader');
  const [interestedCrops, setInterestedCrops] = useState('Basmati Rice, Wheat, Red Onions');

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(null);

  useEffect(() => {
    const r = searchParams.get('role');
    if (r && (r.toUpperCase() === 'BUYER' || r.toUpperCase() === 'FARMER')) {
      setRole(r.toUpperCase());
    }
  }, [searchParams]);

  // Form Validation & Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Validations
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(role === 'FARMER' ? 'Please enter your full name.' : 'Please enter your full name or business name.');
      return;
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (role === 'FARMER') {
      if (!village.trim()) {
        setError('Please enter your village name.');
        return;
      }
      if (!farmLocation.trim()) {
        setError('Please enter your farm location / survey address.');
        return;
      }
      if (!primaryCrop.trim()) {
        setError('Please enter your primary cultivated crop.');
        return;
      }
    } else {
      if (!businessType.trim()) {
        setError('Please select or specify your business type.');
        return;
      }
      if (!interestedCrops.trim()) {
        setError('Please specify the agricultural crops you are interested in procuring.');
        return;
      }
    }

    if (!termsAccepted) {
      setError('You must accept the AgriNex Terms & Conditions to create an account.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        name: fullName.trim(),
        businessName: role === 'BUYER' ? fullName.trim() : undefined,
        mobile: cleanMobile.startsWith('91') && cleanMobile.length === 12 ? `+${cleanMobile}` : `+91 ${cleanMobile.slice(-10)}`,
        phone: cleanMobile.slice(-10),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        role,
        state,
        district,
        termsAccepted: true,
        ...(role === 'FARMER' ? {
          village: village.trim(),
          farmLocation: farmLocation.trim(),
          primaryCrop: primaryCrop.trim()
        } : {
          businessType: businessType.trim(),
          interestedCrops: interestedCrops.split(',').map(c => c.trim()).filter(Boolean)
        })
      };

      const res = await api.post('/auth/register', payload);

      if (res.success) {
        setRegisteredSuccess({
          role,
          name: fullName.trim(),
          email: email.trim(),
          mobile: cleanMobile.slice(-10)
        });
      } else {
        setError(res.message || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. An account with this email or mobile may already exist.');
    } finally {
      setLoading(false);
    }
  };

  // State Options for Indian Agriculture
  const INDIAN_STATES = [
    'Maharashtra', 'Madhya Pradesh', 'Punjab', 'Haryana',
    'Gujarat', 'Rajasthan', 'Karnataka', 'Andhra Pradesh',
    'Telangana', 'Uttar Pradesh', 'Tamil Nadu', 'West Bengal'
  ];

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '720px',
        padding: '44px 38px',
        borderRadius: '28px',
        boxShadow: 'var(--shadow-xl), 0 24px 50px rgba(0, 0, 0, 0.35)',
        border: '1.5px solid var(--border-color)',
        background: 'var(--bg-card)'
      }}>

        {/* 1. Brand Logo & Header */}
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
            fontSize: '2.2rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: 'var(--text-main)',
            margin: '0 0 6px'
          }}>
            Register for Agri<span className="text-gradient">Nex</span>
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
            Smart Agriculture Marketplace • Create your verified {role === 'FARMER' ? 'Farmer' : 'Buyer'} account
          </p>
        </div>

        {/* SUCCESS VIEW: Show clear successful registration message then allow login */}
        {registeredSuccess ? (
          <div style={{
            padding: '36px 24px',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px' }}>
                Account Created Successfully!
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
                Congratulations, <strong>{registeredSuccess.name}</strong>! Your verified{' '}
                <strong style={{ color: '#10b981' }}>{registeredSuccess.role}</strong> account has been registered on the AgriNex National Marketplace.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              padding: '14px 20px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              fontSize: '0.875rem',
              color: 'var(--text-main)',
              width: '100%',
              maxWidth: '420px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registered ID:</span>
                <strong>{registeredSuccess.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registered Mobile:</span>
                <strong>+91 {registeredSuccess.mobile}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '360px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => navigate(`/login?role=${registeredSuccess.role.toLowerCase()}`)}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  padding: '14px'
                }}
              >
                <span>Proceed to {registeredSuccess.role} Login</span>
                <ArrowRight size={18} />
              </button>

              <Link
                to="/welcome"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center' }}
              >
                Return to Welcome Gateway
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* 2. Role Selector Tabs: [ FARMER ] vs [ BUYER ] */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '28px',
              background: 'var(--bg-muted)',
              padding: '6px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => { setRole('FARMER'); setError(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: role === 'FARMER' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'transparent',
                  color: role === 'FARMER' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: role === 'FARMER' ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Wheat size={18} />
                <span>FARMER ACCOUNT</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('BUYER'); setError(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: role === 'BUYER' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
                  color: role === 'BUYER' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: role === 'BUYER' ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <ShoppingCart size={18} />
                <span>BUYER ACCOUNT</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* 3. Registration Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Full Name / Business Name */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                  {role === 'FARMER' ? 'Full Name *' : 'Full Name / Business Name *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder={role === 'FARMER' ? 'e.g. Ramesh Patel' : 'e.g. FreshDirect Agro Procurements'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              {/* Mobile Number & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                    Mobile Number *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98220 12345"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      placeholder="e.g. contact@domain.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                    Password (min. 6 chars) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    Confirm Password *
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
              </div>

              {/* State & District */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="form-select"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nashik / Pune / Indore"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* ROLE-SPECIFIC FIELDS */}
              {role === 'FARMER' ? (
                <>
                  {/* Village & Farm Location */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                        Village *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Niphad Village"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                        Farm Location / Survey No. *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gat No. 142, Dindori Road"
                        value={farmLocation}
                        onChange={(e) => setFarmLocation(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Primary Crop */}
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                      Primary Crop *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sharbati Wheat, Red Onion, Basmati Rice, Soybean"
                      value={primaryCrop}
                      onChange={(e) => setPrimaryCrop(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Business Type */}
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                      Business Type *
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="form-select"
                    >
                      <option value="Wholesaler / Trader">Wholesaler / Mandi Trader</option>
                      <option value="Food Processing Enterprise">Food Processing Enterprise (Flour/Oil/Pulp Mills)</option>
                      <option value="Retail Supermarket Chain">Retail Supermarket Chain</option>
                      <option value="Institutional Buyer">Institutional Buyer (Hotels / Caterers / Govt)</option>
                      <option value="Agricultural Exporter">Agricultural Commodity Exporter</option>
                    </select>
                  </div>

                  {/* Interested Crops */}
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                      Interested Crops for Procurement *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Basmati Rice, Wheat, Red Onion, Tomatoes, Pulses"
                      value={interestedCrops}
                      onChange={(e) => setInterestedCrops(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              {/* Terms & Conditions Checkbox */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
                marginTop: '6px'
              }}>
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ accentColor: '#10b981', width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                />
                <span>
                  I agree to the <strong style={{ color: 'var(--text-main)' }}>AgriNex Terms of Service</strong>, Digital APMC Benchmarking standards, and Escrow Vault settlement guidelines.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  padding: '16px',
                  marginTop: '10px',
                  background: role === 'BUYER' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : undefined
                }}
              >
                <span>
                  {loading
                    ? 'Creating Account...'
                    : role === 'FARMER'
                    ? 'Create Farmer Account'
                    : 'Create Buyer Account'}
                </span>
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            {/* Bottom Navigation */}
            <div style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.875rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Already registered with AgriNex?
              </span>
              <Link
                to={`/login?role=${role.toLowerCase()}`}
                style={{ color: '#10b981', fontWeight: 800, textDecoration: 'none' }}
              >
                Sign in to your account →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
