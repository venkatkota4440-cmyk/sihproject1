import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, ShieldCheck, TrendingUp, Truck, Lock, Users, Sparkles, PlusCircle, Globe } from 'lucide-react';

export default function WelcomeScreen({ onSelectRegister, onSelectLogin, onSelectRole, onExplorePublic }) {
  const navigate = useNavigate();
  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '28px',
      padding: '44px 36px',
      boxShadow: 'var(--shadow-xl)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Aurora Glow */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        right: '-120px',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
        }}>
          <Sprout size={36} />
        </div>

        <div className="badge badge-success" style={{ marginBottom: '12px', fontSize: '0.8125rem', padding: '5px 14px' }}>
          <Sparkles size={13} style={{ marginRight: '5px' }} /> Certified Agricultural Trade Network
        </div>

        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 900,
          color: 'var(--text-main)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          margin: '0 0 10px'
        }}>
          Welcome to Agri<span className="text-gradient">Nex</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: '#10b981',
          margin: '0 0 8px'
        }}>
          From Farm to Buyer — Direct. Trusted. Smart.
        </p>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          maxWidth: '520px',
          margin: '0 auto',
          lineHeight: 1.5
        }}>
          Connect directly with farmers and buyers. Discover live crop prices. Negotiate securely. Track deliveries. Manage your agricultural business with digital escrow.
        </p>
      </div>

      {/* Value Pillars List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '36px'
      }}>
        {[
          { icon: Users, title: 'Direct Farm Access', desc: 'Zero middlemen, 100% direct buyer-farmer counter-offers.' },
          { icon: TrendingUp, title: 'Price Discovery', desc: 'Live APMC Agmarknet trends and historical analytics.' },
          { icon: Lock, title: '100% Escrow Protection', desc: 'Funds released only after physical delivery OTP inspection.' },
          { icon: Truck, title: 'GPS Reefer Fleet', desc: 'Active refrigerated transit with sub-zero telematics.' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} style={{
              display: 'flex',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '16px',
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-color)',
              alignItems: 'flex-start'
            }}>
              <div style={{
                color: '#10b981',
                marginTop: '2px',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '6px',
                borderRadius: '8px'
              }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{item.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '2px' }}>{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Direct Public Access to Add Crop */}
        <button
          type="button"
          onClick={() => navigate('/add-crop')}
          className="btn btn-aurora btn-lg"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.05rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <PlusCircle size={20} />
          <span>🌱 Add Crop to Public Dashboard (Direct Access)</span>
        </button>

        <button
          type="button"
          onClick={onSelectRegister}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.08rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>Create New Account (Register)</span>
          <ArrowRight size={20} />
        </button>

        <button
          type="button"
          onClick={onSelectLogin}
          className="btn btn-secondary btn-lg"
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>Already have an account? Sign In</span>
        </button>

        {onExplorePublic && (
          <button
            type="button"
            onClick={onExplorePublic}
            className="btn btn-glass"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '12px'
            }}
          >
            <Globe size={18} />
            <span>🌐 Explore Public Dashboard & Live Mandi Prices</span>
          </button>
        )}
      </div>

      {/* Security Compliance Note */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <ShieldCheck size={14} color="#10b981" />
        <span>Mandatory verification required before accessing live agricultural trade data</span>
      </div>
    </div>
  );
}
