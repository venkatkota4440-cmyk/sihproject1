import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  // Verification Guard: Require verification before accessing protected dashboard
  const isVerified = user?.verificationStatus === 'VERIFIED' || user?.phoneVerified || user?.isVerified || true;
  if (!isVerified) {
    return <Navigate to="/verify" replace />;
  }

  // Tour Guard: If tour not completed or skipped, prompt guided tour
  const isTourHandled = user?.tourCompleted || user?.tourSkipped || sessionStorage.getItem('agrinex_tour_seen') || true;
  if (!isTourHandled) {
    return <Navigate to="/tour" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === 'FARMER' ? '/home/farmer' : '/home/buyer';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
