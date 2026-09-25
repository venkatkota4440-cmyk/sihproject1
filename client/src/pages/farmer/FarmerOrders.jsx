import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import OrderTimeline from '../../components/orders/OrderTimeline';
import DeliveryTrackerMap from '../../components/map/DeliveryTrackerMap';
import ContractModal from '../../components/orders/ContractModal';
import ReceiptModal from '../../components/orders/ReceiptModal';
import {
  ShoppingBag,
  Truck,
  FileText,
  Receipt,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
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
      console.warn('Farmer orders fetch error:', err);
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
        <span className="badge badge-success">DISPATCH & ESCROW TRACKER</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
          Farmer Orders & Dispatch ({orders.length})
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Monitor buyer payment deposits in escrow, assign transport, track transit, and receive bank settlements.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading Dispatched Orders...</div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
          <ShoppingBag size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3>No Orders Underway</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Accepted buyer bids will initialize here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Order Selector List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Orders Dispatched ({orders.length})</h3>
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
                  Buyer: {o.buyerName} • ₹{Number(o.totalPrice).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Details */}
          {selectedOrder && (
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ORDER #{selectedOrder.orderNumber || selectedOrder.id}</div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedOrder.cropTitle}</h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Purchaser: <strong>{selectedOrder.buyerName}</strong> • Transporter: <strong>{selectedOrder.transporterName || 'Kisan Logistics Express'}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Settlement Amount</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>
                    ₹{Number(selectedOrder.totalPrice).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                    Held in Protected Escrow
                  </div>
                </div>
              </div>

              {/* Order Stepper */}
              <OrderTimeline
                timeline={selectedOrder.timeline || []}
                currentStatus={selectedOrder.status}
              />

              {/* Live Delivery Map */}
              {(selectedOrder.status === 'IN_TRANSIT' || selectedOrder.status === 'TRANSPORT_ASSIGNED' || selectedOrder.status === 'PICKED_UP' || selectedOrder.status === 'DELIVERED') && (
                <DeliveryTrackerMap orderId={selectedOrder.id} />
              )}

              {/* Escrow Status Banner */}
              <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={24} color="#059669" />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.9375rem' }}>Payment Secured in Digital Escrow</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Buyer has deposited ₹{Number(selectedOrder.totalPrice).toLocaleString('en-IN')}. Funds disburse directly to your bank once delivery OTP is matched.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => openContract(selectedOrder.id)} className="btn btn-secondary btn-sm">
                  <FileText size={16} /> View Digital Contract
                </button>
                <button onClick={() => openReceipt(selectedOrder.id)} className="btn btn-secondary btn-sm">
                  <Receipt size={16} /> View Tax Invoice
                </button>
              </div>
            </div>
          )}
        </div>
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
