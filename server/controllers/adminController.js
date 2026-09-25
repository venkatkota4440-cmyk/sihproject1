const db = require('../config/db');

// Overall Platform Statistics
exports.getPlatformStats = (req, res) => {
  try {
    const users = db.find('users');
    const crops = db.find('crops');
    const orders = db.find('orders');
    const payments = db.find('payments');

    const totalFarmers = users.filter(u => u.role === 'FARMER').length;
    const totalBuyers = users.filter(u => u.role === 'BUYER').length;
    const totalTransporters = users.filter(u => u.role === 'TRANSPORTER').length;
    const activeListings = crops.filter(c => c.activeListing && c.isAvailable).length;

    const gmv = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
    const activeDeliveries = orders.filter(o => o.status === 'IN_TRANSIT' || o.status === 'TRANSPORT_ASSIGNED').length;

    res.json({
      success: true,
      data: {
        users: {
          total: users.length,
          farmers: totalFarmers,
          buyers: totalBuyers,
          transporters: totalTransporters
        },
        listings: {
          total: crops.length,
          active: activeListings
        },
        orders: {
          total: orders.length,
          completed: completedOrders,
          inTransit: activeDeliveries,
          completionRate: orders.length > 0 ? +((completedOrders / orders.length) * 100).toFixed(1) : 100
        },
        financials: {
          gmv,
          totalTransactions: payments.length,
          escrowHeld: orders.filter(o => o.status === 'PAYMENT_CONFIRMED' || o.status === 'IN_TRANSIT').reduce((s, o) => s + (o.totalPrice || 0), 0)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Manage Users
exports.getAllUsers = (req, res) => {
  try {
    const { role } = req.query;
    let users = db.find('users');
    if (role) {
      users = users.filter(u => u.role === role.toUpperCase());
    }

    const safeUsers = users.map(({ password, ...u }) => u);
    res.json({ success: true, data: safeUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify User (KYC / Identity)
exports.verifyUser = (req, res) => {
  try {
    const { id } = req.params;
    const user = db.findById('users', id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = db.update('users', id, {
      verificationStatus: 'VERIFIED',
      isVerified: true
    });

    db.insert('auditLogs', {
      action: 'USER_VERIFIED_BY_ADMIN',
      performedBy: req.user.id,
      details: `Admin verified KYC status for ${user.name} (${user.role})`
    });

    const { password, ...safe } = updated;
    res.json({ success: true, message: 'User verified successfully', data: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Transactions / Escrow Ledger
exports.getTransactions = (req, res) => {
  try {
    const payments = db.find('payments');
    payments.sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt));
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Audit Logs
exports.getAuditLogs = (req, res) => {
  try {
    const logs = db.find('auditLogs');
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
