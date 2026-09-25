import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  MessageSquareDiff,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function BuyerOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      const res = await api.get('/offers');
      if (res.success) setOffers(res.data);
    } catch (err) {
      console.warn('Offers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAccept = async (offerId) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/offers/${offerId}/accept`);
      if (res.success) {
        alert('🎉 Counter-offer accepted! Contract created. Proceed to payment in Orders.');
        navigate('/buyer/orders');
      }
    } catch (err) {
      alert(err.message || 'Failed to accept offer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (offerId) => {
    try {
      await api.post(`/offers/${offerId}/reject`);
      fetchOffers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <span className="badge badge-success">REAL-TIME NEGOTIATIONS</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
          My Offers & Price Negotiations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Active bids submitted to farmers. Real-time counter proposals and contract acceptance.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading Active Negotiations...</div>
      ) : offers.length === 0 ? (
        <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
          <MessageSquareDiff size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Active Offers Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Visit the marketplace to find fresh harvests and propose bids directly to farmers.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {offers.map((offer) => {
            const isCountered = offer.status === 'COUNTERED';
            const isAccepted = offer.status === 'ACCEPTED';

            return (
              <div
                key={offer.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderLeft: isCountered ? '4px solid #f59e0b' : isAccepted ? '4px solid #10b981' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{offer.cropTitle}</h3>
                      <span className={`badge ${
                        offer.status === 'ACCEPTED' ? 'badge-success' :
                        offer.status === 'COUNTERED' ? 'badge-warning' : 'badge-neutral'
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Producer: <strong>{offer.farmerName}</strong> • Quantity: <strong>{Number(offer.quantity).toLocaleString()} {offer.unit}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest Proposed Rate</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{offer.offeredPrice} <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>/ {offer.unit}</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669' }}>
                      Total: ₹{Number(offer.totalPrice).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* History Stepper / Messages */}
                {offer.history && offer.history.length > 0 && (
                  <div style={{ background: 'var(--bg-muted)', padding: '14px', borderRadius: '12px', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Negotiation Trail</div>
                    {offer.history.map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                          <strong>{h.by === 'BUYER' ? 'You' : offer.farmerName}:</strong> {h.message} (₹{h.price}/{offer.unit})
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  {isCountered && (
                    <>
                      <button
                        onClick={() => handleReject(offer.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <XCircle size={16} /> Decline
                      </button>
                      <button
                        onClick={() => handleAccept(offer.id)}
                        disabled={actionLoading}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 size={16} /> Accept Counter-Offer & Generate Contract
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => navigate('/buyer/orders')}
                      className="btn btn-primary btn-sm"
                    >
                      <FileText size={16} /> View Order & Complete Escrow Payment <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
