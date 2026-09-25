import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sprout,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Truck,
  Lock,
  UserCheck,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Wheat,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthGatewayScreen() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleChooseRole = (role, action = 'login') => {
    if (action === 'register') {
      navigate(`/register?role=${role.toLowerCase()}`);
    } else {
      navigate(`/login?role=${role.toLowerCase()}`);
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
      <div style={{
        maxWidth: '840px',
        width: '100%',
        margin: '0 auto',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-md)',
        position: 'relative'
      }}>
        {/* 1. Header & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '10px',
            background: '#166534',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 14px'
          }}>
            <Sprout size={32} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '4px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            <ShieldCheck size={14} /> National Agricultural Portal Gateway
          </div>

          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            margin: '0 0 4px',
            lineHeight: 1.15,
            color: 'var(--text-main)'
          }}>
            AGRINEX <span style={{ color: '#166534', fontWeight: 800 }}>PORTAL</span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#166534',
            margin: '0 0 8px'
          }}>
            Digital Agriculture Ecosystem & Direct Farm-Gate Marketplace
          </p>

          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.5
          }}>
            Choose your stakeholder role to access the national agricultural trading platform. Verified cultivator listings, official AGMARKNET price benchmarks, and secure contract settlements.
          </p>
        </div>

        {/* 2. Two Main Role Options: [ FARMER ] and [ BUYER ] */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* FARMER Role Card */}
          <div
            style={{
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  background: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Wheat size={24} />
                </div>
                <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.6875rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  PRODUCER / KISAN DESK
                </span>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Farmer Access</span>
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                List crops, inspect APMC mandi prices, review buyer bids, and manage farm sales with digital receipts.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="#166534" /> <span>Direct counter-offers from wholesale buyers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="#166534" /> <span>Official Government of India Mandi rates (data.gov.in)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="#166534" /> <span>Guaranteed Escrow payment protection</span>
                </div>
              </div>
            </div>

            {/* Actions for Farmer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleChooseRole('FARMER', 'login')}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  padding: '12px'
                }}
              >
                <span>Continue as Farmer</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleChooseRole('FARMER', 'register')}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '10px'
                }}
              >
                <span>Register as New Cultivator</span>
              </button>
            </div>
          </div>

          {/* BUYER Role Card */}
          <div
            style={{
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  background: '#1e3a8a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <ShoppingCart size={24} />
                </div>
                <span style={{ background: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe', fontSize: '0.6875rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  WHOLESALE PROCUREMENT
                </span>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Buyer Access</span>
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                Discover verified harvest lots, negotiate offers, arrange cold-chain transport, and track shipments.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="#1e3a8a" /> <span>Quality-tested direct farm-gate lots</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="#1e3a8a" /> <span>Multi-mandi price arbitrage radar</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="#1e3a8a" /> <span>Live GPS cold-chain fleet telematics</span>
                </div>
              </div>
            </div>

            {/* Actions for Buyer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleChooseRole('BUYER', 'login')}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  padding: '12px',
                  background: '#1e3a8a',
                  borderColor: '#1e3a8a'
                }}
              >
                <span>Continue as Buyer</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleChooseRole('BUYER', 'register')}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '10px'
                }}
              >
                <span>Register Wholesale Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Common Quick Actions: Already have account? Login | New? Register */}
        <div style={{
          padding: '16px 20px',
          borderRadius: '8px',
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#166534'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Common Authentication Access
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Single credential login across all AgriNex mobile & desktop terminals
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700, padding: '8px 14px' }}
            >
              Already have an account? Login
            </Link>

            <Link
              to="/register"
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, padding: '8px 14px' }}
            >
              New to AgriNex? Register
            </Link>
          </div>
        </div>

        {/* 4. Evaluator Quick Switcher for Testing */}
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.8125rem'
        }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#166534" /> <strong>SIH Evaluator 1-Click Instant Login:</strong>
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={async () => {
                const res = await demoLogin('FARMER');
                if (res.success) navigate('/farmer/dashboard');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Farmer (Ramesh)
            </button>
            <button
              type="button"
              onClick={async () => {
                const res = await demoLogin('BUYER');
                if (res.success) navigate('/buyer/dashboard');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Buyer (FreshDirect)
            </button>
            <button
              type="button"
              onClick={async () => {
                const res = await demoLogin('TRANSPORTER');
                if (res.success) navigate('/transporter/dashboard');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Transporter (Kisan Logistics)
            </button>
            <button
              type="button"
              onClick={async () => {
                const res = await demoLogin('ADMIN');
                if (res.success) navigate('/admin/dashboard');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Admin Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
