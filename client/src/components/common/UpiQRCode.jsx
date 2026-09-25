import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, CheckCircle2, Copy, Smartphone, ShieldCheck } from 'lucide-react';

export default function UpiQRCode({
  value,
  size = 200,
  payeeName = 'Farmer Direct Beneficiary',
  amount = 0,
  vpa = ''
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2, // 2x resolution for retina sharpness
      margin: 1.5,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#070c14',
        light: '#ffffff'
      }
    })
      .then((url) => {
        setQrDataUrl(url);
        setError(null);
      })
      .catch((err) => {
        console.warn('QR Code generation fallback:', err);
        setError(err.message);
      });
  }, [value, size]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      width: '100%',
      maxWidth: '340px'
    }}>
      {/* QR Code Container with High-Contrast White Background & Aurora Border */}
      <div style={{
        background: '#ffffff',
        padding: '16px',
        borderRadius: '24px',
        border: '3px solid #10b981',
        boxShadow: '0 12px 36px rgba(16, 185, 129, 0.22), 0 4px 12px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        marginBottom: '16px',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {qrDataUrl ? (
          <div style={{ position: 'relative', width: size, height: size }}>
            <img
              src={qrDataUrl}
              alt={`UPI QR Code for ${payeeName}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                display: 'block',
                borderRadius: '8px'
              }}
            />
            {/* Center UPI Shield Emblem */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '2.5px solid #10b981',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              fontWeight: 900,
              fontSize: '0.625rem'
            }}>
              <QrCode size={22} color="#059669" />
            </div>
          </div>
        ) : (
          <div style={{
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#64748b'
          }}>
            <QrCode size={40} className="animate-spin" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Generating NPCI UPI QR...</span>
          </div>
        )}

        <div style={{
          fontSize: '0.72rem',
          fontWeight: 900,
          color: '#0f172a',
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <ShieldCheck size={14} color="#059669" />
          <span>NPCI BHIM UPI QR • SCAN ANY APP</span>
        </div>
      </div>

      {/* Copy / Direct Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={handleCopyLink}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700 }}
        >
          {copied ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
          <span>{copied ? 'Copied Link!' : 'Copy UPI Intent'}</span>
        </button>

        <a
          href={value}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}
        >
          <Smartphone size={14} />
          <span>Pay in App</span>
        </a>
      </div>

      {/* Verified Details Card */}
      <div style={{
        background: 'var(--bg-surface)',
        padding: '12px 16px',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        fontSize: '0.8125rem',
        width: '100%',
        textAlign: 'left',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {vpa && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Beneficiary VPA:</span>
            <span style={{ color: '#10b981', fontWeight: 800, fontFamily: 'monospace' }}>{vpa}</span>
          </div>
        )}
        {amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.9375rem' }}>₹{Number(amount).toLocaleString('en-IN')}</strong>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Escrow Custody:</span>
          <strong style={{ color: '#0284c7' }}>ICICI Bank Smart Escrow Node</strong>
        </div>
      </div>
    </div>
  );
}
