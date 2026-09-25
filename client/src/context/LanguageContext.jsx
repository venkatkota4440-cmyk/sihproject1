import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supportedLanguages, translations } from '../translations/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Load saved language or default to Hindi / English
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      return localStorage.getItem('agrinex_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Synchronize document attribute
  useEffect(() => {
    try {
      document.documentElement.lang = currentLanguage;
      localStorage.setItem('agrinex_lang', currentLanguage);
    } catch (e) {
      console.warn('Could not persist language preference:', e);
    }
  }, [currentLanguage]);

  // Function to switch language
  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLanguage(langCode);
    } else {
      console.warn(`Language ${langCode} not supported, falling back to en`);
      setCurrentLanguage('en');
    }
  };

  // Translation lookup function: t('nav.marketplace', 'Marketplace')
  const t = useCallback((path, fallback = '') => {
    if (!path) return fallback;

    const keys = path.split('.');
    
    // First try current language
    let current = translations[currentLanguage];
    let found = true;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        found = false;
        break;
      }
    }

    if (found && typeof current === 'string') {
      return current;
    }

    // Fallback to English
    let english = translations['en'];
    for (const key of keys) {
      if (english && typeof english === 'object' && key in english) {
        english = english[key];
      } else {
        return fallback || path;
      }
    }

    return typeof english === 'string' ? english : (fallback || path);
  }, [currentLanguage]);

  // Voice Reader (Text to Speech) for Farmers
  const speak = useCallback((text, targetLang = currentLanguage) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language code to BCP-47 tag
    const langMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      pa: 'pa-IN',
      gu: 'gu-IN',
      ta: 'ta-IN',
      kn: 'kn-IN'
    };

    utterance.lang = langMap[targetLang] || 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [currentLanguage]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Current active language metadata
  const currentLanguageInfo = supportedLanguages.find(l => l.code === currentLanguage) || supportedLanguages[0];

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage: changeLanguage,
      languages: supportedLanguages,
      currentLanguageInfo,
      t,
      speak,
      stopSpeaking,
      isSpeaking
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
