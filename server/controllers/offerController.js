const db = require('../config/db');

// Create Offer (Buyer)
exports.createOffer = (req, res) => {
  try {
    const { cropId, quantity, offeredPrice, message } = req.body;
    if (!cropId || !quantity || !offeredPrice) {
      return res.status(400).json({
        success: false,
        message: 'Crop ID, quantity, and offered price per unit are required'
      });
    }

    const crop = db.findById('crops', cropId);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop listing not found' });
    }

    const farmer = db.findById('users', crop.farmerId);
    const buyer = req.user;

    const qtyNum = Number(quantity);
    const priceNum = Number(offeredPrice);
    const totalPrice = +(qtyNum * priceNum).toFixed(2);

    const newOffer = db.insert('offers', {
      cropId: crop.id,
      cropTitle: crop.title,
      cropImage: crop.images && crop.images[0] ? crop.images[0] : '',
      farmerId: crop.farmerId,
      farmerName: crop.farmerName,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerRating: buyer.rating || 4.8,
      quantity: qtyNum,
      unit: crop.unit || 'kg',
      offeredPrice: priceNum,
      totalPrice,
      message: message || `We would like to procure ${qtyNum} ${crop.unit || 'kg'} at ₹${priceNum}/${crop.unit || 'kg'}.`,
      status: 'PENDING',
      history: [
        {
          by: 'BUYER',
          price: priceNum,
          message: message || 'Initial proposal submitted',
          date: new Date().toISOString()
        }
      ]
    });

    // Create notification for Farmer
    db.insert('notifications', {
      userId: crop.farmerId,
      title: 'New Crop Offer Received!',
      message: `${buyer.name} offered ₹${priceNum}/${crop.unit || 'kg'} for ${qtyNum} ${crop.unit || 'kg'} of ${crop.title}.`,
      type: 'OFFER_RECEIVED',
      link: '/farmer/offers',
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully to farmer',
      data: newOffer
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Counter Offer (Farmer or Buyer)
exports.counterOffer = (req, res) => {
  try {
    const { counterPrice, message } = req.body;
    const offer = db.findById('offers', req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.farmerId !== req.user.id && offer.buyerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized for this negotiation' });
    }

    const priceNum = Number(counterPrice);
    const totalPrice = +(offer.quantity * priceNum).toFixed(2);
    const byRole = req.user.role === 'FARMER' ? 'FARMER' : 'BUYER';

    const history = offer.history || [];
    history.push({
      by: byRole,
      price: priceNum,
      message: message || `Counter-offer proposed: ₹${priceNum}/${offer.unit}`,
      date: new Date().toISOString()
    });

    const updated = db.update('offers', offer.id, {
      offeredPrice: priceNum,
      totalPrice,
      status: 'COUNTERED',
      history
    });

    // Notify opposite party
    const targetUserId = req.user.id === offer.farmerId ? offer.buyerId : offer.farmerId;
    db.insert('notifications', {
      userId: targetUserId,
      title: 'Counter-Offer Proposed',
      message: `${req.user.name} proposed a counter-rate of ₹${priceNum}/${offer.unit}.`,
      type: 'OFFER_COUNTERED',
      link: req.user.role === 'FARMER' ? '/buyer/offers' : '/farmer/offers',
      read: false
    });

    res.json({
      success: true,
      message: 'Counter-offer submitted',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Accept Offer (Farmer or Buyer) -> Automatically generates Contract & Order!
exports.acceptOffer = (req, res) => {
  try {
    const offer = db.findById('offers', req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const updatedOffer = db.update('offers', offer.id, {
      status: 'ACCEPTED',
      acceptedAt: new Date().toISOString()
    });

    const crop = db.findById('crops', offer.cropId) || {};
    const farmer = db.findById('users', offer.farmerId) || {};
    const buyer = db.findById('users', offer.buyerId) || {};
    const transporter = db.findOne('users', { role: 'TRANSPORTER' }) || {};

    const orderNumber = `AGX-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const contractNumber = `AGX-CTR-${Date.now().toString().slice(-6)}`;

    // 1. Generate Contract
    const contract = db.insert('contracts', {
      orderNumber,
      contractNumber,
      offerId: offer.id,
      farmerDetails: {
        id: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        location: farmer.location ? `${farmer.location.district || ''}, ${farmer.location.state || ''}` : 'Nashik, Maharashtra'
      },
      buyerDetails: {
        id: buyer.id,
        name: buyer.name,
        phone: buyer.phone,
        location: buyer.location ? `${buyer.location.district || ''}, ${buyer.location.state || ''}` : 'Mumbai, Maharashtra'
      },
      cropDetails: {
        cropTitle: offer.cropTitle,
        quantity: `${offer.quantity} ${offer.unit}`,
        rate: `₹${offer.offeredPrice} per ${offer.unit}`,
        totalAmount: offer.totalPrice
      },
      terms: 'Standard AgriNex Direct Fair Trade Terms. 1. Inspection upon gate arrival. 2. Demo payment released post OTP confirmation. 3. Dispute resolution under National Agriculture Market regulations.',
      signedAt: new Date().toISOString(),
      status: 'EXECUTED'
    });

    // 2. Generate Order in ACCEPTED state, awaiting payment
    const newOrder = db.insert('orders', {
      orderNumber,
      offerId: offer.id,
      buyerId: offer.buyerId,
      buyerName: offer.buyerName,
      farmerId: offer.farmerId,
      farmerName: offer.farmerName,
      transporterId: transporter.id || null,
      transporterName: transporter.name || 'Kisan Logistics Express',
      transporterPhone: transporter.phone || '+91 98450 54321',
      cropId: offer.cropId,
      cropTitle: offer.cropTitle,
      cropImage: offer.cropImage,
      quantity: offer.quantity,
      unit: offer.unit,
      unitPrice: offer.offeredPrice,
      totalPrice: offer.totalPrice,
      status: 'CONTRACT_CREATED',
      timeline: [
        { status: 'OFFER_CREATED', timestamp: offer.createdAt, note: 'Procurement offer submitted' },
        { status: 'ACCEPTED', timestamp: new Date().toISOString(), note: 'Offer terms agreed by both parties' },
        { status: 'CONTRACT_CREATED', timestamp: new Date().toISOString(), note: `Digital Contract ${contractNumber} generated` }
      ],
      deliveryOtp: `${Math.floor(100000 + Math.random() * 900000)}`,
      pickupAddress: farmer.location ? `${farmer.location.address || 'Farm Gate'}, ${farmer.location.district || 'Nashik'}` : 'Nashik Farm Gate',
      dropoffAddress: buyer.location ? `${buyer.location.address || 'APMC Yard'}, ${buyer.location.district || 'Mumbai'}` : 'Navi Mumbai Hub',
      contractId: contract.id
    });

    // Update contract with orderId
    db.update('contracts', contract.id, { orderId: newOrder.id });

    // Link offer to order
    db.update('offers', offer.id, { orderId: newOrder.id, contractId: contract.id });

    // Deduct crop available quantity if applicable
    if (crop.quantity && crop.quantity >= offer.quantity) {
      db.update('crops', crop.id, { quantity: crop.quantity - offer.quantity });
    }

    res.json({
      success: true,
      message: 'Offer accepted! Digital Contract and Order initialized.',
      data: {
        offer: updatedOffer,
        contract,
        order: newOrder
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject Offer
exports.rejectOffer = (req, res) => {
  try {
    const offer = db.findById('offers', req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const updated = db.update('offers', offer.id, {
      status: 'REJECTED',
      rejectedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Offer rejected', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel Offer (Buyer)
exports.cancelOffer = (req, res) => {
  try {
    const offer = db.findById('offers', req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const updated = db.update('offers', offer.id, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Offer cancelled', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get My Offers (Farmer or Buyer)
exports.getMyOffers = (req, res) => {
  try {
    const userRole = req.user.role;
    let offers = [];
    if (userRole === 'FARMER') {
      offers = db.find('offers', { farmerId: req.user.id });
    } else if (userRole === 'BUYER') {
      offers = db.find('offers', { buyerId: req.user.id });
    } else {
      offers = db.find('offers');
    }

    offers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: offers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
