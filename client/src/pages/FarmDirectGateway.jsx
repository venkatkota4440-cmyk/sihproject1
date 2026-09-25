import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout,
  Shield,
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Store,
  Scale,
  Lock,
  Truck,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function FarmDirectGateway({ onComplete }) {
  const navigate = useNavigate();
  const { demoLogin, user } = useAuth();
  const { currentLanguage, changeLanguage, supportedLanguages, currentLanguageInfo } = useLanguage();

  // Step state: 'SELECT' | 'AADHAR' | 'OTP' | 'TUTORIAL'
  const [step, setStep] = useState('SELECT');
  const [role, setRole] = useState('FARMER'); // 'FARMER' | 'BUYER'
  const [aadharNumber, setAadharNumber] = useState('123456789012');
  const [otp, setOtp] = useState('1234');
  const [tutorialStep, setTutorialStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [error, setError] = useState('');

  // Format Aadhar number as XXXX XXXX XXXX
  const formatAadhar = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join(' ') : raw;
  };

  const handleAadharInput = (e) => {
    const formatted = formatAadhar(e.target.value);
    setAadharNumber(formatted.replace(/\s/g, ''));
  };

  const handleStartRoleLogin = (chosenRole) => {
    setRole(chosenRole);
    setAadharNumber('123456789012');
    setOtp('1234');
    setError('');
    setStep('AADHAR');
  };

  const handleVerifyAadhar = (e) => {
    e.preventDefault();
    if (aadharNumber.length < 12) {
      setError('Please enter a valid 12-digit Aadhar number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
    }, 450);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the 4-digit OTP (demo: 1234)');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await demoLogin(role);
      setLoading(false);
      setTutorialStep(1);
      setStep('TUTORIAL');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed');
    }
  };

  const handleFinishOnboarding = () => {
    sessionStorage.setItem('agrinex_portal_passed', 'true');
    if (onComplete) {
      onComplete();
    } else {
      navigate(role === 'FARMER' ? '/farmer/dashboard' : '/marketplace');
    }
  };

  // Masked display for OTP screen
  const last4 = aadharNumber.slice(-4) || '9012';

  // 5-Step Tutorial Content
  const tutorialContentFarmer = [
    {
      step: 1,
      icon: Users,
      title: 'Welcome, Farmer!',
      desc: 'Connect directly with buyers and eliminate middlemen to get fair prices for your produce.',
      bullets: [
        'No commission fees',
        'Direct buyer contact',
        'Fair pricing guaranteed'
      ]
    },
    {
      step: 2,
      icon: Store,
      title: 'Add Your Produce',
      desc: 'List your crops with photos, quantities, and prices. Our system helps you set competitive rates.',
      bullets: [
        'Easy photo upload',
        'Government price comparison',
        'Negotiable pricing options'
      ]
    },
    {
      step: 3,
      icon: Scale,
      title: 'Direct Price Negotiation',
      desc: 'Counter-offer and negotiate wholesale produce rates directly with verified bulk buyers in real-time.',
      bullets: [
        'Transparent price bidding',
        'Instant counter-offers',
        'Zero broker commissions'
      ]
    },
    {
      step: 4,
      icon: Lock,
      title: '100% Escrow Protection',
      desc: 'Payment is held safely in AgriNex Digital Escrow and released only after delivery verification.',
      bullets: [
        'Milestone fund locking',
        'Verified OTP handshakes',
        'Zero default risk'
      ]
    },
    {
      step: 5,
      icon: Truck,
      title: 'Live GPS Fleet Telematics',
      desc: 'Track refrigerated transport corridors with live temperature logging from farm gate to terminal market.',
      bullets: [
        'Sub-zero cold chain assurance',
        'Real-time geo-fencing alerts',
        'Automated ePOD proof of delivery'
      ]
    }
  ];

  const tutorialContentBuyer = [
    {
      step: 1,
      icon: Users,
      title: 'Welcome, Bulk Buyer!',
      desc: 'Procure farm-fresh crops directly from verified Indian producers at transparent farm-gate pricing.',
      bullets: [
        'Direct farm-gate access',
        'AI quality grading reports',
        'Zero unregulated commissions'
      ]
    },
    {
      step: 2,
      icon: Store,
      title: 'Discover 80+ Crop Catalog',
      desc: 'Explore real-time harvest listings across Cereals, Pulses, Vegetables, and Fruits with verified photos.',
      bullets: [
        '80+ master crop varieties',
        'Live APMC mandi benchmarks',
        'Certified organic filters'
      ]
    },
    {
      step: 3,
      icon: Scale,
      title: 'Post Procurement Tenders',
      desc: 'Broadcast bulk commodity requirements to regional farmer clusters with automated AI matching.',
      bullets: [
        'Custom volume pricing',
        'Automated farmer matching',
        'Real-time counter-bidding'
      ]
    },
    {
      step: 4,
      icon: Lock,
      title: 'Safe Escrow Protection',
      desc: 'Funds remain securely locked in digital escrow until you physically inspect and provide the delivery OTP.',
      bullets: [
        'Bank-grade escrow locking',
        'Physical delivery inspection',
        'Guaranteed dispute resolution'
      ]
    },
    {
      step: 5,
      icon: Truck,
      title: 'Refrigerated GPS Telematics',
      desc: 'Monitor temperature, humidity, and location of your fleet vehicle in real-time until warehouse arrival.',
      bullets: [
        'Live temperature logging',
        'Arrival time forecasting',
        'Instant digital receipts'
      ]
    }
  ];

  const currentTutorial = role === 'FARMER' ? tutorialContentFarmer : tutorialContentBuyer;
  const activeTutorialData = currentTutorial[tutorialStep - 1] || currentTutorial[0];
  const TutorialIcon = activeTutorialData.icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, #00E676 0%, #00C853 45%, #009638 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      overflowY: 'auto',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Left Home/Exit Link */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 30 }}>
        <button
          type="button"
          onClick={handleFinishOnboarding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            color: '#ffffff',
            padding: '7px 14px',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.18s ease'
          }}
          title="Continue to AgriNex Home"
        >
          <span>AgriNex Home →</span>
        </button>
      </div>
      {/* Decorative Translucent Floating Circles */}
      <div style={{
        position: 'absolute',
        top: '12%',
        right: '10%',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.06)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '14%',
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        pointerEvents: 'none'
      }} />

      {/* Top Right Language Selector Badge */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 30 }}>
        <button
          type="button"
          onClick={() => setShowLangMenu(!showLangMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            color: '#ffffff',
            padding: '7px 14px',
            borderRadius: '24px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.18s ease'
          }}
        >
          <Globe size={16} />
          <span>{currentLanguageInfo.nativeName || 'മലയാളം'}</span>
        </button>

        {showLangMenu && (
          <div style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            background: '#ffffff',
            color: '#1e293b',
            borderRadius: '16px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.22)',
            padding: '8px',
            width: '210px',
            maxHeight: '260px',
            overflowY: 'auto',
            zIndex: 40
          }}>
            {supportedLanguages.map(l => (
              <button
                key={l.code}
                onClick={() => {
                  changeLanguage(l.code);
                  setShowLangMenu(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: currentLanguage === l.code ? '#e8f5e9' : 'transparent',
                  color: currentLanguage === l.code ? '#00c853' : '#1e293b',
                  fontWeight: currentLanguage === l.code ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{l.flag} {l.nativeName}</span>
                {currentLanguage === l.code && <Check size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Top Brand Header (Steps 1, 2, 3) */}
      {step !== 'TUTORIAL' && (
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          {/* Seedling Logo Badge */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.22)',
            border: '2.5px solid rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          }}>
            <Sprout size={44} color="#ffffff" strokeWidth={2.4} />
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            FarmDirect
          </h1>
          <p style={{
            fontSize: '1.05rem',
            margin: '4px 0 0',
            color: 'rgba(255, 255, 255, 0.92)',
            fontWeight: 500
          }}>
            Connect Farmers & Buyers
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCREEN 1: MODE SELECTOR (Farmer Login OR Buyer Login)           */}
      {/* ------------------------------------------------------------- */}
      {step === 'SELECT' && (
        <div style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '34px 28px',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          color: '#1e293b',
          zIndex: 10
        }}>
          {/* Farmer Login Button */}
          <button
            type="button"
            onClick={() => handleStartRoleLogin('FARMER')}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              background: '#00C853',
              color: '#ffffff',
              border: 'none',
              fontSize: '1.125rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 8px 20px rgba(0, 200, 83, 0.35)',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Sprout size={22} strokeWidth={2.5} />
            <span>Farmer Login</span>
          </button>

          {/* OR Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '0.9375rem',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            OR
          </div>

          {/* Buyer Login Button */}
          <button
            type="button"
            onClick={() => handleStartRoleLogin('BUYER')}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              background: '#ffffff',
              color: '#00A344',
              border: '2px solid #00C853',
              fontSize: '1.125rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdf4';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Users size={22} strokeWidth={2.4} />
            <span>Buyer Login</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCREEN 2: AADHAR NUMBER INPUT                                 */}
      {/* ------------------------------------------------------------- */}
      {step === 'AADHAR' && (
        <div style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          color: '#1e293b',
          zIndex: 10
        }}>
          {/* Card Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#1e293b'
          }}>
            <Shield size={22} color="#00C853" />
            <span>{role === 'FARMER' ? 'Farmer Login' : 'Buyer Login'}</span>
          </div>

          <form onSubmit={handleVerifyAadhar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#1e293b',
                display: 'block',
                marginBottom: '8px'
              }}>
                Aadhar Number
              </label>
              <input
                type="text"
                autoFocus
                value={formatAadhar(aadharNumber)}
                onChange={handleAadharInput}
                placeholder="Enter your 12-digit Aadhar"
                maxLength={14}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  outline: 'none',
                  letterSpacing: '0.05em'
                }}
              />
              {error && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {error}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: '#00C853',
                color: '#ffffff',
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(0, 200, 83, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <Shield size={18} />
              <span>{loading ? 'Verifying...' : 'Verify Aadhar'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('SELECT')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: '#ffffff',
                color: '#1e293b',
                border: '1.5px solid #e2e8f0',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCREEN 3: ENTER OTP                                           */}
      {/* ------------------------------------------------------------- */}
      {step === 'OTP' && (
        <div style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          color: '#1e293b',
          zIndex: 10
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#1e293b'
            }}>
              <CheckCircle2 size={24} color="#00C853" />
              <span>Enter OTP</span>
            </div>
            <p style={{
              fontSize: '0.85rem',
              color: '#64748b',
              margin: '6px 0 2px'
            }}>
              OTP sent to registered mobile number
            </p>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#00C853' }}>
              Aadhar: ****-****-{last4}
            </span>
          </div>

          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <input
                type="text"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="1234"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#1e293b',
                  textAlign: 'center',
                  outline: 'none',
                  letterSpacing: '0.25em'
                }}
              />
              {error && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block', textAlign: 'center' }}>
                  {error}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: '#00C853',
                color: '#ffffff',
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(0, 200, 83, 0.3)'
              }}
            >
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('AADHAR')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: '#ffffff',
                color: '#1e293b',
                border: '1.5px solid #e2e8f0',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCREEN 4 & 5: MULTI-STEP ONBOARDING TUTORIAL TOUR            */}
      {/* ------------------------------------------------------------- */}
      {step === 'TUTORIAL' && (
        <div style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.18)',
          color: '#1e293b',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 10
        }}>
          {/* Top Title & Skip Tutorial Link */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-0.02em'
            }}>
              Welcome to Direct Market Access
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              margin: '0 0 14px'
            }}>
              Your gateway to transparent farming trade
            </p>

            <button
              type="button"
              onClick={handleFinishOnboarding}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Skip Tutorial
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#64748b',
              marginBottom: '6px'
            }}>
              <span>Step {tutorialStep} of 5</span>
              <span>{tutorialStep * 20}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#e2e8f0',
              borderRadius: '999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${tutorialStep * 20}%`,
                height: '100%',
                background: '#00C853',
                borderRadius: '999px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Central Highlighted Step Content */}
          <div style={{
            textAlign: 'center',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Green Icon Circle */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#00C853',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(0, 200, 83, 0.3)'
            }}>
              <TutorialIcon size={34} strokeWidth={2.4} />
            </div>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '6px 0 0'
            }}>
              {activeTutorialData.title}
            </h3>

            <p style={{
              fontSize: '0.9rem',
              color: '#475569',
              lineHeight: 1.5,
              maxWidth: '420px',
              margin: '0 auto'
            }}>
              {activeTutorialData.desc}
            </p>

            {/* Checkmark Bullets in Soft Green Box */}
            <div style={{
              width: '100%',
              background: '#f0fdf4',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '8px',
              textAlign: 'left'
            }}>
              {activeTutorialData.bullets.map((b, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#166534'
                }}>
                  <Check size={16} color="#00C853" strokeWidth={3} />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls: Previous, Dots, Next */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px'
          }}>
            <button
              type="button"
              disabled={tutorialStep === 1}
              onClick={() => setTutorialStep(prev => Math.max(1, prev - 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 16px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: tutorialStep === 1 ? '#cbd5e1' : '#1e293b',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: tutorialStep === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {/* 5 Pagination Dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(stepNum => (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => setTutorialStep(stepNum)}
                  style={{
                    width: stepNum === tutorialStep ? '18px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: stepNum === tutorialStep ? '#00C853' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    padding: 0
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (tutorialStep < 5) {
                  setTutorialStep(prev => prev + 1);
                } else {
                  handleFinishOnboarding();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 20px',
                borderRadius: '12px',
                background: '#00C853',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 200, 83, 0.35)'
              }}
            >
              <span>{tutorialStep === 5 ? 'Get Started' : 'Next'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Demo Notes & Government Badge (Steps 1, 2, 3) */}
      {step !== 'TUTORIAL' && (
        <div style={{
          marginTop: '28px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10
        }}>
          <p style={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            fontWeight: 500
          }}>
            Demo App: Use any 12-digit Aadhar number and OTP: 1234
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.16)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '16px',
            padding: '10px 22px',
            fontSize: '0.8125rem',
            color: '#ffffff',
            maxWidth: '380px',
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Secure Aadhar Login</div>
            <div style={{ opacity: 0.9 }}>Government verified authentication for all users</div>
          </div>

          {/* Quick link to bypass and explore Home directly */}
          <button
            type="button"
            onClick={handleFinishOnboarding}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              marginTop: '4px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Or Browse Home Page as Guest →
          </button>
        </div>
      )}
    </div>
  );
}
