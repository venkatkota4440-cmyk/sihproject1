import React from 'react';
import { Bot } from 'lucide-react';

export default function AssistantTyping() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginBottom: '14px'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Bot size={18} />
      </div>

      <div style={{
        padding: '12px 18px',
        borderRadius: '18px',
        borderTopLeftRadius: '4px',
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>Thinking...</span>
        <span style={{ animation: 'pulse 1.2s infinite' }}>🌾</span>
      </div>
    </div>
  );
}
