import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check, Volume2, Sparkles, ChevronDown, Languages } from 'lucide-react';

export default function LanguageSelector() {
  const { currentLanguage, setLanguage, languages, currentLanguageInfo, speak, isSpeaking, stopSpeaking, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);

    // Speak brief welcome greeting in the selected language
    const greetings = {
      en: 'Welcome to AgriNex. Direct, Trusted, Smart.',
      hi: 'एग्रीनेक्स में आपका स्वागत है। सीधा, विश्वसनीय, स्मार्ट।',
      mr: 'एग्रीनेक्स मध्ये आपले स्वागत आहे. थेट, विश्वासार्ह, स्मार्ट.',
      te: 'అగ్రిలెక్స్‌కు స్వాగతం. ప్రత్యక్షం, నమ్మకం, స్మార్ట్.',
      pa: 'ਐਗਰੀਨੈਕਸ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਸਿੱਧਾ, ਭਰੋਸੇਮੰਦ, ਸਮਾਰਟ।',
      gu: 'એગ્રીનેક્સમાં આપનું સ્વાગત છે. સીધું, વિશ્વસનીય, સ્માર્ટ.',
      ta: 'அக்ரிநெக்ஸிற்கு நல்வரவு. நேரடி, நம்பகமான, ஸ்மார்ட்.',
      kn: 'ಅಗ್ರಿನೆಕ್ಸ್‌ಗೆ ಸುಸ್ವಾಗತ. ನೇರ, ವಿಶ್ವಾಸಾರ್ಹ, ಸ್ಮಾರ್ಟ್.'
    };
    if (greetings[code]) {
      speak(greetings[code], code);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        className="btn btn-secondary btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '8px 12px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.8125rem',
          background: isOpen ? 'var(--color-primary-100)' : 'var(--bg-muted)',
          borderColor: isOpen ? '#10b981' : 'var(--border-color)',
          color: isOpen ? '#059669' : 'var(--text-main)',
          boxShadow: 'var(--shadow-sm)'
        }}
        title="Change Platform Language"
      >
        <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{currentLanguageInfo.flag}</span>
        <span style={{ fontWeight: 800 }}>{currentLanguageInfo.nativeName}</span>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--text-muted)'
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="modal-content-animate"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '280px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            boxShadow: 'var(--shadow-lg), 0 16px 32px rgba(0, 0, 0, 0.18)',
            backdropFilter: 'blur(16px)',
            padding: '12px',
            zIndex: 110,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px 10px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Languages size={16} color="#10b981" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {t('nav.selectLanguage', 'Select Language')}
              </span>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
              8 Regional
            </span>
          </div>

          {/* Language Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '320px', overflowY: 'auto' }}>
            {languages.map((lang) => {
              const isSelected = currentLanguage === lang.code;

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid #10b981' : '1px solid transparent',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    color: isSelected ? '#059669' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--bg-muted)';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', lineHeight: 1.2 }}>
                        {lang.nativeName}
                      </div>
                      <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
                        {lang.name} • {lang.region.split('&')[0]}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Voice Reader Info Box */}
          <div style={{
            marginTop: '6px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.71875rem',
            color: 'var(--text-muted)',
            paddingLeft: '6px',
            paddingRight: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Volume2 size={13} color="#10b981" />
              <span>Voice Narration Active</span>
            </div>
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.71875rem'
                }}
              >
                Stop Audio
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
