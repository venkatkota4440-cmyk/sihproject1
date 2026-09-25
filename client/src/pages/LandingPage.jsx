import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThreeDHero from '../components/three/ThreeDHero';
import CropCard from '../components/marketplace/CropCard';
import OfferModal from '../components/negotiation/OfferModal';
import CropScanner from '../components/ai/CropScanner';
import DeliveryTrackerMap from '../components/map/DeliveryTrackerMap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  ScanLine,
  Truck,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  ChevronDown,
  DollarSign,
  Star,
  Volume2,
  VolumeX,
  X,
  Lock,
  CreditCard,
  QrCode,
  ShoppingCart,
  LogOut,
  Bell,
  Search,
  Building2,
  Layers,
  Wheat,
  UserCheck
} from 'lucide-react';

import AuthGatewayScreen from './AuthGatewayScreen';
import FarmDirectGateway from './FarmDirectGateway';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';

export default function LandingPage({ forcedRole }) {
  const { demoLogin, user, logout } = useAuth();
  const { t, speak, isSpeaking, stopSpeaking, currentLanguageInfo } = useLanguage();
  const navigate = useNavigate();

  const [showRoleNotifsModal, setShowRoleNotifsModal] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [featuredCrops, setFeaturedCrops] = useState([]);
  const [mandiPrices, setMandiPrices] = useState([]);
  const [selectedCropForOffer, setSelectedCropForOffer] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // Interactive Trust Modals State
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [escrowTab, setEscrowTab] = useState('overview');
  const [quickAmount, setQuickAmount] = useState('45000');
  const [quickCrop, setQuickCrop] = useState('Basmati Rice (Organic)');
  const [quickMethod, setQuickMethod] = useState('UPI');
  const [quickLockLoading, setQuickLockLoading] = useState(false);
  const [quickLockResult, setQuickLockResult] = useState(null);

  // Requirement 1 & 2 Enforced:
  // Application must NOT open directly to the Home Screen for unauthenticated users.
  // Display modern Auth Gateway Screen first.
  const isTokenPresent = localStorage.getItem('agrinex_token');
  if (!isTokenPresent || !user) {
    return <AuthGatewayScreen />;
  }

  const activeRole = (forcedRole || user?.role || 'FARMER').toUpperCase();
  const isFarmerRole = activeRole === 'FARMER';
  const isBuyerRole = activeRole === 'BUYER';

  if (showGateway) {
    return (
      <FarmDirectGateway
        onComplete={() => {
          setShowGateway(false);
        }}
      />
    );
  }

  useEffect(() => {
    async function loadData() {
      try {
        const cropsRes = await api.get('/crops?limit=4');
        if (cropsRes.success) setFeaturedCrops(cropsRes.data.crops);

        const mandiRes = await api.get('/market-prices');
        if (mandiRes.success) setMandiPrices(mandiRes.data);
      } catch (err) {
        console.warn('Landing data fallback:', err);
      }
    }
    loadData();
  }, []);

  const faqs = [
    {
      q: 'How does AgriNex guarantee fair pricing for farmers?',
      a: 'AgriNex connects farmers directly with bulk institutional buyers and wholesalers, completely cutting out unregulated middleman commissions (15-25%). Prices are benchmarked against live APMC Agmarknet trends with AI-assisted advisory.'
    },
    {
      q: 'How does the digital payment escrow work?',
      a: 'When a buyer accepts an offer and signs the digital contract, their payment is held securely in mock escrow. The funds are automatically released to the farmer as soon as the buyer provides the 6-digit delivery OTP upon physical inspection.'
    },
    {
      q: 'Is the AI Crop Scanner accurate for all crops?',
      a: 'The AI scanner uses computer vision heuristics to detect common leaf conditions, blight, rust, and estimate harvest freshness. It is designed as an agronomist advisory tool; users are advised to verify sensitive crops physically before final delivery.'
    },
    {
      q: 'How do transporters get assigned?',
      a: 'Verified logistics partners equipped with GPS and reefer containers are matched automatically based on harvest pickup location and destination warehouse requirements, ensuring complete cold-chain visibility.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* =====================================================================
          ROLE COMMAND CENTER BANNER & ACTION RIBBON (Requirements 9, 10, 11)
         ===================================================================== */}
      <section style={{
        background: isFarmerRole
          ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.16) 0%, rgba(16, 185, 129, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.16) 0%, rgba(59, 130, 246, 0.05) 100%)',
        borderBottom: `2px solid ${isFarmerRole ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
        padding: '24px 0 20px',
        position: 'relative',
        zIndex: 20,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: isFarmerRole ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: isFarmerRole ? '0 4px 16px rgba(16, 185, 129, 0.4)' : '0 4px 16px rgba(37, 99, 235, 0.4)'
              }}>
                {isFarmerRole ? <Sprout size={26} /> : <Building2 size={26} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {isFarmerRole ? '🌾 Farmer Home Hub' : '🏢 Buyer Procurement Hub'}
                  </h2>
                  <span className={`badge ${isFarmerRole ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {activeRole} MODE ACTIVE
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Welcome back, <strong style={{ color: 'var(--text-main)' }}>{user?.name || user?.fullName || (isFarmerRole ? 'Ramesh Patel' : 'FreshDirect Wholesale')}</strong>
                  {user?.location?.district ? ` • APMC Node: ${user.location.district}, ${user.location.state}` : ''}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRoleNotifsModal(true)}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '24px',
                  padding: '7px 14px',
                  fontWeight: 700
                }}
              >
                <Bell size={15} color="#f59e0b" />
                <span>Notifications</span>
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '12px'
                }}>3</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/welcome', { replace: true });
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '24px',
                  padding: '7px 16px',
                  fontWeight: 700,
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.08)'
                }}
                title="Securely log out of AgriNex"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Farmer Features Ribbon: 8 Features (Requirement 9) */}
          {isFarmerRole && (
            <div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#10b981',
                marginBottom: '10px'
              }}>
                FARMER WORKSPACE ACTIONS:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => navigate('/prices')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <DollarSign size={20} color="#10b981" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Market Prices</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/prices')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <Sprout size={20} color="#10b981" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Crop Information</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/prices?tab=historical')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <TrendingUp size={20} color="#10b981" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Crop Price Trends</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowScannerModal(true)}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <ScanLine size={20} color="#10b981" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Agricultural Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/farmer/my-crops')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <Wheat size={20} color="#10b981" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>My Crops</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/farmer/dashboard')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <UserCheck size={20} color="#10b981" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Farmer Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRoleNotifsModal(true)}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <Bell size={20} color="#f59e0b" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Notifications</span>
                </button>

                <button
                  type="button"
                  onClick={() => { logout(); navigate('/welcome', { replace: true }); }}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer',
                    background: 'rgba(239, 68, 68, 0.04)'
                  }}
                >
                  <LogOut size={20} color="#ef4444" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ef4444' }}>Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Buyer Features Ribbon: 7 Features (Requirement 10) */}
          {isBuyerRole && (
            <div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#3b82f6',
                marginBottom: '10px'
              }}>
                BUYER PROCUREMENT ACTIONS:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => navigate('/prices')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <DollarSign size={20} color="#3b82f6" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Market Prices</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/marketplace')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <Search size={20} color="#3b82f6" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Crop Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/prices?tab=compare')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <Layers size={20} color="#3b82f6" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Market Comparison</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/marketplace')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <ShoppingCart size={20} color="#3b82f6" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Available Crops</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/buyer/dashboard')}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <Building2 size={20} color="#3b82f6" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Buyer Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRoleNotifsModal(true)}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)'
                  }}
                >
                  <Bell size={20} color="#f59e0b" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Notifications</span>
                </button>

                <button
                  type="button"
                  onClick={() => { logout(); navigate('/welcome', { replace: true }); }}
                  className="glass-card card-hover"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer',
                    background: 'rgba(239, 68, 68, 0.04)'
                  }}
                >
                  <LogOut size={20} color="#ef4444" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ef4444' }}>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '620px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(248, 250, 252, 0) 100%)',
        overflow: 'hidden',
        padding: '60px 0 40px'
      }}>
        {/* 3D Animated Agricultural Environment */}
        <ThreeDHero />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '36px',
            alignItems: 'center'
          }} className="hero-grid-responsive">
            {/* Left Column: Platform Mission & Interactive Action Buttons */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <div className="badge aurora-badge" style={{
                  padding: '6px 16px',
                  borderRadius: '30px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Sparkles size={14} color="#10b981" /> {t('hero.badge', 'Next-Gen Fair Trade Agricultural Platform')}
                </div>

                {/* Farmer Audio Reader Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      const text = `${t('hero.titlePrefix', 'From Farm to Buyer — ')} ${t('hero.titleGradient', 'Direct. Trusted. Smart.')}. ${t('hero.subtitle', '')}`;
                      speak(text);
                    }
                  }}
                  className="btn btn-secondary btn-sm btn-pill"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: isSpeaking ? '#ef4444' : 'var(--border-color)',
                    color: isSpeaking ? '#ef4444' : 'var(--text-main)'
                  }}
                  title={`Listen in ${currentLanguageInfo.nativeName}`}
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} color="#10b981" />}
                  <span>{isSpeaking ? 'Stop Audio' : `🔊 Listen (${currentLanguageInfo.nativeName})`}</span>
                </button>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.1rem, 3.8vw, 3.1rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
                marginBottom: '18px'
              }}>
                {t('hero.titlePrefix', 'From Farm to Buyer — ')}<span className="text-gradient">{t('hero.titleGradient', 'Direct. Trusted. Smart.')}</span>
              </h1>

              <p style={{
                fontSize: '1.0625rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: '28px'
              }}>
                {t('hero.subtitle', 'Directly connecting verified Indian farmers with bulk buyers and refrigerated transporters. Real-time price negotiation, AI crop disease scanning, and digital escrow.')}
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowGateway(true)}
                  className="btn btn-lg"
                  style={{
                    background: '#00C853',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 18px rgba(0, 200, 83, 0.35)'
                  }}
                >
                  <ShieldCheck size={19} /> FarmDirect Aadhar Login
                </button>
                <Link to="/marketplace" className="btn btn-aurora btn-lg">
                  {t('hero.exploreMarketplace', 'Explore Marketplace')} <ArrowRight size={18} />
                </Link>
                <Link
                  to="/add-crop"
                  className="btn btn-primary btn-lg"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  title="List your agricultural harvest directly on the public marketplace"
                >
                  <Sprout size={18} /> {t('hero.listYourCrop', 'List Your Crop / Add Crop')}
                </Link>
                <button
                  onClick={() => {
                    demoLogin('BUYER');
                    navigate('/buyer/requirements');
                  }}
                  className="btn btn-accent btn-lg"
                  title="Direct Farm Procurement for Wholesale Buyers"
                >
                  Procure Wholesale Produce
                </button>
                <Link
                  to="/cart"
                  className="btn btn-secondary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  title="View your bulk procurement cart"
                >
                  <ShoppingCart size={18} /> Procurement Cart
                </Link>
              </div>

              {/* Public Harvest Listing Desk Banner */}
              <div style={{
                marginTop: '20px',
                padding: '14px 18px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.08))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.35rem' }}>🌱</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      Public Harvest Listing Desk — Instant Cultivator Access
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Zero barrier. Any farmer or grower can add harvest lots directly to 14,000+ institutional buyers.
                    </div>
                  </div>
                </div>
                <Link to="/add-crop" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  + Add Crop Directly <ArrowRight size={14} />
                </Link>
              </div>

              {/* Quick Trust Badges & Interactive Working Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '30px', fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  id="btn-escrow-vault"
                  onClick={() => setShowEscrowModal(true)}
                  className="btn btn-secondary floating-badge"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '30px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    background: 'rgba(16, 185, 129, 0.15)',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    color: '#059669',
                    boxShadow: '0 0 18px rgba(16, 185, 129, 0.28)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  title="Click to activate: 100% Escrow Protection Vault"
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', display: 'inline-block' }} />
                  <ShieldCheck size={16} color="#10b981" />
                  <span>{t('hero.escrowProtected', '100% Escrow Protected')}</span>
                </button>

                <button
                  type="button"
                  id="btn-ai-quality-scanner"
                  onClick={() => setShowScannerModal(true)}
                  className="btn btn-secondary floating-badge-delayed"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '30px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    background: 'rgba(6, 182, 212, 0.16)',
                    borderColor: 'rgba(6, 182, 212, 0.55)',
                    color: '#0284c7',
                    boxShadow: '0 0 18px rgba(6, 182, 212, 0.3)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  title="Click to activate: Launch AI Quality & Crop Disease Scanner"
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4', display: 'inline-block' }} />
                  <ScanLine size={16} color="#06b6d4" />
                  <span>{t('hero.aiQualityScanned', 'AI Quality Scanned')}</span>
                </button>

                <button
                  type="button"
                  id="btn-live-gps-fleet"
                  onClick={() => setShowGpsModal(true)}
                  className="btn btn-secondary floating-badge"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '30px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    background: 'rgba(245, 158, 11, 0.16)',
                    borderColor: 'rgba(245, 158, 11, 0.55)',
                    color: '#d97706',
                    boxShadow: '0 0 18px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  title="Click to activate: Launch Live GPS Fleet Telematics Tracker"
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b', display: 'inline-block' }} />
                  <Truck size={16} color="#f59e0b" />
                  <span>{t('hero.gpsTracked', 'Live GPS Fleet')}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase Card (Farmer Harvest & Direct Trade Proof) */}
            <div>
              <div className="aurora-card-glow" style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 24px 60px -15px rgba(0,0,0,0.3)',
                height: '420px'
              }}>
                <img
                  src="/images/agrinex_hero_farmer.jpg"
                  alt="Indian Farmer direct harvest without middlemen"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />

                {/* Top Badge: 0% Middleman Cut */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(6, 78, 59, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  padding: '6px 14px',
                  borderRadius: '30px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                }}>
                  <ShieldCheck size={14} color="#34d399" /> 100% Direct Farm Gate • 0% Broker Cut
                </div>

                {/* Bottom Floating Live Deal Secured Pill */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px 18px',
                  borderRadius: '16px',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 10px #10b981'
                    }} />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Direct Farm Contract Active</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>Nashik Farm ➔ Vashi Hub</div>
                    </div>
                  </div>

                  <Link
                    to="/marketplace"
                    className="btn btn-aurora btn-sm"
                    style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                  >
                    Browse Lots <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APMC Mandi Live Price Ticker */}
      <section style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 0',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '20px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', fontWeight: 700, fontSize: '0.8125rem', color: '#059669' }}>
            <TrendingUp size={16} /> {t('hero.mandiRates', 'MANDI BENCHMARK RATES:')}
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', whiteSpace: 'nowrap' }}>
            {mandiPrices.map((p, idx) => (
              <Link
                key={idx}
                to="/prices"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8125rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Click to view live Mandi Price Discovery & Arbitrage Desk"
              >
                <span style={{ fontWeight: 600 }}>{p.cropName} ({p.market.split(' ')[0]}):</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{p.modalPrice}/kg</span>
                <span style={{
                  color: p.trend === 'UP' ? '#059669' : '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  {p.changePercent > 0 ? `+${p.changePercent}%` : `${p.changePercent}%`}
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                  ARBITRAGE
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('howItWorks.tag', 'Seamless Workflow')}
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '4px' }}>
            {t('howItWorks.title', 'How AgriNex Works')}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.9375rem' }}>
            {t('howItWorks.subtitle', 'Four streamlined steps connecting harvest gates directly to wholesale distribution.')}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: t('howItWorks.step1Title', 'List & Scan Crop'),
              desc: t('howItWorks.step1Desc', 'Farmer takes a live crop photo with AgriNex camera lens. AI scans leaf health and pre-fills quality grading.'),
              icon: ScanLine,
              actionText: 'Launch AI Scanner ➔',
              onAction: () => setShowScannerModal(true)
            },
            {
              step: '02',
              title: t('howItWorks.step2Title', 'Discover & Negotiate'),
              desc: t('howItWorks.step2Desc', 'Bulk buyers browse direct listings or post procurement requirements. Real-time counter-offers via WebSocket.'),
              icon: TrendingUp,
              actionText: 'Explore Marketplace ➔',
              onAction: () => navigate('/marketplace')
            },
            {
              step: '03',
              title: t('howItWorks.step3Title', 'Digital Contract & Escrow'),
              desc: t('howItWorks.step3Desc', 'Offer acceptance auto-generates legal trade contract. Buyer deposits funds into secure demo escrow.'),
              icon: ShieldCheck,
              actionText: 'Inspect Escrow Vault ➔',
              onAction: () => setShowEscrowModal(true)
            },
            {
              step: '04',
              title: t('howItWorks.step4Title', 'GPS Tracking & OTP Release'),
              desc: t('howItWorks.step4Desc', 'Transporter delivers with live simulated GPS and temperature monitoring. 6-digit OTP verifies handover.'),
              icon: Truck,
              actionText: 'Track Live Fleet ➔',
              onAction: () => setShowGpsModal(true)
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={item.onAction}
                className="glass-card card-hover-depth"
                style={{
                  padding: '28px 24px',
                  position: 'relative',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: 'rgba(16, 185, 129, 0.25)',
                    lineHeight: 1
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.8125rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.actionText}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive AI Scanner Demo Section */}
      <section className="container">
        <CropScanner />
      </section>

      {/* Marketplace Preview */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              Fresh Direct From Farms
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Featured Crop Harvests</h2>
          </div>
          <Link to="/marketplace" className="btn btn-outline btn-sm">
            View All Marketplace Listings <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {featuredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onMakeOffer={(c) => setSelectedCropForOffer(c)}
            />
          ))}
        </div>
      </section>

      {/* Stakeholder Benefits Grid */}
      <section className="container">
        <div className="grid grid-cols-2 gap-8">
          {/* For Farmers */}
          <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sprout size={22} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Benefits for Farmers</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Earn 18-25% more revenue by cutting out commission agents and brokers.',
                'Free AI Crop Health & Quality diagnosis via smartphone camera.',
                'Guaranteed timely payments backed by digital escrow lock.',
                'Direct bidding and price transparency against regional APMC rates.',
                'Built-in profit margin and yield calculator for financial planning.'
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem' }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* For Buyers */}
          <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(37, 99, 235, 0.15)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Benefits for Bulk Buyers</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Procure directly from certified producers at wholesale farm-gate rates.',
                'Traceability back to origin farm with quality grading certificates.',
                'Post customized procurement requirements and receive automatic matches.',
                'Live GPS telemetry tracking with temperature monitoring for perishables.',
                'Standardized digital tax invoices and legally enforceable contract notes.'
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem' }}>
                  <CheckCircle2 size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live GPS Fleet Telematics Showcase Section */}
      <section className="container" id="live-fleet-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b', display: 'inline-block' }} />
              Active Cold-Chain Logistics Feed
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Live GPS Fleet Telematics Tracker</h2>
          </div>
          <Link to="/fleet" className="btn btn-outline btn-sm">
            Launch Dedicated Fullscreen Map <ArrowRight size={16} />
          </Link>
        </div>
        <DeliveryTrackerMap />
      </section>

      {/* Platform Live Impact Stats */}
      <section style={{ background: 'var(--bg-surface)', padding: '50px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="grid grid-cols-4 gap-8" style={{ textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#059669' }}>5,400+</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Verified Farmers</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>₹14.8 Cr+</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Trade Volume Settled</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#059669' }}>0%</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Predatory Middleman Cut</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>99.4%</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Delivery OTP Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
            Real Trust Stories
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Voices from the Field</h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[
            {
              quote: 'Before AgriNex, local agents in Lasalgaon would delay my payments for 3 weeks and take 8% cuts. With AgriNex Escrow, my ₹54,000 onion payment was in my account the minute the delivery OTP was confirmed.',
              author: 'Ramesh Patel',
              role: 'Onion Farmer, Niphad (Nashik)',
              avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100'
            },
            {
              quote: 'Procuring 12 tonnes of Basmati paddy directly from Karnal farms without travelling saved our wholesale chain ₹1.2 Lakhs in travel and brokerage. The AI quality grade matched our lab results.',
              author: 'Vikram Singhania',
              role: 'Procurement Head, FreshDirect Mart',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
            },
            {
              quote: 'As a refrigerated vehicle owner, AgriNex keeps our 10-ton Eicher trucks loaded with verified return-trips between Nashik and Navi Mumbai. The live telemetry dashboard works flawlessly.',
              author: 'Harpreet Singh',
              role: 'Fleet Manager, Kisan Logistics',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
            }
          ].map((t, i) => (
            <div key={i} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', color: '#fbbf24', gap: '2px' }}>
                {[...Array(5)].map((_, s) => <Star key={s} size={16} fill="#fbbf24" />)}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <img src={t.avatar} alt={t.author} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{t.author}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{ padding: '18px 20px', cursor: 'pointer' }}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease',
                    color: '#059669'
                  }}
                />
              </div>
              {openFaq === idx && (
                <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Public Social Media Channels & Community Network */}
      <section className="container" style={{ marginBottom: '40px' }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-success" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                  🌐 PUBLIC COMMUNITY
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  45,000+ Active Members Nationwide
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Official Social Media & Live Mandi Channels
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Get instant APMC price alerts, join verified farmer discussions, and connect directly with bulk buyers.
              </p>
            </div>

            <Link to="/add-crop" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              🌱 Add Crop on Public Desk <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {/* WhatsApp */}
            <a
              href="https://chat.whatsapp.com/AgriNexKisanSahayata"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                textDecoration: 'none',
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(37, 211, 102, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#25D366'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.146-.527-1.854-.766-3.036-2.656-3.128-2.779-.093-.122-.748-.996-.748-1.9 0-.904.474-1.348.643-1.534.169-.186.371-.233.495-.233.124 0 .248.001.356.006.113.006.265-.043.415.318.155.372.531 1.299.577 1.393.047.094.078.204.016.327-.063.123-.094.199-.187.308-.093.109-.197.243-.281.326-.093.093-.19.195-.082.381.109.186.483.797 1.037 1.289.712.633 1.312.829 1.498.922.186.093.295.078.404-.047.109-.124.466-.543.59-.729.124-.186.248-.155.419-.093.171.062 1.085.511 1.271.604.186.093.31.139.356.217.047.078.047.45-.097.855zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.982-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.636 0-3.15-.472-4.43-1.285l-.317-.2-2.957.776.789-2.884-.216-.343A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>WhatsApp Community</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct Kisan Sahayata & Orders</div>
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>45k+ Joined</span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/AgriNexMandiRates"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(0, 136, 204, 0.35)',
                textDecoration: 'none',
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(0, 136, 204, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0088cc'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>Telegram Live Mandi</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-Time APMC Price Feeds</div>
                </div>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>Live Rates</span>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@AgriNexIndia"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 0, 0, 0.35)',
                textDecoration: 'none',
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF0000'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>YouTube Channel</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AgriTech & Mandi Guides</div>
                </div>
              </div>
              <span className="badge" style={{ background: 'rgba(255,0,0,0.12)', color: '#FF0000', fontSize: '0.6875rem' }}>Tutorials</span>
            </a>

            {/* Twitter / X */}
            <a
              href="https://x.com/AgriNexIndia"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(29, 161, 242, 0.35)',
                textDecoration: 'none',
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(29, 161, 242, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1DA1F2'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>𝕏 (Twitter)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Arbitrage & Policy</div>
                </div>
              </div>
              <span className="badge badge-secondary" style={{ fontSize: '0.6875rem' }}>Official</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/agrinex-india"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(10, 102, 194, 0.35)',
                textDecoration: 'none',
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(10, 102, 194, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A66C2'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.26a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>LinkedIn Network</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Institutional Sourcing</div>
                </div>
              </div>
              <span className="badge badge-secondary" style={{ fontSize: '0.6875rem' }}>B2B Network</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/agrinex.official"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(228, 64, 95, 0.35)',
                textDecoration: 'none',
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(228, 64, 95, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E4405F'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>Instagram Stories</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cultivator Spotlights</div>
                </div>
              </div>
              <span className="badge badge-secondary" style={{ fontSize: '0.6875rem' }}>Stories</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container" style={{ marginBottom: '40px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          borderRadius: '24px',
          padding: '48px 36px',
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '12px' }}>
            Ready to Transform Your Agricultural Trade?
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#d1fae5', maxWidth: '540px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Join thousands of farmers and wholesale buyers already transacting directly with fair pricing and verified trust.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/add-crop" className="btn btn-primary btn-lg" style={{
              background: '#ffffff',
              color: '#064e3b',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              🌱 Public Harvest Listing (+ Add Crop) <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-aurora btn-lg">
              Register Account <ArrowRight size={18} />
            </Link>
            <Link to="/marketplace" className="btn btn-glass btn-lg" style={{
              borderColor: 'rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.12)'
            }}>
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Offer Negotiation Modal */}
      {selectedCropForOffer && (
        <OfferModal
          crop={selectedCropForOffer}
          onClose={() => setSelectedCropForOffer(null)}
          onOfferSubmitted={() => navigate('/buyer/offers')}
        />
      )}

      {/* 1. Live GPS Fleet Telematics Modal */}
      {showGpsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '860px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '24px',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5), 0 0 35px rgba(245, 158, 11, 0.2)',
            background: 'var(--bg-card)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.25)'
                }}>
                  <Truck size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Live GPS Fleet Telematics Tracker</h3>
                    <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>ACTIVE SATELLITE FEED</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                    Refrigerated cold-chain transport in transit • Active corridor: Nashik Farm ➔ Vashi APMC Hub
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGpsModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px', borderRadius: '50%' }}
                aria-label="Close GPS Fleet Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with clean scrolling */}
            <div style={{ overflowY: 'auto', padding: '16px 24px', flex: 1 }}>
              <DeliveryTrackerMap />
            </div>

            {/* Modal Sticky Footer - Guaranteed Always Visible */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              flexShrink: 0
            }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                🔒 <strong>Escrow Protected:</strong> Transporter must verify 6-digit handover OTP upon physical arrival.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowGpsModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
                <Link
                  to="/fleet"
                  onClick={() => setShowGpsModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Full GPS Screen <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setShowGpsModal(false);
                    demoLogin('TRANSPORTER');
                    navigate('/transporter/dashboard');
                  }}
                  className="btn btn-aurora btn-sm"
                >
                  Transporter Console <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI Quality Scanned Interactive Modal */}
      {showScannerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '860px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '24px',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5), 0 0 35px rgba(6, 182, 212, 0.2)',
            background: 'var(--bg-card)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.25)'
                }}>
                  <ScanLine size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Crop Health & Quality Diagnosis</h3>
                    <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>AI VISION ACTIVE</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                    Instant leaf disease scanning, pest analysis, export grading & fair market valuation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px', borderRadius: '50%' }}
                aria-label="Close AI Scanner Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with clean scrolling */}
            <div style={{ overflowY: 'auto', padding: '16px 24px', flex: 1 }}>
              <CropScanner />
            </div>

            {/* Modal Sticky Footer - Guaranteed Always Visible */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              flexShrink: 0
            }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                ✨ <strong>Computer Vision:</strong> Identifies leaf blight, rust, and moisture within 1.2s.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowScannerModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
                <Link
                  to="/crop-scanner"
                  onClick={() => setShowScannerModal(false)}
                  className="btn btn-aurora btn-sm"
                >
                  Open Fullscreen Scanner Page <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 100% Escrow Protection Vault Modal */}
      {showEscrowModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.78)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '660px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '24px',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5), 0 0 35px rgba(16, 185, 129, 0.2)',
            background: 'var(--bg-card)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)'
                }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>100% Digital Escrow Vault Protection</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                    Zero-risk wholesale settlements for Indian farmers & bulk buyers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEscrowModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px', borderRadius: '50%' }}
                aria-label="Close Escrow Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{
              display: 'flex',
              padding: '8px 24px 0',
              borderBottom: '1px solid var(--border-color)',
              gap: '12px',
              background: 'var(--bg-surface-translucent)'
            }}>
              <button
                type="button"
                onClick={() => setEscrowTab('overview')}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: escrowTab === 'overview' ? '3px solid #10b981' : '3px solid transparent',
                  color: escrowTab === 'overview' ? '#10b981' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={16} /> 3-Step Guarantee
              </button>
              <button
                type="button"
                onClick={() => setEscrowTab('deposit')}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: escrowTab === 'deposit' ? '3px solid #10b981' : '3px solid transparent',
                  color: escrowTab === 'deposit' ? '#10b981' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CreditCard size={16} /> Live Escrow Deposit Simulator
              </button>
            </div>

            {/* Modal Body with clean scrolling */}
            <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
              {escrowTab === 'overview' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Payment Locked in Escrow Vault</h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
                        When a wholesale buyer accepts a farmer's offer, 100% of the funds are deposited into an RBI-compliant virtual escrow account before transport dispatch.
                      </p>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>In-Transit Cold-Chain Telematics</h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
                        The produce is hauled with GPS & reefer temperature monitoring. If produce spoils below contract specifications, buyer insurance pays the dispute automatically.
                      </p>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#d97706', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>6-Digit OTP Delivery Handover</h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
                        Upon physical unloading at the warehouse, the buyer inspects the consignment and shares the unique 6-digit OTP, instantly releasing funds directly to the farmer's bank account.
                      </p>
                    </div>
                  </div>

                  {/* Trust Banner */}
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <ShieldCheck size={28} color="#10b981" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      <strong>Zero Default Rate:</strong> Over ₹14.8 Crores processed with guaranteed payments, zero bad debts, and instant NEFT/RTGS/IMPS settlement.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {quickLockResult ? (
                    <div style={{
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: '#10b981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px'
                      }}>
                        <CheckCircle2 size={28} />
                      </div>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#10b981', margin: '0 0 6px' }}>
                        Escrow Deposit Locked!
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                        ₹{Number(quickLockResult.amount).toLocaleString('en-IN')} held securely for {quickLockResult.cropName}.
                      </p>
                      <div style={{
                        background: 'var(--bg-surface)',
                        padding: '12px',
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 700
                      }}>
                        <span>Delivery Release OTP:</span>
                        <code style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.9375rem' }}>
                          {quickLockResult.releaseOtp || '884920'}
                        </code>
                      </div>
                      <div style={{ marginTop: '16px' }}>
                        <button
                          type="button"
                          onClick={() => setQuickLockResult(null)}
                          className="btn btn-secondary btn-sm"
                        >
                          Test Another Escrow Deposit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setQuickLockLoading(true);
                        try {
                          const res = await api.post('/payments/escrow-deposit', {
                            amount: Number(quickAmount),
                            cropName: quickCrop,
                            paymentMethod: quickMethod
                          });
                          if (res.success) {
                            setQuickLockResult(res.data);
                          }
                        } catch (err) {
                          // Local fallback demonstration
                          setQuickLockResult({
                            amount: quickAmount,
                            cropName: quickCrop,
                            releaseOtp: '884920',
                            vaultRef: 'ESC-SIM-' + Math.floor(100000 + Math.random() * 900000)
                          });
                        } finally {
                          setQuickLockLoading(false);
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                          Commodity / Produce
                        </label>
                        <select
                          className="input"
                          value={quickCrop}
                          onChange={(e) => setQuickCrop(e.target.value)}
                          style={{ width: '100%' }}
                        >
                          <option value="Basmati Rice (Organic)">Basmati Rice (Organic)</option>
                          <option value="Sharbati Wheat">Sharbati Wheat</option>
                          <option value="Alphonso Mango">Alphonso Mango (Ratnagiri)</option>
                          <option value="Nashik Red Onion">Nashik Red Onion</option>
                          <option value="Guntur Red Chilli">Guntur Red Chilli (S17)</option>
                          <option value="Shimla Royal Delicious Apple">Shimla Royal Apple</option>
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                            Deposit Amount (₹)
                          </label>
                          <input
                            type="number"
                            className="input"
                            value={quickAmount}
                            onChange={(e) => setQuickAmount(e.target.value)}
                            min="1000"
                            step="1000"
                            required
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                            Payment Method
                          </label>
                          <select
                            className="input"
                            value={quickMethod}
                            onChange={(e) => setQuickMethod(e.target.value)}
                            style={{ width: '100%' }}
                          >
                            <option value="UPI">Instant UPI / QR</option>
                            <option value="CARD">Debit / Credit Card</option>
                            <option value="NETBANKING">RTGS / NEFT Escrow</option>
                            <option value="WALLET">AgriNex Digital Wallet</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={quickLockLoading}
                        className="btn btn-aurora"
                        style={{
                          width: '100%',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontWeight: 700
                        }}
                      >
                        {quickLockLoading ? (
                          'Securing Funds in RBI Vault...'
                        ) : (
                          <>
                            <Lock size={16} /> Lock ₹{Number(quickAmount || 0).toLocaleString('en-IN')} in Escrow Vault
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Modal Sticky Footer - Guaranteed Always Visible */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => setShowEscrowModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEscrowModal(false);
                  navigate('/payments');
                }}
                className="btn btn-aurora btn-sm"
                style={{ flex: 1.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ShieldCheck size={16} /> Open Payments Hub & Vault <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Notifications Modal */}
      {showRoleNotifsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--bg-card)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            border: '1.5px solid var(--border-color)'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bell size={20} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Live Platform Notifications</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time updates for {user?.name || user?.fullName || 'User'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleNotifsModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-muted)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.875rem' }}>💰 Escrow Payment Deposited</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Just now</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                  Buyer FreshDirect Wholesale locked ₹48,000 for Sharbati Wheat Lot #882. Funds held safely in ICICI Smart Escrow Vault.
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-muted)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.875rem' }}>📈 APMC Mandi Rate Surge</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>2 hours ago</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                  Tomato (Hybrid) modal price spiked by +18.4% to ₹38.00/kg in Pune APMC. Favorable time to list upcoming harvest.
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-muted)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.875rem' }}>🚚 Cold-Chain Reefer En Route</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>4 hours ago</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                  Reefer transport MH-15-EG-4401 dispatched with live GPS telematics and +4°C temperature control.
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-surface)' }}>
              <button
                type="button"
                onClick={() => setShowRoleNotifsModal(false)}
                className="btn btn-primary btn-sm"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
