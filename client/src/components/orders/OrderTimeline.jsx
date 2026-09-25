import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function OrderTimeline({ timeline = [], currentStatus = 'IN_TRANSIT' }) {
  const allStages = [
    { key: 'OFFER_CREATED', label: 'Offer Created' },
    { key: 'CONTRACT_CREATED', label: 'Contract Signed' },
    { key: 'PAYMENT_CONFIRMED', label: 'Escrow Paid' },
    { key: 'TRANSPORT_ASSIGNED', label: 'Truck Assigned' },
    { key: 'PICKED_UP', label: 'Harvest Loaded' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'DELIVERED', label: 'Delivered (OTP)' },
    { key: 'COMPLETED', label: 'Order Completed' }
  ];

  // Helper to find if stage is reached
  const isReached = (stageKey) => {
    return timeline.some(t => t.status === stageKey);
  };

  const isCurrent = (stageKey) => currentStatus === stageKey;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={18} color="#10b981" /> Order Lifecycle Stepper
      </h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', paddingBottom: '12px' }}>
        {allStages.map((stage, idx) => {
          const reached = isReached(stage.key);
          const current = isCurrent(stage.key);
          const entry = timeline.find(t => t.status === stage.key);

          return (
            <div
              key={stage.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: 1,
                minWidth: '95px',
                position: 'relative'
              }}
            >
              {/* Connector line between steps */}
              {idx < allStages.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '50%',
                  width: '100%',
                  height: '3px',
                  background: reached ? '#10b981' : 'var(--border-color)',
                  zIndex: 0
                }} />
              )}

              {/* Step Icon */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: current
                  ? '#10b981'
                  : reached
                  ? '#059669'
                  : 'var(--bg-muted)',
                color: reached || current ? '#ffffff' : 'var(--text-muted)',
                border: current ? '3px solid #6ee7b7' : '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                boxShadow: current ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none',
                marginBottom: '8px'
              }}>
                {reached ? <CheckCircle2 size={16} /> : <Circle size={10} />}
              </div>

              {/* Label */}
              <div style={{
                fontSize: '0.75rem',
                fontWeight: current || reached ? 700 : 500,
                color: current ? '#10b981' : reached ? 'var(--text-main)' : 'var(--text-muted)'
              }}>
                {stage.label}
              </div>

              {/* Note / Time */}
              {entry && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
