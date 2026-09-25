import React, { useState } from 'react';
import VoiceInput from './VoiceInput';
import { Send } from 'lucide-react';

export default function AssistantInput({ onSend, disabled = false, onError }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleVoiceTranscript = (transcript, isFinal) => {
    setText(transcript);
    if (isFinal && transcript.trim()) {
      onSend(transcript.trim());
      setText('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 14px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-surface)'
      }}
    >
      <input
        type="text"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask anything (e.g. How do I list my crop?)..."
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: '24px',
          border: '1.5px solid var(--border-color)',
          background: 'var(--bg-muted)',
          color: 'var(--text-main)',
          fontSize: '0.875rem',
          outline: 'none'
        }}
        onFocus={(e) => e.target.style.borderColor = '#10b981'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
      />

      {/* Voice Mic Button */}
      <VoiceInput onTranscript={handleVoiceTranscript} onError={onError} />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: text.trim() ? '#10b981' : 'var(--bg-muted)',
          color: text.trim() ? '#ffffff' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: text.trim() ? 'pointer' : 'default',
          transition: 'all 0.15s ease'
        }}
      >
        <Send size={16} />
      </button>
    </form>
  );
}
