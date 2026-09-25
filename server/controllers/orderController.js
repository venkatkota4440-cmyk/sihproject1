const db = require('../config/db');

// Get all orders for the current logged-in role
exports.getOrders = (req, res) => {
  try {
    const { role, id } = req.user;
    let orders = [];

    if (role === 'FARMER') {
      orders = db.find('orders', { farmerId: id });
    } else if (role === 'BUYER') {
      orders = db.find('orders', { buyerId: id });
    } else if (role === 'TRANSPORTER') {
      orders = db.find('orders', { transporterId: id });
    } else {
      // ADMIN
      orders = db.find('orders');
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single order with complete details
exports.getOrderById = (req, res) => {
  try {
    const order = db.findById('orders', req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const contract = db.findOne('contracts', { orderId: order.id });
    const payment = db.findOne('payments', { orderId: order.id });
    const delivery = db.findOne('deliveries', { orderId: order.id });

    res.json({
      success: true,
      data: {
        order,
        contract: contract || null,
        payment: payment || null,
        delivery: delivery || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update order status across lifecycle
exports.updateOrderStatus = (req, res) => {
  try {
    const { status, note } = req.body;
    const order = db.findById('orders', req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const timeline = order.timeline || [];
    timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status progressed to ${status.replace(/_/g, ' ')}`
    });

    const updates = { status, timeline };

    // If completed or confirmed, generate receipt if not already exists
    if (status === 'COMPLETED' || status === 'DELIVERED') {
      updates.completedAt = new Date().toISOString();
    }

    const updated = db.update('orders', order.id, updates);

    // Create delivery record if status is TRANSPORT_ASSIGNED
    if (status === 'TRANSPORT_ASSIGNED' && !db.findOne('deliveries', { orderId: order.id })) {
      db.insert('deliveries', {
        orderId: order.id,
        transporterId: order.transporterId || req.user.id,
        transporterName: order.transporterName || req.user.name,
        pickupLocation: { name: order.pickupAddress, coordinates: [20.076, 74.108] },
        dropoffLocation: { name: order.dropoffAddress, coordinates: [19.076, 73.003] },
        currentCoordinates: [20.076, 74.108],
        status: 'ASSIGNED',
        speedKmH: 0,
        etaMinutes: 180,
        distanceTotalKm: 165,
        distanceRemainingKm: 165,
        temperatureCelsius: 18.0,
        otp: order.deliveryOtp
      });
    }

    // Log audit
    db.insert('auditLogs', {
      action: 'ORDER_STATUS_UPDATED',
      performedBy: req.user.id,
      details: `Order ${order.orderNumber || order.id} moved to ${status}`
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Contract Details / Downloadable PDF metadata
exports.getOrderContract = (req, res) => {
  try {
    const contract = db.findOne('contracts', { orderId: req.params.id });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found for this order' });
    }
    res.json({
      success: true,
      data: contract
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Receipt / Invoice Data
exports.getOrderReceipt = (req, res) => {
  try {
    const order = db.findById('orders', req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const payment = db.findOne('payments', { orderId: order.id });
    const receiptData = {
      receiptNumber: payment ? payment.receiptNumber : `AGX-RCP-${order.id.slice(-5)}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      farmer: { name: order.farmerName, id: order.farmerId },
      buyer: { name: order.buyerName, id: order.buyerId },
      transporter: { name: order.transporterName, id: order.transporterId },
      items: [
        {
          crop: order.cropTitle,
          quantity: `${order.quantity} ${order.unit}`,
          rate: `₹${order.unitPrice}`,
          total: order.totalPrice
        }
      ],
      platformFee: 0,
      totalAmount: order.totalPrice,
      paymentMethod: payment ? payment.paymentMethod : 'Demo Escrow UPI',
      paymentStatus: 'PAID & SETTLED',
      deliveryStatus: order.status
    };

    res.json({
      success: true,
      data: receiptData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
