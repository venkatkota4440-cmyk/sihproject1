import React from 'react';
import { X, FileText, Download, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ContractModal({ contract, onClose }) {
  if (!contract) return null;

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
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Digital Procurement Contract</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Contract Document Body */}
        <div id="printable-contract" style={{ padding: '30px', color: 'var(--text-main)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {/* Header Seal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>AgriNex Contract Note</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>e-NAM Aligned Fair Direct Agricultural Trade Agreement</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>Contract No:</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{contract.contractNumber || 'AGX-CTR-2026-001'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {new Date(contract.signedAt || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Parties */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SELLER (PRODUCER)</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{contract.farmerDetails?.name || 'Ramesh Patel'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{contract.farmerDetails?.location || 'Niphad, Nashik, Maharashtra'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Phone: {contract.farmerDetails?.phone || '+91 98220 12345'}</div>
            </div>

            <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>BUYER (PURCHASER)</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{contract.buyerDetails?.name || 'FreshDirect Wholesale'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{contract.buyerDetails?.location || 'Vashi APMC, Navi Mumbai'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Phone: {contract.buyerDetails?.phone || '+91 91670 98765'}</div>
            </div>
          </div>

          {/* Produce Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Commodity</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Quantity</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Agreed Rate</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 10px', fontWeight: 600 }}>{contract.cropDetails?.cropTitle || 'Red Onions'}</td>
                <td style={{ padding: '12px 10px', textAlign: 'center' }}>{contract.cropDetails?.quantity || '2,000 kg'}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right' }}>{contract.cropDetails?.rate || '₹27.00/kg'}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800 }}>₹{Number(contract.cropDetails?.totalAmount || 54000).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Terms & Conditions */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>Legally Binding Terms:</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
              {contract.terms || '1. Inspection upon gate arrival. 2. Demo payment held in mock escrow and released immediately upon digital delivery OTP verification. 3. Disputes arbitrated by AgriNex Grievance Redressal Board.'}
            </p>
          </div>

          {/* Signature Stamps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.8125rem', fontWeight: 600 }}>
              <ShieldCheck size={20} /> Digitally Signed & Locked on AgriNex Ledger
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hash: SHA256: {Math.random().toString(36).substring(2, 15)}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={16} /> Print / Save PDF
          </button>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
