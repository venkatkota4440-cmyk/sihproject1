import React, { useState, useEffect } from 'react';
import verificationService from '../../services/verificationService';
import { Phone, Mail, Shield, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function VerificationChoice({ user, onSelectMethod, onVerificationComplete }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await verificationService.getStatus();
        if (res.success) {
          setStatus(res.data);
          if (res.data.isFullyVerified) {
            onVerificationComplete();
          }
        }
      } catch (err) {
        console.warn('Status load fallback:', err.message);
      }
      setLoading(false);
    }
    loadStatus();
  }, []);

  const config = status?.config || { requirePhone: true, requireEmail: false, requireAadhaar: false, mode: 'mock' };

  const methods = [
    {
      id: 'PHONE',
      title: 'Mobile Phone OTP',
      desc: 'Verify via 6-digit SMS OTP code sent to your registered mobile number.',
      icon: Phone,
      required: config.requirePhone,
      verified: status?.phoneVerified || user?.phoneVerified
    },
    {
      id: 'EMAIL',
      title: 'Email Verification Code',
      desc: 'Verify via 6-digit confirmation code delivered to your email inbox.',
      icon: Mail,
      required: config.requireEmail,
      verified: status?.emailVerified || user?.emailVerified
    },
    {
      id: 'AADHAAR',
      title: 'Aadhaar Identity Verification',
      desc: 'Government verified identity authentication (Adapter mode, no raw storage).',
      icon: Shield,
      required: config.requireAadhaar,
      verified: status?.identityVerified || user?.identityVerified
    }
  ];

  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '28px',
      padding: '38px 32px',
      boxShadow: 'var(--shadow-xl)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div className="badge badge-warning" style={{ marginBottom: '10px' }}>
          🛡️ Mandated Trade Verification
        </div>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px' }}>
          Choose Verification Method
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          Complete the required verification before unlocking the AgriNex marketplace and live APMC price feeds.
        </p>
      </div>

      {config.mode === 'mock' && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#10b981',
          fontSize: '0.8125rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <CheckCircle2 size={16} />
          <span>Demo Verification Mode Active: Standard test code is <strong>123456</strong> (or <strong>1234</strong> for Aadhaar)</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
        {methods.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              onClick={() => {
                if (!m.verified) onSelectMethod(m.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: '18px',
                background: m.verified ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-muted)',
                border: `1.5px solid ${m.verified ? '#10b981' : 'var(--border-color)'}`,
                cursor: m.verified ? 'default' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!m.verified) {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!m.verified) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: m.verified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{m.title}</span>
                    {m.required && <span className="badge badge-danger" style={{ fontSize: '0.625rem' }}>REQUIRED</span>}
                    {!m.required && <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>OPTIONAL</span>}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {m.desc}
                  </div>
                </div>
              </div>

              <div>
                {m.verified ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 800, fontSize: '0.875rem' }}>
                    <CheckCircle2 size={20} /> Verified
                  </div>
                ) : (
                  <button type="button" className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
                    Verify Now <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
