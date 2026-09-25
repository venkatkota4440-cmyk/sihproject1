import React, { useState } from 'react';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import UpiQRCode from '../common/UpiQRCode';

export default function PaymentModal({ order, onClose, onPaymentSuccess }) {
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('demo.buyer@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8841');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!order) return null;

  const handlePay = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Simulate real gateway handshake
      const res = await api.post('/payments/verify', {
        orderId: order.id,
        paymentMethod: method,
        transactionId: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
      });

      if (res.success) {
        setSuccess(true);
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        setTimeout(() => {
          if (onPaymentSuccess) onPaymentSuccess(res.data);
          onClose();
        }, 1600);
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed.');
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay-animate" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="modal-content-animate" style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '520px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AgriNex Escrow Checkout</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order #{order.orderNumber || order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>Payment Held in Escrow!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                ₹{Number(order.totalPrice).toLocaleString('en-IN')} deposited successfully. Kisan Logistics has been scheduled for farm gate pickup.
              </p>
            </div>
          ) : (
            <>
              {/* Order Amount Banner */}
              <div style={{
                background: 'var(--bg-muted)',
                padding: '14px 18px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payable Amount</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹{Number(order.totalPrice).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Produce</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                    {order.quantity} {order.unit} {order.cropTitle}
                  </div>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'Card', label: 'Card', icon: CreditCard },
                  { id: 'NetBanking', label: 'NetBanking', icon: Building2 },
                  { id: 'Wallet', label: 'Wallets', icon: Wallet }
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMethod(t.id)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '10px',
                        border: method === t.id ? '2px solid #10b981' : '1px solid var(--border-color)',
                        background: method === t.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)',
                        color: method === t.id ? '#059669' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Icon size={18} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Method Detail View */}
              {method === 'UPI' && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <UpiQRCode
                      value={`upi://pay?pa=escrow@agrinex&am=${order.totalPrice}`}
                      size={140}
                      payeeName="AgriNex Escrow Vault"
                      amount={order.totalPrice}
                      vpa="escrow@agrinex"
                    />
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI VPA (e.g. mobile@upi)"
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              )}

              {method === 'Card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Expiry</label>
                      <input type="text" defaultValue="08/29" className="form-input" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>CVV</label>
                      <input type="password" defaultValue="•••" maxLength="3" className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              {method === 'NetBanking' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="form-select"
                  >
                    <option>HDFC Bank</option>
                    <option>State Bank of India</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Bank of Baroda</option>
                  </select>
                </div>
              )}

              {method === 'Wallet' && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik'].map(w => (
                    <button key={w} type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                      {w}
                    </button>
                  ))}
                </div>
              )}

              {/* Escrow Assurance Disclaimer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-muted)',
                padding: '8px 12px',
                borderRadius: '8px'
              }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>
                  Funds are secured in AgriNex Escrow and only released to the farmer upon delivery OTP verification.
                </span>
              </div>

              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.8125rem' }}>
                  {error}
                </div>
              )}

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={processing}
                className="btn btn-glow"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800, justifyContent: 'center' }}
              >
                <Lock size={18} />
                {processing ? 'Authorizing Mock Escrow...' : `Pay ₹${Number(order.totalPrice).toLocaleString('en-IN')} (Demo Mode)`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
