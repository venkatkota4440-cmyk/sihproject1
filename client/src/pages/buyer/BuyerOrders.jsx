import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import OrderTimeline from '../../components/orders/OrderTimeline';
import DeliveryTrackerMap from '../../components/map/DeliveryTrackerMap';
import PaymentModal from '../../components/payment/PaymentModal';
import ContractModal from '../../components/orders/ContractModal';
import ReceiptModal from '../../components/orders/ReceiptModal';
import {
  ShoppingBag,
  CreditCard,
  Truck,
  FileText,
  Receipt,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.success) {
        setOrders(res.data);
        if (res.data.length > 0 && !selectedOrder) {
          setSelectedOrder(res.data[0]);
        }
      }
    } catch (err) {
      console.warn('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openContract = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/contract`);
      if (res.success) {
        setContractData(res.data);
        setShowContractModal(true);
      }
    } catch (err) {
      alert('Contract metadata unavailable.');
    }
  };

  const openReceipt = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/receipt`);
      if (res.success) {
        setReceiptData(res.data);
        setShowReceiptModal(true);
      }
    } catch (err) {
      alert('Receipt metadata unavailable.');
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <span className="badge badge-success">END-TO-END PROCUREMENT LIFECYCLE</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
          My Orders & Delivery Tracking
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Monitor contract execution, secure escrow payments, real-time GPS telemetry, and OTP delivery receipts.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading Procurement Orders...</div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
          <ShoppingBag size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3>No Procurement Orders Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Accepted negotiation bids will immediately appear here for escrow deposit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Order Selector List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Your Orders ({orders.length})</h3>
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className="glass-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: selectedOrder?.id === o.id ? '2px solid #10b981' : '1px solid var(--border-color)',
                  background: selectedOrder?.id === o.id ? 'var(--bg-muted)' : 'var(--bg-card)'
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
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{o.cropTitle}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {o.quantity} {o.unit} • ₹{Number(o.totalPrice).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Detailed View */}
          {selectedOrder && (
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Top Banner */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ORDER #{selectedOrder.orderNumber || selectedOrder.id}</div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedOrder.cropTitle}</h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Producer: <strong>{selectedOrder.farmerName}</strong> • Transporter: <strong>{selectedOrder.transporterName || 'Assigned'}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Value</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>
                    ₹{Number(selectedOrder.totalPrice).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Order Stepper */}
              <OrderTimeline
                timeline={selectedOrder.timeline || []}
                currentStatus={selectedOrder.status}
              />

              {/* Conditional Action Cards */}

              {/* If PAYMENT_PENDING or CONTRACT_CREATED */}
              {(selectedOrder.status === 'CONTRACT_CREATED' || selectedOrder.status === 'PAYMENT_PENDING' || selectedOrder.status === 'ACCEPTED') && (
                <div className="glass-card" style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706' }}>Action Required: Escrow Payment</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Deposit ₹{Number(selectedOrder.totalPrice).toLocaleString('en-IN')} into AgriNex Escrow to dispatch refrigerated logistics.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="btn btn-primary"
                  >
                    <CreditCard size={18} /> Make Escrow Payment (Demo)
                  </button>
                </div>
              )}

              {/* Live Delivery Map if IN_TRANSIT or TRANSPORT_ASSIGNED */}
              {(selectedOrder.status === 'IN_TRANSIT' || selectedOrder.status === 'TRANSPORT_ASSIGNED' || selectedOrder.status === 'PICKED_UP' || selectedOrder.status === 'DELIVERED') && (
                <DeliveryTrackerMap orderId={selectedOrder.id} />
              )}

              {/* Delivery OTP Handshake Card (Section 23) */}
              <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 700, fontSize: '0.8125rem' }}>
                    <KeyRound size={16} /> SECURE DELIVERY OTP HANDSHAKE
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Provide this code to the transporter only after inspecting the crop at your unloading dock.
                  </p>
                </div>

                <div style={{
                  background: 'var(--bg-muted)',
                  border: '2px dashed #10b981',
                  borderRadius: '12px',
                  padding: '8px 20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>6-Digit OTP</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '4px', color: '#10b981' }}>
                    {selectedOrder.deliveryOtp || '482915'}
                  </div>
                </div>
              </div>

              {/* Document Download Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openContract(selectedOrder.id)}
                  className="btn btn-secondary btn-sm"
                >
                  <FileText size={16} /> View Digital Contract
                </button>
                <button
                  onClick={() => openReceipt(selectedOrder.id)}
                  className="btn btn-secondary btn-sm"
                >
                  <Receipt size={16} /> View Tax Invoice & Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <PaymentModal
          order={selectedOrder}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            fetchOrders();
            setShowPaymentModal(false);
          }}
        />
      )}

      {/* Contract Modal */}
      {showContractModal && (
        <ContractModal
          contract={contractData}
          onClose={() => setShowContractModal(false)}
        />
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          receipt={receiptData}
          order={selectedOrder}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}
