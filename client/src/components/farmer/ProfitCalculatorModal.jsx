import React, { useState } from 'react';
import { Calculator, X, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

export default function ProfitCalculatorModal({ isOpen, onClose }) {
  const [cropName, setCropName] = useState('Red Onions');
  const [quantity, setQuantity] = useState(5000);
  const [sellingPrice, setSellingPrice] = useState(28);

  // Cost items
  const [seedCost, setSeedCost] = useState(12000);
  const [fertilizerCost, setFertilizerCost] = useState(15000);
  const [laborCost, setLaborCost] = useState(20000);
  const [transportCost, setTransportCost] = useState(8000);
  const [otherCost, setOtherCost] = useState(5000);

  if (!isOpen) return null;

  // Computations
  const totalRevenue = Number(quantity) * Number(sellingPrice);
  const totalCost = Number(seedCost) + Number(fertilizerCost) + Number(laborCost) + Number(transportCost) + Number(otherCost);
  const netProfit = totalRevenue - totalCost;
  const profitPerUnit = quantity > 0 ? +(netProfit / quantity).toFixed(2) : 0;
  const roi = totalCost > 0 ? +((netProfit / totalCost) * 100).toFixed(1) : 0;

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
        maxWidth: '580px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
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
            <Calculator size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Farmer Harvest Profit Margin Calculator</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Calculator Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Revenue Inputs */}
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase', marginBottom: '8px' }}>
              1. Yield & Expected Price
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Yield Quantity (kg)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Selling Price per kg (₹)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Cost Breakdown Inputs */}
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '8px' }}>
              2. Production & Cultivation Costs (₹)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Seeds / Seedlings (₹)</label>
                <input
                  type="number"
                  value={seedCost}
                  onChange={(e) => setSeedCost(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Fertilizer & Organic Inputs (₹)</label>
                <input
                  type="number"
                  value={fertilizerCost}
                  onChange={(e) => setFertilizerCost(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Harvest & Field Labor (₹)</label>
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Farm-to-Hub Transport (₹)</label>
                <input
                  type="number"
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Irrigation, Packaging & Other Costs (₹)</label>
              <input
                type="number"
                value={otherCost}
                onChange={(e) => setOtherCost(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Computed Results Banner */}
          <div style={{
            background: netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${netProfit >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '16px',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Gross Revenue:</span>
              <strong style={{ fontSize: '1rem' }}>₹{totalRevenue.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Cost of Production:</span>
              <strong style={{ fontSize: '1rem', color: '#ef4444' }}>- ₹{totalCost.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid var(--border-color)',
              paddingTop: '8px'
            }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Estimated Net Profit:</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: netProfit >= 0 ? '#059669' : '#dc2626' }}>
                ₹{netProfit.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '4px' }}>
              <span>Profit per kg: <strong>₹{profitPerUnit}</strong></span>
              <span>Return on Investment (ROI): <strong style={{ color: roi >= 0 ? '#059669' : '#dc2626' }}>{roi}%</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-surface)'
        }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
}
