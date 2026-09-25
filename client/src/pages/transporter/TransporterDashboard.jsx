import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DeliveryTrackerMap from '../../components/map/DeliveryTrackerMap';
import ReceiptModal from '../../components/orders/ReceiptModal';
import {
  Truck,
  MapPin,
  Thermometer,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt
} from 'lucide-react';

export default function TransporterDashboard() {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.success) {
        setOrders(res.data);
        if (res.data.length > 0 && !activeOrder) {
          setActiveOrder(res.data[0]);
        }
      }
    } catch (err) {
      console.warn('Transporter error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (status, note) => {
    if (!activeOrder) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post(`/delivery/${activeOrder.id}/status`, { status, note });
      if (res.success) {
        setSuccessMsg(`Shipment status updated to ${status}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchOrders();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Status update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!activeOrder || !otpInput) return;
    setActionLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.post(`/delivery/${activeOrder.id}/otp`, {
        otp: otpInput
      });

      if (res.success) {
        setSuccessMsg('🎉 OTP Verified! Shipment marked DELIVERED and escrow funds released to Farmer.');
        setOtpInput('');
        fetchOrders();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid Delivery OTP.');
    } finally {
      setActionLoading(false);
    }
  };

  const openReceipt = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/receipt`);
      if (res.success) {
        setReceiptData(res.data);
        setShowReceipt(true);
      }
    } catch (err) {}
  };

  return (
    <div className="container" style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#166534', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
              COLD-CHAIN FLEET PARTNER
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vehicle Reg: MH-12-QX-4890</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Transporter Logistics Dispatch Desk
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Refrigerated farm-to-terminal transportation manifests, live telemetry tracking, and OTP delivery handshakes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Thermometer size={18} color="#166534" />
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Reefer Temp Setpoint</div>
              <strong style={{ fontSize: '0.9375rem', color: '#166534' }}>18.0°C (Active)</strong>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading Logistics Manifests...</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '50px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <Truck size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3>No Active Delivery Assignments</h3>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Shipment List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Assigned Shipments ({orders.length})</h3>
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => setActiveOrder(o)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: activeOrder?.id === o.id ? '2px solid #166534' : '1px solid var(--border-color)',
                  background: activeOrder?.id === o.id ? 'var(--bg-muted)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{o.orderNumber || o.id}</span>
                  <span className={`badge ${
                    o.status === 'COMPLETED' || o.status === 'DELIVERED' ? 'badge-success' :
                    o.status === 'IN_TRANSIT' ? 'badge-warning' : 'badge-neutral'
                  }`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div style={{ fontWeight: 800 }}>{o.cropTitle}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Load: {o.quantity} {o.unit} • Route: Nashik ➔ Mumbai
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Operations Panel */}
          {activeOrder && (
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Manifest Overview */}
              <div style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span className="badge badge-warning">IN-TRANSIT REEFER TRIP</span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                      Shipment #{activeOrder.orderNumber || activeOrder.id}
                    </h2>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Farmer: <strong>{activeOrder.farmerName}</strong> ➔ Consignee: <strong>{activeOrder.buyerName}</strong>
                    </div>
                  </div>

                  <span className="badge badge-success">
                    {activeOrder.status}
                  </span>
                </div>

                {/* Pickup & Drop Addresses */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: 'var(--bg-muted)', padding: '14px', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Pickup (Farm Gate):</span>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginTop: '2px' }}>
                      {activeOrder.pickupAddress || 'Patel Bio-Green Farms, Niphad, Nashik'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Delivery Terminal:</span>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginTop: '2px' }}>
                      {activeOrder.dropoffAddress || 'FreshDirect Distribution, APMC Yard Vashi, Navi Mumbai'}
                    </strong>
                  </div>
                </div>

                {/* Status Progression Controls */}
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '8px' }}>
                    Shipment Lifecycle Actions:
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleUpdateStatus('PICKED_UP', 'Produce loaded into reefer truck at farm gate.')}
                      disabled={actionLoading}
                      className="btn btn-secondary btn-sm"
                    >
                      1. Confirm Farm Loading
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('IN_TRANSIT', 'Vehicle departed onto highway route.')}
                      disabled={actionLoading}
                      className="btn btn-secondary btn-sm"
                    >
                      2. Start Highway Transit
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('DELIVERED', 'Vehicle arrived at buyer unloading bay.')}
                      disabled={actionLoading}
                      className="btn btn-secondary btn-sm"
                    >
                      3. Arrived at Destination
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery OTP Handshake Verification Card */}
              <div style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderLeft: '4px solid #166534', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <KeyRound size={22} color="#166534" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Enter Buyer Delivery OTP to Release Escrow</h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Ask the buyer at the receiving dock for their 6-digit confirmation code (e.g. <code>482915</code> or <code>123456</code>) to verify handover and disburse payment to farmer.
                </p>

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }}
                  />
                  <button type="submit" disabled={actionLoading || !otpInput} className="btn btn-primary">
                    <CheckCircle2 size={16} /> Verify & Complete
                  </button>
                </form>

                {successMsg && (
                  <div style={{ color: '#059669', fontWeight: 600, fontSize: '0.875rem', marginTop: '12px' }}>
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '12px' }}>
                    {errorMsg}
                  </div>
                )}
              </div>

              {/* Live Route Map */}
              <DeliveryTrackerMap orderId={activeOrder.id} />
            </div>
          )}
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          receipt={receiptData}
          order={activeOrder}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
