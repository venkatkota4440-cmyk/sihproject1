import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  MessageSquareDiff,
  CheckCircle2,
  XCircle,
  Tag,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function FarmerOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterModalOffer, setCounterModalOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      const res = await api.get('/offers');
      if (res.success) setOffers(res.data);
    } catch (err) {
      console.warn('Farmer offers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAccept = async (offerId) => {
    try {
      const res = await api.post(`/offers/${offerId}/accept`);
      if (res.success) {
        alert('🎉 Offer accepted! Digital contract generated and order created. View in Orders.');
        navigate('/farmer/orders');
      }
    } catch (err) {
      alert(err.message || 'Failed to accept offer.');
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

  const submitCounter = async (e) => {
    e.preventDefault();
    if (!counterPrice || !counterModalOffer) return;
    try {
      const res = await api.post(`/offers/${counterModalOffer.id}/counter`, {
        counterPrice: Number(counterPrice),
        message: counterMessage || `Best rate from farm storage is ₹${counterPrice}/${counterModalOffer.unit}`
      });
      if (res.success) {
        setCounterModalOffer(null);
        fetchOffers();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit counter offer.');
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <span className="badge badge-success">BUYER PROPOSALS & BIDS</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
          Incoming Harvest Offers ({offers.length})
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Review wholesale bids directly from buyers. Accept to lock digital contracts or propose a counter-rate.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading incoming offers...</div>
      ) : offers.length === 0 ? (
        <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
          <MessageSquareDiff size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3>No Offers Received Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            New bids from bulk buyers will appear here in real time.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {offers.map((offer) => {
            const isPending = offer.status === 'PENDING';
            const isAccepted = offer.status === 'ACCEPTED';
            const isCountered = offer.status === 'COUNTERED';

            return (
              <div
                key={offer.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderLeft: isPending ? '4px solid #10b981' : isCountered ? '4px solid #f59e0b' : '1px solid var(--border-color)',
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
                      Buyer: <strong>{offer.buyerName}</strong> • Requested Quantity: <strong>{Number(offer.quantity).toLocaleString()} {offer.unit}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offered Rate</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{offer.offeredPrice} <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>/ {offer.unit}</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669' }}>
                      Total Escrow Value: ₹{Number(offer.totalPrice).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Buyer Message */}
                {offer.message && (
                  <div style={{ background: 'var(--bg-muted)', padding: '12px 16px', borderRadius: '10px', fontSize: '0.875rem' }}>
                    <strong>Buyer Note:</strong> "{offer.message}"
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  {(isPending || isCountered) && (
                    <>
                      <button
                        onClick={() => handleReject(offer.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <XCircle size={16} /> Decline
                      </button>
                      <button
                        onClick={() => {
                          setCounterModalOffer(offer);
                          setCounterPrice(offer.offeredPrice + 2);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Tag size={16} /> Counter-Offer
                      </button>
                      <button
                        onClick={() => handleAccept(offer.id)}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 size={16} /> Accept & Sign Contract
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => navigate('/farmer/orders')}
                      className="btn btn-primary btn-sm"
                    >
                      <FileText size={16} /> View Order & Dispatch Status <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModalOffer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
              Propose Counter-Offer
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Propose your best price to buyer {counterModalOffer.buyerName}
            </p>

            <form onSubmit={submitCounter} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Counter Price per {counterModalOffer.unit} (₹)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Message to Buyer
                </label>
                <textarea
                  rows="2"
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="e.g. This is Grade A export quality cured stock."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setCounterModalOffer(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Send Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
