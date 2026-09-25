import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import voiceService from '../../services/voiceService';
import onboardingService from '../../services/onboardingService';
import { farmerTourSteps } from './FarmerTour';
import { buyerTourSteps } from './BuyerTour';
import TourStep from './TourStep';
import TourControls from './TourControls';
import TourOverlay from './TourOverlay';

export default function GuidedTour({ onComplete }) {
  const { user } = useAuth();
  const isFarmer = user?.role === 'FARMER';
  const steps = isFarmer ? farmerTourSteps : buyerTourSteps;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [language, setLanguage] = useState(user?.preferredLanguage?.slice(0, 2) || 'en');
  const [langTag, setLangTag] = useState(user?.preferredLanguage || 'en-IN');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const activeStepData = steps[currentStepIndex] || steps[0];

  // Subscribe to voice service playback state
  useEffect(() => {
    const unsubscribe = voiceService.subscribe((state) => {
      setIsPlaying(state.isPlaying && !state.isPaused);
    });
    return () => {
      unsubscribe();
      voiceService.stop();
    };
  }, []);

  // Speak current step when step index or language changes
  const speakCurrentStep = () => {
    if (isMuted) return;
    const content = activeStepData[language] || activeStepData.en;
    const textToSpeak = content.voiceText || content.text;
    voiceService.speak(textToSpeak, {
      lang: langTag,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  useEffect(() => {
    speakCurrentStep();
    return () => {
      voiceService.stop();
    };
  }, [currentStepIndex, language]);

  const handleNext = async () => {
    voiceService.stop();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      await handleFinish(true);
    }
  };

  const handlePrevious = () => {
    voiceService.stop();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleFinish = async (completed = true) => {
    voiceService.stop();
    try {
      await onboardingService.updateTourStatus({
        completed,
        skipped: !completed,
        preferredLanguage: langTag
      });
    } catch (e) {
      console.warn('Silent tour status update:', e.message);
    }
    if (onComplete) onComplete();
  };

  const handleLanguageChange = (code, fullTag) => {
    voiceService.stop();
    setLanguage(code);
    setLangTag(fullTag);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    voiceService.setMuted(nextMuted);
    if (!nextMuted) {
      speakCurrentStep();
    }
  };

  return (
    <TourOverlay>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Step Visual & Text Card */}
        <TourStep
          stepData={activeStepData}
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          language={language}
          isPlaying={isPlaying}
        />

        {/* Playback Controls & Navigation */}
        <TourControls
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          isPlaying={isPlaying}
          isMuted={isMuted}
          currentLanguage={language}
          onPlay={speakCurrentStep}
          onPause={() => voiceService.pause()}
          onReplay={speakCurrentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={() => handleFinish(false)}
          onToggleMute={handleToggleMute}
          onChangeLanguage={handleLanguageChange}
        />
      </div>
    </TourOverlay>
  );
}
