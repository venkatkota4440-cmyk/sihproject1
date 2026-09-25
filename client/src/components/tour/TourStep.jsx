import React from 'react';
import { Volume2, Sparkles } from 'lucide-react';

export default function TourStep({ stepData, currentStep, totalSteps, language = 'en', isPlaying = false }) {
  const Icon = stepData.icon;
  const langContent = stepData[language] || stepData.en;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Step Counter & Progress Bar */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginBottom: '8px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: stepData.color || '#10b981'
            }} />
            Step {currentStep} of {totalSteps}
          </span>
          <span style={{ color: '#10b981', fontWeight: 800 }}>{progressPercent}% Completed</span>
        </div>

        <div style={{
          width: '100%',
          height: '6px',
          background: 'var(--bg-muted)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: `linear-gradient(90deg, #10b981 0%, ${stepData.color || '#059669'} 100%)`,
            borderRadius: '999px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Feature Showcase Card */}
      <div style={{
        background: 'var(--bg-muted)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '24px',
        padding: '28px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Step Icon Badge */}
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '24px',
          background: `${stepData.color || '#10b981'}15`,
          border: `2px solid ${stepData.color || '#10b981'}33`,
          color: stepData.color || '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: `0 8px 24px ${stepData.color || '#10b981'}25`
        }}>
          <Icon size={38} strokeWidth={2.2} />
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.45rem',
          fontWeight: 900,
          color: 'var(--text-main)',
          margin: '0 0 10px',
          letterSpacing: '-0.02em'
        }}>
          {langContent.title}
        </h3>

        {/* Spoken Text Paragraph */}
        <p style={{
          fontSize: '0.96rem',
          color: 'var(--text-main)',
          lineHeight: 1.6,
          maxWidth: '520px',
          margin: '0 auto',
          fontWeight: 500
        }}>
          {langContent.text}
        </p>

        {/* Live Audio Status Visualizer */}
        <div style={{
          marginTop: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: isPlaying ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
          border: isPlaying ? '1px solid #10b981' : '1px solid var(--border-color)',
          fontSize: '0.78125rem',
          fontWeight: 700,
          color: isPlaying ? '#10b981' : 'var(--text-muted)'
        }}>
          <Volume2 size={15} className={isPlaying ? 'pulse-glow' : ''} />
          <span>{isPlaying ? '🔊 Voice Narrating...' : 'Voice Ready (Click Listen Voice)'}</span>
        </div>
      </div>
    </div>
  );
}
