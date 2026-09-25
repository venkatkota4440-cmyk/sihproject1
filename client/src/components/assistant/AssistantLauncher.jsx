import React from 'react';
import { Bot, Sparkles, Volume2 } from 'lucide-react';

export default function AssistantLauncher({ onClick, isOpen = false }) {
  return (
    <button
      type="button"
      id="btn-ask-agrinex"
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 22px',
        borderRadius: '30px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        cursor: 'pointer',
        fontSize: '0.9375rem',
        fontWeight: 800,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isOpen ? 'scale(0.95)' : 'scale(1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = isOpen ? 'scale(0.95)' : 'scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.45)';
      }}
      title="AgriNex AI Guide & Voice Assistant"
    >
      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Bot size={18} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.2 }}>
          <span>AI Guide & Voice</span>
          <Sparkles size={13} color="#fef08a" />
        </div>
        <span style={{ fontSize: '0.6875rem', opacity: 0.9, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Volume2 size={11} /> All Features & Payments
        </span>
      </div>
    </button>
  );
}
