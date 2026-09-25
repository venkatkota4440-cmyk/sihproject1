import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AssistantQuickActions({ role = 'FARMER', onSelectAction, onClosePanel }) {
  const navigate = useNavigate();

  const isFarmer = role === 'FARMER';

  const actions = isFarmer ? [
    { label: '🌱 List My Crop', path: '/farmer/add-crop' },
    { label: '🤝 Check My Offers', path: '/farmer/offers' },
    { label: '📦 Check My Orders', path: '/farmer/orders' },
    { label: '💰 My Earnings', path: '/farmer/earnings' },
    { label: '📈 Price Discovery', path: '/prices' },
    { label: '🔍 AI Crop Scanner', path: '/crop-scanner' },
    { label: '🛰️ Track Delivery', path: '/fleet' }
  ] : [
    { label: '🛒 Find Crops', path: '/marketplace' },
    { label: '📋 Post Requirement', path: '/buyer/requirements' },
    { label: '🤝 Check My Offers', path: '/buyer/offers' },
    { label: '📦 Track My Orders', path: '/buyer/orders' },
    { label: '🛰️ Track Delivery', path: '/fleet' },
    { label: '📈 Mandi Prices', path: '/prices' }
  ];

  const handleAction = (item) => {
    if (onSelectAction) {
      onSelectAction(item.label);
    }
    if (item.path) {
      navigate(item.path);
      if (onClosePanel) onClosePanel();
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      overflowX: 'auto',
      padding: '8px 12px',
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      scrollbarWidth: 'none'
    }}>
      {actions.map((act, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => handleAction(act)}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.color = '#10b981';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
        >
          {act.label}
        </button>
      ))}
    </div>
  );
}
