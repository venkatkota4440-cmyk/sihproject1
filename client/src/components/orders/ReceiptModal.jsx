import React from 'react';
import { X, Receipt, Printer, CheckCircle2, QrCode } from 'lucide-react';

export default function ReceiptModal({ receipt, order, onClose }) {
  if (!receipt && !order) return null;

  const data = receipt || {
    receiptNumber: `AGX-RCP-${order?.id?.slice(-5) || '99412'}`,
    orderNumber: order?.orderNumber || 'AGX-ORD-88401',
    date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
    farmer: { name: order?.farmerName || 'Ramesh Patel' },
    buyer: { name: order?.buyerName || 'FreshDirect Wholesale' },
    transporter: { name: order?.transporterName || 'Kisan Logistics Express' },
    crop: order?.cropTitle || 'Red Onions',
    quantity: `${order?.quantity || 2000} ${order?.unit || 'kg'}`,
    rate: `₹${order?.unitPrice || 27}`,
    total: order?.totalPrice || 54000,
    paymentMethod: 'Demo UPI Escrow',
    deliveryStatus: order?.status || 'COMPLETED'
  };

  const handlePrint = () => {
    window.print();
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
        maxWidth: '560px',
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
            <Receipt size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Tax Invoice & Settlement Receipt</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Invoice Body */}
        <div style={{ padding: '28px', color: 'var(--text-main)', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>AgriNex Marketplace</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN: 27AABCA1234F1Z8</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vashi APMC Agri-Terminal, Navi Mumbai</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>INVOICE #{data.receiptNumber}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {data.date}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order: {data.orderNumber}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', background: 'var(--bg-muted)', padding: '14px', borderRadius: '12px' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>BILLED TO (BUYER):</div>
              <div style={{ fontWeight: 700 }}>{data.buyer?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUPPLIED BY (FARMER):</div>
              <div style={{ fontWeight: 700 }}>{data.farmer?.name}</div>
            </div>
          </div>

          {/* Items */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>COMMODITY</th>
                <th style={{ textAlign: 'center', padding: '8px 0' }}>QTY</th>
                <th style={{ textAlign: 'right', padding: '8px 0' }}>RATE</th>
                <th style={{ textAlign: 'right', padding: '8px 0' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>{data.crop}</td>
                <td style={{ padding: '12px 0', textAlign: 'center' }}>{data.quantity}</td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>{data.rate}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700 }}>₹{Number(data.total).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Platform Fee (0%):</span>
              <span>₹0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Refrigerated Transit:</span>
              <span>Included</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '1.1rem', fontWeight: 800, borderTop: '2px solid var(--border-color)', paddingTop: '8px' }}>
              <span>Total Settled:</span>
              <span style={{ color: '#059669' }}>₹{Number(data.total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Verification stamp */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.1)', padding: '12px 16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.8125rem', fontWeight: 700 }}>
              <CheckCircle2 size={18} /> Escrow Released & Transferred to Farmer Account
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Method: {data.paymentMethod}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          background: 'var(--bg-surface)'
        }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={16} /> Print Receipt
          </button>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
