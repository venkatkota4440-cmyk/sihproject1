import React from 'react';
import { useAuth } from '../../context/AuthContext';
import onboardingService from '../../services/onboardingService';
import { Sprout, Compass, ArrowRight, CheckCircle2, Volume2, Sparkles } from 'lucide-react';

export default function OnboardingComplete({ onStartTour, onSkipTour }) {
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(' ')[0] : 'there';
  const isFarmer = user?.role === 'FARMER';

  const handleStart = async () => {
    try {
      await onboardingService.completeOnboarding({ onboardingCompleted: true });
    } catch (e) {
      console.warn('Onboarding update silent fallback');
    }
    if (onStartTour) onStartTour();
  };

  const handleSkip = async () => {
    try {
      await onboardingService.updateTourStatus({ skipped: true, completed: false });
    } catch (e) {
      console.warn('Tour status update silent fallback');
    }
    if (onSkipTour) onSkipTour();
  };

  return (
    <div style={{
      maxWidth: '620px',
      margin: '0 auto',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '28px',
      padding: '44px 36px',
      boxShadow: 'var(--shadow-xl)',
      textAlign: 'center'
    }}>
      {/* Seedling & Checkmark Celebration */}
      <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 20px' }}>
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)'
        }}>
          <Sprout size={44} strokeWidth={2.4} />
        </div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          background: '#ffffff',
          borderRadius: '50%',
          padding: '2px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <CheckCircle2 size={24} color="#10b981" fill="#ffffff" />
        </div>
      </div>

      <div className="badge badge-success" style={{ marginBottom: '12px' }}>
        <Sparkles size={14} style={{ marginRight: '6px' }} /> Verification Complete & Identity Confirmed
      </div>

      <h1 style={{
        fontSize: '2.2rem',
        fontWeight: 900,
        color: 'var(--text-main)',
        letterSpacing: '-0.02em',
        margin: '0 0 10px'
      }}>
        Welcome to AgriNex, {userName}!
      </h1>

      <p style={{
        fontSize: '1.05rem',
        color: 'var(--text-muted)',
        maxWidth: '480px',
        margin: '0 auto 28px',
        lineHeight: 1.5
      }}>
        Your account is fully verified. We have prepared an intelligent, voice-narrated walk-through tailored for {isFarmer ? 'Farmers' : 'Wholesale Buyers'}.
      </p>

      {/* Tour Feature Preview Box */}
      <div style={{
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        padding: '20px',
        textAlign: 'left',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Volume2 size={26} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Interactive Voice & Visual Tour (11 Steps)
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Hear spoken explanations in English, Telugu, or Hindi with real-time on-screen feature demonstrations.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          type="button"
          onClick={handleStart}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.08rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <Compass size={20} />
          <span>Start Guided Tour</span>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="btn btn-secondary btn-lg"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}
        >
          Skip for Now & Go to Dashboard
        </button>
      </div>
    </div>
  );
}
