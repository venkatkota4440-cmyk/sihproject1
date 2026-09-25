import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import voiceService from '../../services/voiceService';
import { Bot, User, Volume2, Pause, Square, ArrowUpRight } from 'lucide-react';

export default function AssistantMessage({ msg, onActionClick }) {
  const isUser = msg.sender === 'user';
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handlePlayVoice = () => {
    const textToSpeak = msg.voiceText || msg.text;
    voiceService.speak(textToSpeak, {
      lang: 'en-IN',
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsPlaying(false);
        setIsPaused(false);
      }
    });
  };

  const handlePauseVoice = () => {
    voiceService.pause();
    setIsPaused(true);
  };

  const handleResumeVoice = () => {
    voiceService.resume();
    setIsPaused(false);
  };

  const handleStopVoice = () => {
    voiceService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '14px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        maxWidth: '85%',
        flexDirection: isUser ? 'row-reverse' : 'row'
      }}>
        {/* Avatar */}
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: isUser ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)',
          color: isUser ? '#10b981' : '#0ea5e9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px'
        }}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Bubble */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '18px',
          borderTopRightRadius: isUser ? '4px' : '18px',
          borderTopLeftRadius: isUser ? '18px' : '4px',
          background: isUser ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--bg-muted)',
          color: isUser ? '#ffffff' : 'var(--text-main)',
          border: isUser ? 'none' : '1px solid var(--border-color)',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          boxShadow: 'var(--shadow-sm)',
          whiteSpace: 'pre-line'
        }}>
          {msg.text}

          {/* Quick Action Button if provided by AI Assistant */}
          {msg.action && (
            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onActionClick) onActionClick(msg.action);
                  if (msg.action.path) navigate(msg.action.path);
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  background: 'var(--bg-surface)',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#10b981',
                  borderColor: '#10b981'
                }}
              >
                <span>{msg.action.label}</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Voice Playback Bar for Assistant Messages */}
      {!isUser && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '38px',
          marginTop: '6px',
          fontSize: '0.75rem'
        }}>
          {!isPlaying ? (
            <button
              type="button"
              onClick={handlePlayVoice}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#10b981',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Volume2 size={13} /> Listen
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResumeVoice}
                  style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 700, cursor: 'pointer' }}
                >
                  ▶ Resume
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseVoice}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Pause size={12} /> Pause
                </button>
              )}
              <button
                type="button"
                onClick={handleStopVoice}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}
              >
                <Square size={12} /> Stop
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
