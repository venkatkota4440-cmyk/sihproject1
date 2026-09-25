import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldCheck,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      if (statsRes.success) setStats(statsRes.data);

      const usersRes = await api.get('/admin/users');
      if (usersRes.success) setUsers(usersRes.data);

      const txnRes = await api.get('/admin/transactions');
      if (txnRes.success) setTransactions(txnRes.data);

      const logsRes = await api.get('/admin/audit-logs');
      if (logsRes.success) setAuditLogs(logsRes.data);
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyUser = async (userId) => {
    try {
      const res = await api.post(`/admin/users/${userId}/verify`);
      if (res.success) {
        alert('User KYC status verified successfully.');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Verification failed.');
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Title */}
      <div>
        <span className="badge badge-success">CENTRAL REGULATORY DESK</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
          AgriNex Administrative Control Center
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Platform monitoring, KYC identity verification, escrow ledger oversight, and tamper-evident audit logs.
        </p>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-6">
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Users</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {stats.users?.total || 4}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stats.users?.farmers} Farmers • {stats.users?.buyers} Buyers
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Gross Merchandise Value</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              ₹{Number(stats.financials?.gmv || 54000).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
              Direct Farm Trade
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Orders Executed</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
              {stats.orders?.total || 1}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Completion Rate: {stats.orders?.completionRate}%
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Market Listings</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {stats.listings?.active || 8}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
              Verified Quality
            </div>
          </div>
        </div>
      )}

      {/* Tabs Toolbar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { id: 'users', label: 'KYC & User Approvals', icon: Users },
          { id: 'transactions', label: 'Escrow Ledger', icon: DollarSign },
          { id: 'audit', label: 'Audit Logs', icon: FileText }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === t.id ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'var(--bg-muted)',
                color: activeTab === t.id ? '#ffffff' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: KYC Users */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Registered Stakeholders</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '10px 0' }}>NAME</th>
                <th style={{ padding: '10px 0' }}>EMAIL</th>
                <th style={{ padding: '10px 0' }}>ROLE</th>
                <th style={{ padding: '10px 0' }}>VERIFICATION</th>
                <th style={{ padding: '10px 0', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 700 }}>{u.name}</td>
                  <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span className="badge badge-neutral">{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 0' }}>
                    <span className={`badge ${u.isVerified ? 'badge-success' : 'badge-warning'}`}>
                      {u.isVerified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 0', textAlign: 'right' }}>
                    {!u.isVerified && (
                      <button
                        onClick={() => handleVerifyUser(u.id)}
                        className="btn btn-primary btn-sm"
                      >
                        <UserCheck size={14} /> Verify KYC
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Escrow Ledger */}
      {activeTab === 'transactions' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Escrow Settlements Ledger</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '10px 0' }}>RECEIPT NO</th>
                <th style={{ padding: '10px 0' }}>ORDER ID</th>
                <th style={{ padding: '10px 0' }}>METHOD</th>
                <th style={{ padding: '10px 0' }}>STATUS</th>
                <th style={{ padding: '10px 0', textAlign: 'right' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 700, fontFamily: 'monospace' }}>{t.receiptNumber}</td>
                  <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>{t.orderId}</td>
                  <td style={{ padding: '12px 0' }}>{t.paymentMethod}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span className="badge badge-success">{t.status}</span>
                  </td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                    ₹{Number(t.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Tamper-Evident System Audit Logs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'var(--bg-muted)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8125rem'
                }}
              >
                <div>
                  <strong style={{ color: '#059669' }}>[{log.action}]</strong> {log.details}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
