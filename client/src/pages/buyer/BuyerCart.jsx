import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  Sparkles,
  Calculator,
  ArrowLeft,
  CheckCircle2,
  FileText,
  DollarSign
} from 'lucide-react';

export default function BuyerCart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotals
  } = useCart();

  const navigate = useNavigate();
  const [quotationSent, setQuotationSent] = useState(false);

  const {
    totalItems,
    totalQuantity,
    produceSubtotal,
    estimatedTransportCost,
    farmerNetValue,
    totalLandedCost
  } = getCartTotals();

  const handleEscrowProceed = () => {
    navigate('/payments', {
      state: {
        fromCart: true,
        depositAmount: totalLandedCost,
        itemCount: totalItems,
        cropsSummary: cartItems.map((i) => `${i.title} (${i.quantity} ${i.unit})`).join(', ')
      }
    });
  };

  const handleRequestQuotations = () => {
    setQuotationSent(true);
    setTimeout(() => {
      setQuotationSent(false);
      alert('🎉 Bulk procurement request broadcasted to all matched producers! You will receive response notifications in My Offers.');
    }, 1500);
  };

  return (
    <div className="container" style={{ padding: '36px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Breadcrumb & Title */}
      <div>
        <Link
          to="/marketplace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '12px'
          }}
        >
          <ArrowLeft size={16} /> Back to Wholesale Marketplace
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-success">BUYER PROCUREMENT</span>
              <span className="badge badge-neutral">ESCROW PROTECTED</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '4px' }}>
              Wholesale Bulk Procurement Cart
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Review your aggregated farm-gate orders, calculate net values with cold-chain logistics, and lock funds securely in the RBI Escrow Vault.
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Trash2 size={15} /> Clear All Lots
            </button>
          )}
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '20px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--text-muted)'
            }}
          >
            <ShoppingCart size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            No Commodities in Your Procurement Cart
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 24px', fontSize: '0.9375rem' }}>
            Search over 80+ crop varieties directly from verified farmers in Maharashtra, Punjab, Karnataka, and beyond.
          </p>
          <Link to="/marketplace" className="btn btn-aurora">
            Browse Wholesale Marketplace <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '28px' }} className="cart-grid-responsive">
          {/* Left Column: Cart Items Ledger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Procurement Lots ({totalItems} Commodities)
              </h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Total Quantity: <strong>{totalQuantity.toLocaleString()} kg</strong> ({(totalQuantity / 100).toFixed(1)} Quintals)
              </span>
            </div>

            {cartItems.map((item) => {
              const itemTotal = (Number(item.pricePerUnit) || 0) * (Number(item.quantity) || 0);

              return (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                            {item.category} • {item.variety}
                          </div>
                          <h4 style={{ fontSize: '1.1875rem', fontWeight: 800, margin: '2px 0 4px', color: 'var(--text-main)' }}>
                            {item.title}
                          </h4>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 10px', color: '#ef4444' }}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={14} color="#10b981" /> Farmer: <strong>{item.farmerName}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} color="#0284c7" /> {item.location?.district}, {item.location?.state}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {item.isOrganic && (
                          <span className="badge badge-success">
                            <Sparkles size={11} /> Certified Organic
                          </span>
                        )}
                        <span className="badge badge-neutral">{item.qualityGrade || 'Grade A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Price Calculation Controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rate per {item.unit || 'kg'}</div>
                      <div style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{item.pricePerUnit} <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {item.unit || 'kg'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Procurement Qty:</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 100)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        step="100"
                        min="100"
                        style={{ width: '100px', textAlign: 'center', fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 100)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.unit || 'kg'}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subtotal</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Wholesale Financial Settlement & Net Value */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              className="glass-card"
              style={{
                padding: '24px',
                borderRadius: '20px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
                Procurement Cost Summary
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Guaranteed price settlements with cold-chain allocation
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gross Produce Value:</span>
                  <span style={{ fontWeight: 700 }}>₹{produceSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={15} color="#0284c7" /> Cold-Chain Reefer Logistics:
                  </span>
                  <span style={{ fontWeight: 700, color: '#0284c7' }}>₹{estimatedTransportCost.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={15} color="#10b981" /> 100% Escrow Protection Fee:
                  </span>
                  <span style={{ fontWeight: 800, color: '#10b981' }}>₹0.00 (Zero Fee)</span>
                </div>

                {/* Documentation Formula Highlight Box */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px dashed rgba(16, 185, 129, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                    <Calculator size={14} /> Market-Price Calculator:
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                    <code>net value = price × quantity − transport cost</code>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    Farmer Net Realization: ₹{farmerNetValue.toLocaleString('en-IN')}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '14px',
                    borderTop: '2px solid var(--border-color)',
                    fontSize: '1.25rem',
                    fontWeight: 900
                  }}
                >
                  <span>Total Escrow Deposit:</span>
                  <span style={{ color: '#10b981' }}>₹{totalLandedCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '22px' }}>
                <button
                  onClick={handleEscrowProceed}
                  className="btn btn-aurora"
                  style={{
                    width: '100%',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 800,
                    fontSize: '1rem'
                  }}
                >
                  <ShieldCheck size={20} /> Lock in Digital Escrow Vault <ArrowRight size={18} />
                </button>

                <button
                  onClick={handleRequestQuotations}
                  disabled={quotationSent}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 700
                  }}
                >
                  <FileText size={17} /> {quotationSent ? 'Broadcasting Requests...' : 'Request Combined Farmer Quotation'}
                </button>
              </div>
            </div>

            {/* Escrow Guarantee Trust Banner */}
            <div
              className="glass-card"
              style={{
                padding: '18px',
                borderRadius: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                  100% Escrow Protection Guarantee
                </strong>
                Funds remain locked in virtual escrow until physical delivery verification and 6-digit OTP confirmation at your unloading warehouse.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
