import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Heart, ArrowUpRight, MessageCircle, Send, Video, Share2, Globe, Users } from 'lucide-react';

export default function Footer() {
  const publicSocialLinks = [
    {
      name: 'WhatsApp Community',
      badge: '45,000+ Farmers',
      url: 'https://chat.whatsapp.com/AgriNexKisanSahayata',
      color: '#25D366',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.146-.527-1.854-.766-3.036-2.656-3.128-2.779-.093-.122-.748-.996-.748-1.9 0-.904.474-1.348.643-1.534.169-.186.371-.233.495-.233.124 0 .248.001.356.006.113.006.265-.043.415.318.155.372.531 1.299.577 1.393.047.094.078.204.016.327-.063.123-.094.199-.187.308-.093.109-.197.243-.281.326-.093.093-.19.195-.082.381.109.186.483.797 1.037 1.289.712.633 1.312.829 1.498.922.186.093.295.078.404-.047.109-.124.466-.543.59-.729.124-.186.248-.155.419-.093.171.062 1.085.511 1.271.604.186.093.31.139.356.217.047.078.047.45-.097.855zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.982-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.636 0-3.15-.472-4.43-1.285l-.317-.2-2.957.776.789-2.884-.216-.343A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z"/>
        </svg>
      )
    },
    {
      name: 'Telegram Mandi Ticker',
      badge: 'Live Broadcast',
      url: 'https://t.me/AgriNexMandiRates',
      color: '#0088cc',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
      )
    },
    {
      name: 'YouTube AgriTech',
      badge: 'Video Tutorials',
      url: 'https://youtube.com/@AgriNexIndia',
      color: '#FF0000',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: '𝕏 / Twitter',
      badge: '@AgriNexIndia',
      url: 'https://x.com/AgriNexIndia',
      color: '#1DA1F2',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn Network',
      badge: 'B2B Wholesale',
      url: 'https://linkedin.com/company/agrinex-india',
      color: '#0A66C2',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.26a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
        </svg>
      )
    },
    {
      name: 'Instagram Stories',
      badge: 'Farm Stories',
      url: 'https://instagram.com/agrinex.official',
      color: '#E4405F',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    }
  ];

  return (
    <footer style={{
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      padding: '44px 0 24px',
      marginTop: 'auto',
      color: '#334155'
    }}>
      <div className="container">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-4 gap-8" style={{ marginBottom: '32px' }}>
          {/* Brand info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                background: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Sprout size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#166534', letterSpacing: '-0.02em' }}>
                AGRINEX
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6 }}>
              Digital Agriculture Marketplace connecting verified farmers, institutional wholesale buyers, and transport logistics with transparent APMC mandi price benchmarks.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>
              <ShieldCheck size={15} /> Verified Producer Lots & Escrow Trade Protection
            </div>
          </div>

          {/* Marketplace & Price Services */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>
              Marketplace
            </div>
            <Link to="/marketplace" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8125rem' }}>Wholesale Harvest Listings</Link>
            <Link to="/prices" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8125rem' }}>Daily Mandi Market Prices</Link>
            <Link to="/crop-scanner" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8125rem' }}>AI Quality Assessment</Link>
            <Link to="/fleet" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8125rem' }}>Cold-Chain Logistics</Link>
          </div>

          {/* Farmer & Buyer Services */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>
              Services
            </div>
            <Link to="/farmer/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8125rem' }}>Farmer Portal</Link>
            <Link to="/buyer/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8125rem' }}>Wholesale Buyer Portal</Link>
            <Link to="/add-crop" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8125rem' }}>List Harvest Inventory</Link>
            <Link to="/tour" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8125rem' }}>About Platform</Link>
          </div>

          {/* Assistance & Helpline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>
              Assistance & Transparency
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>
              National Kisan Call Centre Helpline: <strong style={{ color: '#0f172a' }}>1800-180-1551</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Mandi data source: Directorate of Marketing & Inspection (DMI) via data.gov.in.
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Daily price updates published after APMC mandi close.
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Attribution */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '16px',
          paddingBottom: '16px',
          fontSize: '0.75rem',
          color: '#64748b',
          lineHeight: 1.5
        }}>
          <strong>Platform Notice:</strong> Agrinex is an independent digital agriculture marketplace connecting farmers, buyers, and logistics providers. Daily mandi benchmark rates are synchronized from official public open data published on data.gov.in by the Directorate of Marketing and Inspection (DMI), Ministry of Agriculture and Farmers Welfare.
        </div>

        {/* Bottom Copyright */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} AgriNex. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/tour" style={{ color: '#64748b', textDecoration: 'none' }}>About</Link>
            <Link to="/tour" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/tour" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="/tour" style={{ color: '#64748b', textDecoration: 'none' }}>Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
