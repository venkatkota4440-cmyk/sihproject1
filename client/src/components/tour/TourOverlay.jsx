import React from 'react';

export default function TourOverlay({ children }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '28px',
        padding: '36px 32px',
        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {children}
      </div>
    </div>
  );
}
