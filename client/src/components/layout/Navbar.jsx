import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';
import {
  Sprout,
  Sun,
  Moon,
  Bell,
  Search,
  User,
  PlusCircle,
  TrendingUp,
  Store,
  ScanLine,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sparkles,
  Truck,
  ShieldCheck,
  ShoppingCart
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { cartItems, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notifTimerRef = useRef(null);

  const toggleNotifications = () => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    if (!notificationOpen) {
      setNotificationOpen(true);
      // Auto-closes after 2 seconds automatically
      notifTimerRef.current = setTimeout(() => {
        setNotificationOpen(false);
      }, 2000);
    } else {
      setNotificationOpen(false);
    }
  };

  const closeNotificationsImmediately = () => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setNotificationOpen(false);
  };

  useEffect(() => {
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    };
  }, []);

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

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.25s ease'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '74px' }}>
        {/* Brand Logo with animated glow */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08) rotate(4deg)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
          >
            <Sprout size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Agri<span className="text-gradient">Nex</span>
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('nav.tagline', 'Direct • Trusted • Smart')}
            </div>
          </div>
        </Link>

        {/* Primary Navigation Links with Pill Hover Highlights */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden-mobile">
          {[
            { to: '/marketplace', label: t('nav.marketplace', 'Marketplace'), icon: Store },
            { to: '/prices', label: t('nav.priceDiscovery', 'Price Discovery'), icon: TrendingUp, badge: 'AI' },
            { to: '/payments', label: 'Payments & UPI', icon: ShieldCheck, badge: 'UPI' },
            { to: '/crop-scanner', label: t('nav.aiCropScanner', 'AI Crop Scanner'), icon: ScanLine },
            { to: '/fleet', label: 'Live GPS Fleet', icon: Truck, badge: 'LIVE' }
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  textDecoration: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: active ? 800 : 600,
                  color: active ? '#10b981' : 'var(--text-main)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: active ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: active ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--bg-muted)';
                    e.currentTarget.style.color = '#10b981';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: active ? '#10b981' : 'rgba(16, 185, 129, 0.15)',
                    color: active ? '#ffffff' : '#10b981'
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                textDecoration: 'none',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: location.pathname.includes('/dashboard') ? '#10b981' : 'var(--text-main)',
                padding: '8px 16px',
                borderRadius: '12px',
                background: location.pathname.includes('/dashboard') ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                border: location.pathname.includes('/dashboard') ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard size={18} />
              <span>{t('nav.portal', 'Portal')}</span>
            </Link>
          )}
        </nav>

        {/* Actions & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Action button for Farmer / Buyer / Public Dashboard */}
          {user?.role === 'BUYER' ? (
            <Link to="/buyer/requirements" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> {t('nav.postRequirement', 'Post Requirement')}
            </Link>
          ) : (
            <Link to="/add-crop" className="btn btn-primary btn-sm" title="Add your crop to marketplace">
              <PlusCircle size={16} /> {t('nav.listCrop', 'List Crop')}
            </Link>
          )}

          {/* Wholesale Buyer Procurement Cart Button */}
          <button
            type="button"
            onClick={toggleCart}
            aria-label="Open Procurement Cart"
            style={{
              background: cartItems.length > 0 ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-muted)',
              border: cartItems.length > 0 ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-color)',
              color: cartItems.length > 0 ? '#10b981' : 'var(--text-main)',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: cartItems.length > 0 ? '0 0 16px rgba(16, 185, 129, 0.28)' : 'var(--shadow-sm)'
            }}
            title={`Procurement Cart (${cartItems.length} lot${cartItems.length === 1 ? '' : 's'})`}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = cartItems.length > 0 ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-color)';
            }}
          >
            <ShoppingCart size={19} />
            {cartItems.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 900,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)'
                }}
              >
                {cartItems.length}
              </span>
            )}
          </button>

          {/* Multilingual Translator Dropdown */}
          <LanguageSelector />

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(15deg) scale(1.05)';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={19} color="#fbbf24" /> : <Moon size={19} color="var(--text-main)" />}
          </button>

          {/* Notifications Bell (Auto-closes in 2s, Closes immediately on touch) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={toggleNotifications}
              title="Notifications (Auto-closes in 2s, tap to close)"
              style={{
                background: 'var(--bg-muted)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '7px',
                right: '7px',
                width: '9px',
                height: '9px',
                background: '#ef4444',
                borderRadius: '50%',
                border: '2px solid var(--bg-surface)',
                boxShadow: '0 0 6px #ef4444'
              }}></span>
            </button>

            {notificationOpen && (
              <div
                onClick={closeNotificationsImmediately}
                onTouchStart={closeNotificationsImmediately}
                role="alert"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50px',
                  width: '320px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg), 0 0 20px rgba(16, 185, 129, 0.2)',
                  padding: '16px',
                  zIndex: 100,
                  cursor: 'pointer',
                  userSelect: 'none',
                  animation: 'fadeInUp 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800 }}>Notifications</h4>
                  <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>Auto-closes 2s</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 700, marginBottom: '10px' }}>
                  👆 Touch anywhere to close immediately
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-muted)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>🚚 Shipment In Transit</div>
                    <div style={{ color: 'var(--text-muted)' }}>Order #AGX-ORD-88401 is en route to Navi Mumbai APMC.</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-muted)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, color: '#f59e0b' }}>📈 Price Alert: Tomato</div>
                    <div style={{ color: 'var(--text-muted)' }}>Mandi rate reached ₹32.00/kg in Pune APMC.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile and Direct Header Logout */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 12px 4px 4px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {profileOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50px',
                      width: '230px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '10px',
                      zIndex: 100
                    }}
                  >
                    <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <span className="badge badge-success" style={{ marginTop: '6px' }}>{user.role}</span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        color: 'var(--text-main)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={16} /> My Dashboard
                    </Link>

                    <button
                      onClick={() => { setProfileOpen(false); logout(); navigate('/welcome', { replace: true }); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} /> {t('nav.logout', 'Log Out')}
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Visible Logout Button in Header */}
              <button
                onClick={() => { logout(); navigate('/welcome', { replace: true }); }}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  cursor: 'pointer'
                }}
                title="Log out of AgriNex"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                {t('nav.login', 'Sign In')}
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                {t('nav.register', 'Get Started')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
