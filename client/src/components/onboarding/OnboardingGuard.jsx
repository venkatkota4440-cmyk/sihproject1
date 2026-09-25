import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OnboardingFlow from './OnboardingFlow';

export default function OnboardingGuard({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>🌱</div>
          <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Loading AgriNex Portal...</div>
        </div>
      </div>
    );
  }

  // 1. Not Authenticated -> Show Welcome / Auth flow
  if (!isAuthenticated) {
    return <OnboardingFlow initialStep="WELCOME" />;
  }

  // 2. Authenticated but Required Verification Incomplete
  const isVerified = user?.verificationStatus === 'VERIFIED' || user?.phoneVerified;
  if (!isVerified) {
    return <OnboardingFlow initialStep="VERIFY_CHOICE" />;
  }

  // 3. Verified but Tour Incomplete & Not Skipped
  const isTourFinished = user?.tourCompleted || user?.tourSkipped;
  if (!isTourFinished && !sessionStorage.getItem('agrinex_tour_seen')) {
    return (
      <OnboardingFlow
        initialStep="COMPLETE"
        onFinished={() => {
          sessionStorage.setItem('agrinex_tour_seen', 'true');
        }}
      />
    );
  }

  // 4. Role Authorization Check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const defaultPath = user.role === 'FARMER' ? '/farmer/dashboard' : '/marketplace';
    return <Navigate to={defaultPath} replace />;
  }

  return children ? children : <Outlet />;
}
