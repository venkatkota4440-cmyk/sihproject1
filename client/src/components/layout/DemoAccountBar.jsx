import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Sprout, ShoppingCart, Truck, ShieldCheck, LogOut } from 'lucide-react';

export default function DemoAccountBar() {
  const { demoLogin, user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const roles = [
    { id: 'FARMER', label: `${t('roles.farmer', 'Farmer')} (Ramesh)`, icon: Sprout, color: '#10b981' },
    { id: 'BUYER', label: `${t('roles.buyer', 'Buyer')} (FreshDirect)`, icon: ShoppingCart, color: '#3b82f6' },
    { id: 'TRANSPORTER', label: `${t('roles.transporter', 'Transporter')} (Logistics)`, icon: Truck, color: '#f59e0b' },
    { id: 'ADMIN', label: `${t('roles.admin', 'Admin')}`, icon: ShieldCheck, color: '#8b5cf6' }
  ];

  return (
    <div style={{
      background: 'linear-gradient(90deg, #022c22 0%, #064e3b 40%, #065f46 70%, #047857 100%)',
      color: '#ffffff',
      padding: '8px 20px',
      fontSize: '0.8125rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
      zIndex: 50,
      position: 'relative'
    }}>
      {/* Left indicator with animated pulsing dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.14)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 8px #34d399',
            display: 'inline-block'
          }} />
          <Sparkles size={13} color="#a7f3d0" /> {t('roles.demoSwitcher', '1-CLICK ROLE SWITCHER')}
        </span>
        <span style={{ color: '#d1fae5', fontSize: '0.8125rem', fontWeight: 500 }} className="hidden-mobile">
          Select role for instant presentation:
        </span>
      </div>

      {/* Role Pill Buttons with Tactile Hover */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = user?.role === r.id;

          return (
            <button
              key={r.id}
              onClick={async () => {
                await demoLogin(r.id);
                if (r.id === 'FARMER') navigate('/farmer/dashboard');
                else if (r.id === 'BUYER') navigate('/buyer/dashboard');
                else if (r.id === 'TRANSPORTER') navigate('/transporter/dashboard');
                else if (r.id === 'ADMIN') navigate('/admin/dashboard');
              }}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: isActive
                  ? '1px solid rgba(255, 255, 255, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.15)',
                padding: '5px 12px',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '0.78125rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive
                  ? '0 0 14px rgba(16, 185, 129, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                  : '0 2px 4px rgba(0, 0, 0, 0.1)',
                transform: isActive ? 'scale(1.04)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <Icon size={14} color={isActive ? '#ffffff' : '#6ee7b7'} />
              <span>{r.label}</span>
            </button>
          );
        })}

        {user && (
          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.18)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '4px 10px',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              marginLeft: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
              e.currentTarget.style.color = '#fca5a5';
            }}
          >
            <LogOut size={12} /> Exit
          </button>
        )}
      </div>
    </div>
  );
}
