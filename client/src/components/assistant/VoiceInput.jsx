import React, { useState } from 'react';
import speechRecognitionService from '../../services/speechRecognitionService';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onTranscript, onError }) {
  const [isListening, setIsListening] = useState(false);
  const isSupported = speechRecognitionService.isSupported();

  const handleToggle = () => {
    if (!isSupported) {
      if (onError) onError('Voice input is not supported on this browser. Please type your question.');
      return;
    }

    if (isListening) {
      speechRecognitionService.stopListening();
      setIsListening(false);
    } else {
      speechRecognitionService.startListening({
        lang: 'en-IN',
        onResult: ({ transcript, isFinal }) => {
          if (onTranscript) onTranscript(transcript, isFinal);
        },
        onError: (err) => {
          setIsListening(false);
          if (onError) onError(err.message || 'Microphone error');
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
      setIsListening(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isListening ? 'Stop Listening' : 'Speak to AgriNex Assistant'}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: 'none',
        background: isListening ? '#ef4444' : 'rgba(16, 185, 129, 0.15)',
        color: isListening ? '#ffffff' : '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isListening ? '0 0 12px #ef4444' : 'none'
      }}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}
