import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  Calculator,
  Store,
  CheckCircle2
} from 'lucide-react';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotals
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const {
    totalItems,
    totalQuantity,
    produceSubtotal,
    estimatedTransportCost,
    escrowPlatformFee,
    farmerNetValue,
    totalLandedCost
  } = getCartTotals();

  const handleEscrowCheckout = () => {
    closeCart();
    // Navigate to /payments with cart context state
    navigate('/payments', {
      state: {
        fromCart: true,
        depositAmount: totalLandedCost,
        itemCount: totalItems,
        cropsSummary: cartItems.map((i) => `${i.title} (${i.quantity} ${i.unit})`).join(', ')
      }
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={closeCart}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-translucent)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}
            >
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1875rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Wholesale Procurement Cart
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {totalItems} {totalItems === 1 ? 'commodity lot' : 'commodity lots'} • {totalQuantity.toLocaleString()} kg total
              </div>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'var(--bg-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--text-muted)'
                }}
              >
                <ShoppingCart size={32} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 6px' }}>
                Your Procurement Cart is Empty
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
                Browse verified farm-gate listings in the marketplace and add wholesale lots to start procurement.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/marketplace');
                }}
                className="btn btn-primary btn-sm"
              >
                <Store size={15} /> Explore Marketplace
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cartItems.map((item) => {
                const itemTotal = (Number(item.pricePerUnit) || 0) * (Number(item.quantity) || 0);

                return (
                  <div
                    key={item.id}
                    className="glass-card"
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      border: '1px solid var(--border-color)',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '68px',
                          height: '68px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4
                            style={{
                              fontSize: '0.9375rem',
                              fontWeight: 700,
                              margin: 0,
                              color: 'var(--text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px 4px'
                            }}
                            title="Remove lot"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Farmer: <strong>{item.farmerName}</strong> • {item.location?.district || 'Maharashtra'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            ₹{item.pricePerUnit} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {item.unit || 'kg'}</span>
                          </span>
                          {item.isOrganic && (
                            <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                              <Sparkles size={9} /> Organic
                            </span>
                          )}
                          <span className="badge badge-neutral" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                            {item.qualityGrade || 'Grade A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Lot Total */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px dashed var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 100)}
                          className="btn btn-secondary btn-sm"
                          style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Decrease 100 kg"
                        >
                          <Minus size={13} />
                        </button>
                        <input
                          type="number"
                          className="form-input"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          step="100"
                          min="100"
                          style={{
                            width: '84px',
                            padding: '4px 6px',
                            textAlign: 'center',
                            fontSize: '0.8125rem',
                            fontWeight: 700
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 100)}
                          className="btn btn-secondary btn-sm"
                          style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Increase 100 kg"
                        >
                          <Plus size={13} />
                        </button>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.unit || 'kg'}</span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Lot Total</div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={clearCart}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                >
                  <Trash2 size={13} /> Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Financial Breakdown */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Breakdown lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Produce Value ({totalQuantity.toLocaleString()} kg):</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{produceSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={14} color="#0284c7" /> Cold-Chain Reefer Freight (Est.):
                </span>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>₹{estimatedTransportCost.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} color="#10b981" /> 100% Escrow Protection:
                </span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>FREE (RBI Node Active)</span>
              </div>

              {/* AgriNex Formula Net Value Indicator */}
              <div
                style={{
                  margin: '4px 0',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px dashed rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem'
                }}
              >
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calculator size={13} color="#10b981" /> Farmer Net Value (Price - Transport):
                </span>
                <strong style={{ color: '#059669' }}>₹{farmerNetValue.toLocaleString('en-IN')}</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.0625rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border-color)'
                }}
              >
                <span>Total Procurement Cost:</span>
                <span style={{ color: '#10b981' }}>₹{totalLandedCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleEscrowCheckout}
                className="btn btn-aurora"
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 800,
                  fontSize: '0.9375rem'
                }}
              >
                <ShieldCheck size={18} /> Proceed to Escrow Vault Checkout <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  closeCart();
                  navigate('/cart');
                }}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Open Full Procurement Ledger View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
