import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, TrendingUp, ScanLine, LayoutDashboard, Home } from 'lucide-react';

export default function MobileBottomNav() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'FARMER': return '/farmer/dashboard';
      case 'BUYER': return '/buyer/dashboard';
      case 'TRANSPORTER': return '/transporter/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/marketplace';
    }
  };

  return (
    <nav className="mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border-color)',
      display: 'none', // Handled via CSS media query below
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0',
      zIndex: 40
    }}>
      <style>{`
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: flex !important; }
          body { padding-bottom: 64px; }
          .hidden-mobile { display: none !important; }
        }
      `}</style>

      <NavLink
        to="/"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isActive ? '#10b981' : 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.6875rem',
          fontWeight: 600
        })}
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/marketplace"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isActive ? '#10b981' : 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.6875rem',
          fontWeight: 600
        })}
      >
        <Store size={20} />
        <span>Market</span>
      </NavLink>

      <NavLink
        to="/crop-scanner"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isActive ? '#10b981' : 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.6875rem',
          fontWeight: 600
        })}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          marginTop: '-18px',
          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)'
        }}>
          <ScanLine size={20} />
        </div>
        <span>AI Scan</span>
      </NavLink>

      <NavLink
        to="/prices"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isActive ? '#10b981' : 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.6875rem',
          fontWeight: 600
        })}
      >
        <TrendingUp size={20} />
        <span>Prices</span>
      </NavLink>

      <NavLink
        to={getDashboardPath()}
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isActive ? '#10b981' : 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.6875rem',
          fontWeight: 600
        })}
      >
        <LayoutDashboard size={20} />
        <span>Portal</span>
      </NavLink>
    </nav>
  );
}
