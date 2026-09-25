import React from 'react';
import { Sprout, ShoppingCart, Check, ArrowRight, ChevronLeft } from 'lucide-react';

export default function RoleSelection({ onSelectRole, onBack }) {
  const roles = [
    {
      id: 'FARMER',
      title: '🌾 I am a Farmer',
      badge: 'PRODUCER',
      color: '#10b981',
      description: 'Sell farm harvests directly to bulk buyers with fair prices and 100% escrow security.',
      features: [
        'List your crops with verified harvest photos',
        'Connect directly with verified bulk buyers',
        'Real-time price negotiation and counter-offers',
        'Track orders and cold-chain GPS fleet',
        'Manage earnings with direct bank release'
      ]
    },
    {
      id: 'BUYER',
      title: '🛒 I am a Buyer',
      badge: 'PROCUREMENT',
      color: '#0ea5e9',
      description: 'Procure farm-fresh crops directly from verified regional producers at farm-gate pricing.',
      features: [
        'Find crops across 80+ agricultural categories',
        'Compare regional farmers and harvest quality',
        'Send purchase offers and negotiate rates',
        'Post customized bulk crop requirements',
        'Place orders with escrow and track deliveries'
      ]
    }
  ];

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '28px',
      padding: '40px 32px',
      boxShadow: 'var(--shadow-xl)'
    }}>
      {/* Back Button */}
      {onBack && (
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
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 900,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
          margin: '0 0 8px'
        }}>
          How do you want to use AgriNex?
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
          Choose your account type. We will customize your onboarding, verification, and dashboard experience.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {roles.map((r) => (
          <div
            key={r.id}
            onClick={() => onSelectRole(r.id)}
            style={{
              padding: '28px 24px',
              borderRadius: '22px',
              background: 'var(--bg-surface)',
              border: `2px solid var(--border-color)`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = r.color;
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 16px 32px -8px ${r.color}33`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: `${r.color}18`,
                  color: r.color,
                  letterSpacing: '0.08em'
                }}>
                  {r.badge}
                </span>
                <span style={{ color: r.color }}>
                  <ArrowRight size={18} />
                </span>
              </div>

              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: '0 0 8px'
              }}>
                {r.title}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 18px' }}>
                {r.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {r.features.map((f, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                    <div style={{
                      color: r.color,
                      background: `${r.color}15`,
                      borderRadius: '50%',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '1px'
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                background: r.color,
                borderColor: r.color,
                fontWeight: 700,
                padding: '12px',
                borderRadius: '14px'
              }}
            >
              Continue as {r.id === 'FARMER' ? 'Farmer' : 'Buyer'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
