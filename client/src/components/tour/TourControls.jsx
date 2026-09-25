import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Globe,
  X
} from 'lucide-react';

export default function TourControls({
  currentStep,
  totalSteps,
  isPlaying,
  isMuted,
  currentLanguage,
  onPlay,
  onPause,
  onReplay,
  onNext,
  onPrevious,
  onSkip,
  onToggleMute,
  onChangeLanguage
}) {
  const languages = [
    { code: 'en', langTag: 'en-IN', label: 'English', nativeName: 'English' },
    { code: 'te', langTag: 'te-IN', label: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'hi', langTag: 'hi-IN', label: 'Hindi', nativeName: 'हिन्दी' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      paddingTop: '16px',
      borderTop: '1px solid var(--border-color)'
    }}>
      {/* Top Controls Row: Voice Audio Controls & Language Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {/* Voice Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              className="btn btn-secondary btn-sm"
              title="Pause Voice Narration"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Pause size={15} /> Pause Voice
            </button>
          ) : (
            <button
              type="button"
              onClick={onPlay}
              className="btn btn-primary btn-sm"
              title="Play Voice Narration"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Play size={15} /> Listen Voice
            </button>
          )}

          <button
            type="button"
            onClick={onReplay}
            className="btn btn-secondary btn-sm"
            title="Replay Voice Explanation"
            style={{ padding: '6px 10px' }}
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="btn btn-secondary btn-sm"
            title={isMuted ? 'Unmute Voice' : 'Mute Voice'}
            style={{ padding: '6px 10px', color: isMuted ? '#ef4444' : 'inherit' }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} color="#10b981" />}
          </button>
        </div>

        {/* Multilingual Voice Selector: English, Telugu, Hindi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={15} color="var(--text-muted)" />
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onChangeLanguage(l.code, l.langTag)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.78125rem',
                fontWeight: currentLanguage === l.code ? 800 : 500,
                border: currentLanguage === l.code ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                background: currentLanguage === l.code ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                color: currentLanguage === l.code ? '#10b981' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {l.nativeName}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row: Navigation (Previous, Progress, Next, Skip) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={onPrevious}
          className="btn btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            fontSize: '0.875rem',
            fontWeight: 700,
            opacity: currentStep === 1 ? 0.4 : 1
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Skip Tour Button */}
        <button
          type="button"
          onClick={onSkip}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          Skip Tour
        </button>

        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 22px',
            fontSize: '0.9rem',
            fontWeight: 800
          }}
        >
          <span>{currentStep === totalSteps ? 'Finish & Open App' : 'Next'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
