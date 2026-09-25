import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  MessageSquareDiff,
  ShoppingBag,
  TrendingUp,
  Calculator,
  User,
  Settings,
  Truck,
  Users,
  ShieldCheck,
  FileText,
  DollarSign
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'FARMER':
        return [
          { to: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/farmer/add-crop', label: 'Add New Crop', icon: PlusCircle },
          { to: '/farmer/my-crops', label: 'My Listings', icon: Package },
          { to: '/prices', label: 'Market Intelligence', icon: TrendingUp, badge: 'AI' },
          { to: '/farmer/offers', label: 'Offers & Bids', icon: MessageSquareDiff },
          { to: '/farmer/orders', label: 'Orders & Transport', icon: ShoppingBag },
          { to: '/farmer/earnings', label: 'Earnings & Payouts', icon: DollarSign },
          { to: '/farmer/profit-calculator', label: 'Profit Calculator', icon: Calculator },
        ];
      case 'BUYER':
        return [
          { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/marketplace', label: 'Browse Marketplace', icon: Package },
          { to: '/prices', label: 'Market Intelligence', icon: TrendingUp, badge: 'AI' },
          { to: '/buyer/requirements', label: 'My Requirements', icon: PlusCircle },
          { to: '/buyer/offers', label: 'Offers & Negotiations', icon: MessageSquareDiff },
          { to: '/buyer/orders', label: 'My Orders & Tracking', icon: ShoppingBag },
        ];
      case 'TRANSPORTER':
        return [
          { to: '/transporter/dashboard', label: 'Deliveries Dashboard', icon: LayoutDashboard },
          { to: '/buyer/orders', label: 'Track Shipments', icon: Truck },
        ];
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
          { to: '/admin/users', label: 'KYC & Users', icon: Users },
          { to: '/admin/listings', label: 'Listing Moderation', icon: ShieldCheck },
          { to: '/admin/transactions', label: 'Escrow & Ledger', icon: DollarSign },
          { to: '/admin/audit-logs', label: 'System Audit Logs', icon: FileText }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside style={{
      width: '260px',
      minHeight: 'calc(100vh - 120px)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {user.role} PORTAL
        </div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
          {user.name}
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/farmer/dashboard' || link.to === '/buyer/dashboard' || link.to === '/transporter/dashboard' || link.to === '/admin/dashboard'}
              className="sidebar-nav-item"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : 'var(--text-main)',
                background: isActive ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'transparent',
                boxShadow: isActive ? '0 4px 14px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: isActive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(16, 185, 129, 0.15)',
                      color: isActive ? '#ffffff' : '#10b981'
                    }}>
                      {link.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
