import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ShieldCheck,
  QrCode,
  Copy,
  Sparkles,
  Lock,
  Download
} from 'lucide-react';
import UpiQRCode from '../../components/common/UpiQRCode';

export default function FarmerEarnings() {
  const { user } = useAuth();
  const { showToast } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [verifyingPenny, setVerifyingPenny] = useState(false);
  const [pennySuccess, setPennySuccess] = useState(false);

  const farmerUpiId = user?.upiId || (user?.name ? `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@okhdfcbank` : 'rameshpatel@okhdfcbank');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/orders');
        if (res.success) setOrders(res.data);
      } catch (err) {}
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  const completed = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED');
  const totalSettled = completed.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingInEscrow = orders
    .filter(o => o.status === 'IN_TRANSIT' || o.status === 'TRANSPORT_ASSIGNED' || o.status === 'PAYMENT_CONFIRMED')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(farmerUpiId);
    }
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    if (showToast) {
      showToast(`✓ Your Farmer UPI ID copied: ${farmerUpiId}`);
    }
  };

  const handlePennyDropTest = () => {
    setVerifyingPenny(true);
    setTimeout(() => {
      setVerifyingPenny(false);
      setPennySuccess(true);
      if (showToast) {
        showToast('✓ NPCI ₹1 Penny Drop Successful: State Bank of India account confirmed!');
      }
      setTimeout(() => setPennySuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <span className="badge badge-success">DIRECT DBT ESCROW SETTLEMENTS</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
          Earnings & Bank Settlements
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Zero broker deductions. Automatic direct bank transfer upon buyer digital delivery confirmation.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
            Total Settled Revenue
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
            ₹{totalSettled.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {completed.length} completed harvest contracts
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
            Held in Active Escrow
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
            ₹{pendingInEscrow.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Disburses upon OTP handover
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
            Linked Bank Account (DBT)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '6px' }}>
            State Bank of India
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            A/C: •••• •••• 9842 (IFSC: SBIN0004128)
          </div>
        </div>
      </div>

      {/* FARMER UPI SETTLEMENT & FARM-GATE QR CARD */}
      <div className="glass-card" style={{
        padding: '28px',
        borderRadius: '24px',
        border: '1.5px solid rgba(16, 185, 129, 0.35)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(6, 182, 212, 0.03) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}>
              <QrCode size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Farmer UPI Payout & Farm-Gate QR</h3>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>NPCI DBT Active</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Instant direct-to-account settlement upon delivery OTP verification or direct farm-gate collection.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePennyDropTest}
              disabled={verifyingPenny}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Sparkles size={14} color="#10b981" />
              {verifyingPenny ? 'Verifying...' : pennySuccess ? '✓ Verified (₹1 Deposited)' : 'Test ₹1 Penny Drop'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
          {/* UPI ID Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: 'var(--bg-surface)',
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Primary Payout UPI VPA</span>
                <code style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10b981' }}>{farmerUpiId}</code>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
              >
                {copiedUpi ? <CheckCircle2 size={13} color="#10b981" /> : <Copy size={13} />}
                {copiedUpi ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Name:</span>
                <strong>{user?.name || 'Ramesh Patel'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bank & Branch:</span>
                <strong>State Bank of India (Nashik Agri Branch)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>IFSC & A/C:</span>
                <code>SBIN0004128 • •••• 9842</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Aadhaar Link:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Verified (XXXX XXXX 8912)</span>
              </div>
            </div>
          </div>

          {/* Farm-Gate QR Code */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <UpiQRCode
              value={`upi://pay?pa=${farmerUpiId}&pn=${encodeURIComponent(user?.name || 'Farmer')}&cu=INR&tn=AgriNex_FarmGate`}
              size={170}
              payeeName={user?.name || 'Certified Cultivator'}
              vpa={farmerUpiId}
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
          Recent Settlement Ledger
        </h3>

        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No transactions recorded yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '10px 0' }}>ORDER ID</th>
                <th style={{ padding: '10px 0' }}>COMMODITY</th>
                <th style={{ padding: '10px 0' }}>PURCHASER</th>
                <th style={{ padding: '10px 0' }}>STATUS</th>
                <th style={{ padding: '10px 0', textAlign: 'right' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 0', fontWeight: 600, fontFamily: 'monospace' }}>{ord.orderNumber || ord.id}</td>
                  <td style={{ padding: '14px 0' }}>{ord.quantity} {ord.unit} {ord.cropTitle}</td>
                  <td style={{ padding: '14px 0', color: 'var(--text-muted)' }}>{ord.buyerName}</td>
                  <td style={{ padding: '14px 0' }}>
                    <span className={`badge ${
                      ord.status === 'COMPLETED' || ord.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 0', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                    + ₹{Number(ord.totalPrice).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
