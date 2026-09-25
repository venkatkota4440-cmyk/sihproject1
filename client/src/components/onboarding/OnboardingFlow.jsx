import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import verificationService from '../../services/verificationService';
import WelcomeScreen from './WelcomeScreen';
import RoleSelection from './RoleSelection';
import RegistrationForm from './RegistrationForm';
import VerificationChoice from './VerificationChoice';
import PhoneVerification from './PhoneVerification';
import EmailVerification from './EmailVerification';
import AadhaarVerification from './AadhaarVerification';
import OnboardingComplete from './OnboardingComplete';
import GuidedTour from '../tour/GuidedTour';

export default function OnboardingFlow({ initialStep = 'WELCOME', onFinished, onExplorePublic }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Possible steps: 'WELCOME' | 'ROLE' | 'REGISTER' | 'VERIFY_CHOICE' | 'VERIFY_PHONE' | 'VERIFY_EMAIL' | 'VERIFY_AADHAAR' | 'COMPLETE' | 'TOUR'
  const [step, setStep] = useState(() => {
    if (!isAuthenticated) return initialStep || 'WELCOME';
    if (!user?.phoneVerified && user?.verificationStatus !== 'VERIFIED') return 'VERIFY_CHOICE';
    if (!user?.tourCompleted && !user?.tourSkipped) return 'COMPLETE';
    return initialStep || 'WELCOME';
  });

  const [selectedRole, setSelectedRole] = useState(user?.role || 'FARMER');
  const [registeredUser, setRegisteredUser] = useState(user);

  useEffect(() => {
    if (user) {
      setRegisteredUser(user);
      setSelectedRole(user.role || 'FARMER');
    }
  }, [user]);

  const handleRoleChosen = (role) => {
    setSelectedRole(role);
    setStep('REGISTER');
  };

  const handleRegistered = (newUser) => {
    setRegisteredUser(newUser);
    setStep('VERIFY_CHOICE');
  };

  const handleVerificationDone = () => {
    setStep('COMPLETE');
  };

  const handleTourFinished = () => {
    if (onFinished) {
      onFinished();
    } else {
      navigate(selectedRole === 'FARMER' ? '/farmer/dashboard' : '/marketplace');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative',
      zIndex: 10
    }}>
      {step === 'WELCOME' && (
        <WelcomeScreen
          onSelectRegister={() => setStep('ROLE')}
          onSelectLogin={() => navigate('/login')}
          onSelectRole={(r) => handleRoleChosen(r)}
          onExplorePublic={onExplorePublic}
        />
      )}

      {step === 'ROLE' && (
        <RoleSelection
          onSelectRole={handleRoleChosen}
          onBack={() => setStep('WELCOME')}
        />
      )}

      {step === 'REGISTER' && (
        <RegistrationForm
          role={selectedRole}
          onRegistered={handleRegistered}
          onBackToRole={() => setStep('ROLE')}
        />
      )}

      {step === 'VERIFY_CHOICE' && (
        <VerificationChoice
          user={registeredUser || user}
          onSelectMethod={(method) => {
            if (method === 'PHONE') setStep('VERIFY_PHONE');
            if (method === 'EMAIL') setStep('VERIFY_EMAIL');
            if (method === 'AADHAAR') setStep('VERIFY_AADHAAR');
          }}
          onVerificationComplete={handleVerificationDone}
        />
      )}

      {step === 'VERIFY_PHONE' && (
        <PhoneVerification
          initialPhone={registeredUser?.phone || user?.phone || '9876543210'}
          onVerified={() => setStep('VERIFY_CHOICE')}
          onBack={() => setStep('VERIFY_CHOICE')}
        />
      )}

      {step === 'VERIFY_EMAIL' && (
        <EmailVerification
          initialEmail={registeredUser?.email || user?.email || 'farmer@agrinex.com'}
          onVerified={() => setStep('VERIFY_CHOICE')}
          onBack={() => setStep('VERIFY_CHOICE')}
        />
      )}

      {step === 'VERIFY_AADHAAR' && (
        <AadhaarVerification
          onVerified={() => setStep('VERIFY_CHOICE')}
          onBack={() => setStep('VERIFY_CHOICE')}
        />
      )}

      {step === 'COMPLETE' && (
        <OnboardingComplete
          onStartTour={() => setStep('TOUR')}
          onSkipTour={handleTourFinished}
        />
      )}

      {step === 'TOUR' && (
        <GuidedTour onComplete={handleTourFinished} />
      )}
    </div>
  );
}
