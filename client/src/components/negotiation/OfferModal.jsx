import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Send, ShieldCheck, Tag, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function OfferModal({ crop, onClose, onOfferSubmitted }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(crop ? Math.min(1000, crop.quantity || 500) : 500);
  const [offeredPrice, setOfferedPrice] = useState(crop ? crop.pricePerUnit : 30);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!crop) return null;

  const totalValue = +(quantity * offeredPrice).toFixed(2);
  const discountPercent = +(((crop.pricePerUnit - offeredPrice) / crop.pricePerUnit) * 100).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in or select a Demo Role (Buyer) to submit an offer.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/offers', {
        cropId: crop.id,
        quantity: Number(quantity),
        offeredPrice: Number(offeredPrice),
        message
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onOfferSubmitted) onOfferSubmitted(res.data);
          onClose();
        }, 1400);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit offer.');
    } finally {
      setSubmitting(false);
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
        boxShadow: 'var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Propose Negotiation Offer
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Direct bidding for {crop.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>Offer Submitted Successfully!</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Farmer {crop.farmerName} has received your bid. You will receive an instant notification once reviewed.
              </p>
            </div>
          ) : (
            <>
              {/* Crop Benchmark Reference Card */}
              <div style={{
                background: 'var(--bg-muted)',
                padding: '12px 16px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Farmer's Listed Rate</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{crop.pricePerUnit} / {crop.unit || 'kg'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min Acceptable Rate</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>₹{crop.minPrice || Math.round(crop.pricePerUnit * 0.85)} / {crop.unit || 'kg'}</div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Procurement Quantity ({crop.unit || 'kg'})
                </label>
                <input
                  type="number"
                  min="1"
                  max={crop.quantity || 10000}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="form-input"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Available in farm inventory: {Number(crop.quantity).toLocaleString()} {crop.unit || 'kg'}
                </span>
              </div>

              {/* Offered Price */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Your Offer Price per {crop.unit || 'kg'} (₹)
                  </label>
                  {discountPercent > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                      {discountPercent}% below asking rate
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Total Summary */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '14px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>Total Offer Value</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹{totalValue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  Protected by AgriNex<br />Digital Escrow
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Notes / Quality Specifications (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Need harvest delivered in 25kg crates by Friday."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 2, fontWeight: 700, padding: '12px' }}>
                  <Send size={16} /> {submitting ? 'Submitting Bid...' : 'Submit Official Offer'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
