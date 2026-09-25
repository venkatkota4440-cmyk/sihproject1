const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedInitialData() {
  const existingUsers = db.find('users');
  if (existingUsers.length > 0) {
    return; // Already seeded
  }

  console.log('Seeding AgriNex demonstration data...');

  const passwordHash = await bcrypt.hash('AgriNex@123', 10);
  const farmerPassHash = await bcrypt.hash('Farmer@123', 10);
  const buyerPassHash = await bcrypt.hash('Buyer@123', 10);
  const transPassHash = await bcrypt.hash('Transporter@123', 10);
  const adminPassHash = await bcrypt.hash('Admin@123', 10);

  // 1. Users
  const farmer = db.insert('users', {
    id: 'user_farmer_1',
    name: 'Ramesh Patel',
    email: 'farmer@agrinex.com',
    phone: '+91 98220 12345',
    password: farmerPassHash,
    role: 'FARMER',
    location: {
      address: 'Niphad Taluka',
      district: 'Nashik',
      state: 'Maharashtra',
      coordinates: [20.076, 74.108]
    },
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
    verificationStatus: 'VERIFIED',
    farmInfo: {
      farmName: 'Patel Bio-Green Farms',
      farmSize: '15.5 Acres',
      mainCrops: ['Red Onions', 'Organic Tomatoes', 'Table Grapes'],
      certifications: ['India Organic Certified', 'NPOP Grade A']
    },
    rating: 4.9,
    reviewsCount: 38,
    isVerified: true
  });

  const buyer = db.insert('users', {
    id: 'user_buyer_1',
    name: 'FreshDirect Wholesale',
    email: 'buyer@agrinex.com',
    phone: '+91 91670 98765',
    password: buyerPassHash,
    role: 'BUYER',
    location: {
      address: 'Vashi APMC Complex',
      district: 'Navi Mumbai',
      state: 'Maharashtra',
      coordinates: [19.076, 73.003]
    },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    verificationStatus: 'VERIFIED',
    companyName: 'FreshDirect Organics Pvt Ltd',
    rating: 4.8,
    reviewsCount: 52,
    isVerified: true
  });

  const transporter = db.insert('users', {
    id: 'user_transporter_1',
    name: 'Kisan Logistics Express',
    email: 'transporter@agrinex.com',
    phone: '+91 98450 54321',
    password: transPassHash,
    role: 'TRANSPORTER',
    location: {
      address: 'Chakan Industrial Zone',
      district: 'Pune',
      state: 'Maharashtra',
      coordinates: [18.756, 73.856]
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    verificationStatus: 'VERIFIED',
    vehicleDetails: {
      vehicleType: 'Refrigerated 10-Ton Eicher Pro',
      registrationNumber: 'MH-12-QX-4890',
      capacityKg: 10000,
      temperatureControl: true
    },
    rating: 4.95,
    completedTrips: 146,
    isVerified: true
  });

  const admin = db.insert('users', {
    id: 'user_admin_1',
    name: 'AgriNex Admin',
    email: 'admin@agrinex.com',
    phone: '+91 98000 00000',
    password: adminPassHash,
    role: 'ADMIN',
    location: {
      address: 'Tech Innovation Park',
      district: 'Bengaluru',
      state: 'Karnataka',
      coordinates: [12.971, 77.594]
    },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    verificationStatus: 'VERIFIED',
    isVerified: true
  });

  // 2. Initial Crops
  const cropList = [
    {
      id: 'crop_1',
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerRating: farmer.rating,
      title: 'Premium Nashik Red Onions',
      category: 'Vegetables',
      variety: 'Garwa / N-53 Red',
      quantity: 5000,
      unit: 'kg',
      pricePerUnit: 28,
      minPrice: 24,
      harvestDate: '2026-09-10',
      qualityGrade: 'Grade A',
      isOrganic: true,
      description: 'Cured, sun-dried, pesticide-free Grade A Nashik Red Onions. Uniform size (55mm+), firm skin, zero sprouting. Direct from farm storage in Niphad.',
      location: { district: 'Nashik', state: 'Maharashtra', coordinates: [20.076, 74.108] },
      images: [
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600',
        'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=600'
      ],
      isAvailable: true,
      activeListing: true,
      views: 312
    },
    {
      id: 'crop_2',
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerRating: farmer.rating,
      title: 'Devgad Alphonso Hapus Mangoes',
      category: 'Fruits',
      variety: 'Alphonso (Hapus)',
      quantity: 1200,
      unit: 'kg',
      pricePerUnit: 340,
      minPrice: 300,
      harvestDate: '2026-09-15',
      qualityGrade: 'Export Grade',
      isOrganic: true,
      description: 'Naturally ripened on hay bed without carbide. Rich saffron pulp, sweet aroma, GI Tagged authentic coastal Konkan harvest.',
      location: { district: 'Ratnagiri', state: 'Maharashtra', coordinates: [16.99, 73.31] },
      images: [
        'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
        'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600'
      ],
      isAvailable: true,
      activeListing: true,
      views: 520
    },
    {
      id: 'crop_3',
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerRating: farmer.rating,
      title: 'Traditional Basmati Paddy (1121)',
      category: 'Grains',
      variety: 'Pusa Basmati 1121',
      quantity: 12000,
      unit: 'kg',
      pricePerUnit: 48,
      minPrice: 42,
      harvestDate: '2026-09-01',
      qualityGrade: 'Grade A',
      isOrganic: false,
      description: 'Extra-long slender grain, 8.4mm average kernel length, aged naturally, low moisture (11.5%), ideal for export and premium wholesale.',
      location: { district: 'Karnal', state: 'Haryana', coordinates: [29.685, 76.99] },
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'
      ],
      isAvailable: true,
      activeListing: true,
      views: 420
    },
    {
      id: 'crop_4',
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerRating: farmer.rating,
      title: 'Vine-Ripened Greenhouse Tomatoes',
      category: 'Vegetables',
      variety: 'Abhinav Hybrid F1',
      quantity: 3500,
      unit: 'kg',
      pricePerUnit: 32,
      minPrice: 28,
      harvestDate: '2026-09-20',
      qualityGrade: 'Grade A',
      isOrganic: true,
      description: 'Hydroponic/polyhouse grown, firm red fruit, high brix sugar content, no skin blemishes. Packed in 25kg standard crates.',
      location: { district: 'Pune', state: 'Maharashtra', coordinates: [18.52, 73.85] },
      images: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600'
      ],
      isAvailable: true,
      activeListing: true,
      views: 290
    },
    {
      id: 'crop_5',
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerRating: farmer.rating,
      title: 'Organic Golden Turmeric Fingers',
      category: 'Spices',
      variety: 'Salem / Lakadong High Curcumin',
      quantity: 2500,
      unit: 'kg',
      pricePerUnit: 145,
      minPrice: 130,
      harvestDate: '2026-08-25',
      qualityGrade: 'Export Grade',
      isOrganic: true,
      description: 'Cured and polished dry whole turmeric with lab-tested 5.8% curcumin level. Deep golden yellow color, zero synthetic dyes or polishing agents.',
      location: { district: 'Erode', state: 'Tamil Nadu', coordinates: [11.341, 77.717] },
      images: [
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600'
      ],
      isAvailable: true,
      activeListing: true,
      views: 185
    },
    {
      id: 'crop_6',
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerRating: farmer.rating,
      title: 'Sharbati Wheat (Sehore Golden)',
      category: 'Grains',
      variety: 'Sharbati C-306',
      quantity: 8000,
      unit: 'kg',
      pricePerUnit: 42,
      minPrice: 38,
      harvestDate: '2026-08-10',
      qualityGrade: 'Grade A',
      isOrganic: true,
      description: 'Lustrous, heavy golden grains naturally rain-fed in black cotton soil of Sehore. High protein gluten content, perfect for artisan soft rotis.',
      location: { district: 'Sehore', state: 'Madhya Pradesh', coordinates: [23.203, 77.084] },
      images: [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600'
      ],
      isAvailable: true,
      activeListing: true,
      views: 310
    },
    {
      id: 'crop_7',
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerRating: farmer.rating,
      title: 'Fresh Sweet Green Capsicum',
      category: 'Vegetables',
      variety: 'Indra Bell Pepper',
      quantity: 1800,
      unit: 'kg',
      pricePerUnit: 52,
      minPrice: 45,
      harvestDate: '2026-09-22',
      qualityGrade: 'Grade A',
      isOrganic: false,
      description: 'Crisp, thick-walled bell peppers with glossy dark green skin. Harvested early morning to preserve crispness and shelf life.',
      location: { district: 'Belagavi', state: 'Karnataka', coordinates: [15.849, 74.497] },
      images: [
        'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600'
      ],
      isAvailable: true,
      activeListing: true,
      views: 140
    },
    {
      id: 'crop_8',
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerRating: farmer.rating,
      title: 'Nagpur Mandarin Sweet Oranges',
      category: 'Fruits',
      variety: 'Nagpur Santra',
      quantity: 4000,
      unit: 'kg',
      pricePerUnit: 65,
      minPrice: 58,
      harvestDate: '2026-09-18',
      qualityGrade: 'Grade A',
      isOrganic: true,
      description: 'Juicy, thin-skinned, seedless Nagpur oranges. High vitamin C, balanced sweet-tart profile, sorted and graded mechanically.',
      location: { district: 'Nagpur', state: 'Maharashtra', coordinates: [21.145, 79.088] },
      images: [
        'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600'
      ],
      isAvailable: true,
      activeListing: true,
      views: 220
    }
  ];

  cropList.forEach(crop => db.insert('crops', crop));

  // 3. APMC Market Mandi Prices (with DEMO vs REAL status clearly labeled)
  const mandiPrices = [
    {
      cropName: 'Red Onions',
      district: 'Nashik',
      state: 'Maharashtra',
      market: 'Lasalgaon APMC',
      modalPrice: 28.5,
      minPrice: 22.0,
      maxPrice: 31.0,
      previousPrice: 26.8,
      changePercent: +6.34,
      trend: 'UP',
      volumeTonnes: 1420,
      date: '2026-09-24',
      isRealData: false,
      isDemoData: true,
      dataSource: 'AgriNex APMC Aggregator Feed'
    },
    {
      cropName: 'Alphonso Mangoes',
      district: 'Ratnagiri',
      state: 'Maharashtra',
      market: 'Vashi Wholesale Market',
      modalPrice: 345.0,
      minPrice: 290.0,
      maxPrice: 380.0,
      previousPrice: 360.0,
      changePercent: -4.16,
      trend: 'DOWN',
      volumeTonnes: 85,
      date: '2026-09-24',
      isRealData: false,
      isDemoData: true,
      dataSource: 'AgriNex APMC Aggregator Feed'
    },
    {
      cropName: 'Basmati Paddy 1121',
      district: 'Karnal',
      state: 'Haryana',
      market: 'Taraori APMC Mandi',
      modalPrice: 48.0,
      minPrice: 44.5,
      maxPrice: 51.0,
      previousPrice: 47.2,
      changePercent: +1.69,
      trend: 'UP',
      volumeTonnes: 3200,
      date: '2026-09-24',
      isRealData: false,
      isDemoData: true,
      dataSource: 'AgriNex APMC Aggregator Feed'
    },
    {
      cropName: 'Hybrid Tomatoes',
      district: 'Pune',
      state: 'Maharashtra',
      market: 'Narayangaon Tomato Market',
      modalPrice: 32.0,
      minPrice: 25.0,
      maxPrice: 36.0,
      previousPrice: 34.5,
      changePercent: -7.24,
      trend: 'DOWN',
      volumeTonnes: 950,
      date: '2026-09-24',
      isRealData: false,
      isDemoData: true,
      dataSource: 'AgriNex APMC Aggregator Feed'
    },
    {
      cropName: 'Golden Turmeric',
      district: 'Erode',
      state: 'Tamil Nadu',
      market: 'Erode Regulated Market',
      modalPrice: 142.0,
      minPrice: 130.0,
      maxPrice: 155.0,
      previousPrice: 138.0,
      changePercent: +2.89,
      trend: 'UP',
      volumeTonnes: 450,
      date: '2026-09-24',
      isRealData: false,
      isDemoData: true,
      dataSource: 'AgriNex APMC Aggregator Feed'
    }
  ];

  mandiPrices.forEach(p => db.insert('marketPrices', p));

  // 4. Sample Buyer Requirement
  db.insert('requirements', {
    id: 'req_1',
    buyerId: buyer.id,
    buyerName: buyer.name,
    cropName: 'Red Onions',
    category: 'Vegetables',
    quantity: 3000,
    unit: 'kg',
    maxPrice: 30,
    qualityGrade: 'Grade A',
    isOrganic: true,
    location: { district: 'Mumbai', state: 'Maharashtra' },
    deliveryDate: '2026-10-02',
    status: 'ACTIVE',
    matchedFarmerCount: 3
  });

  // 5. Complete Active Demo Order for live tracking demo
  const sampleOffer = db.insert('offers', {
    id: 'offer_demo_101',
    buyerId: buyer.id,
    buyerName: buyer.name,
    farmerId: farmer.id,
    farmerName: farmer.name,
    cropId: 'crop_1',
    cropTitle: 'Premium Nashik Red Onions',
    quantity: 2000,
    unit: 'kg',
    offeredPrice: 27,
    totalPrice: 54000,
    message: 'We require 2,000 kg for our Navi Mumbai distribution warehouse. Delivery required in 48 hours.',
    status: 'ACCEPTED',
    history: [
      { by: 'BUYER', price: 25, message: 'Initial procurement bid at ₹25/kg', date: '2026-09-23T10:00:00Z' },
      { by: 'FARMER', price: 27, message: 'Best price for Grade A sun-cured is ₹27/kg', date: '2026-09-23T11:30:00Z' },
      { by: 'BUYER', price: 27, message: 'Agreed! Proceeding to contract & payment.', date: '2026-09-23T12:00:00Z' }
    ]
  });

  const sampleContract = db.insert('contracts', {
    id: 'contract_demo_201',
    orderId: 'order_demo_301',
    offerId: sampleOffer.id,
    contractNumber: 'AGX-CTR-2026-0924-001',
    farmerDetails: {
      name: farmer.name,
      phone: farmer.phone,
      location: 'Niphad, Nashik, Maharashtra'
    },
    buyerDetails: {
      name: buyer.name,
      phone: buyer.phone,
      location: 'Vashi, Navi Mumbai, Maharashtra'
    },
    cropDetails: {
      crop: 'Premium Nashik Red Onions',
      variety: 'Garwa / N-53 Red',
      quantity: '2,000 kg',
      agreedRate: '₹27.00 per kg',
      totalAmount: 54000
    },
    terms: '1. Quality parameters confirm to FSSAI & NPOP Grade A standards. 2. Demo payment held in mock escrow until digital OTP verification at delivery. 3. Dispute resolution via AgriNex Arbitrary Board.',
    signedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'EXECUTED'
  });

  const samplePayment = db.insert('payments', {
    id: 'pay_demo_401',
    orderId: 'order_demo_301',
    payerId: buyer.id,
    amount: 54000,
    paymentMethod: 'UPI',
    transactionId: 'UPI/20260924/889210041',
    status: 'SUCCESS',
    receiptNumber: 'AGX-RCP-99412',
    paidAt: new Date(Date.now() - 3600000 * 4).toISOString()
  });

  const sampleOrder = db.insert('orders', {
    id: 'order_demo_301',
    orderNumber: 'AGX-ORD-88401',
    offerId: sampleOffer.id,
    buyerId: buyer.id,
    buyerName: buyer.name,
    farmerId: farmer.id,
    farmerName: farmer.name,
    transporterId: transporter.id,
    transporterName: transporter.name,
    transporterPhone: transporter.phone,
    cropId: 'crop_1',
    cropTitle: 'Premium Nashik Red Onions',
    quantity: 2000,
    unit: 'kg',
    unitPrice: 27,
    totalPrice: 54000,
    status: 'IN_TRANSIT',
    timeline: [
      { status: 'OFFER_CREATED', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), note: 'Offer submitted by Buyer' },
      { status: 'ACCEPTED', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), note: 'Offer accepted by Farmer' },
      { status: 'CONTRACT_CREATED', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), note: 'Digital contract executed' },
      { status: 'PAYMENT_CONFIRMED', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'Demo payment held in escrow' },
      { status: 'TRANSPORT_ASSIGNED', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), note: 'Kisan Logistics Express assigned' },
      { status: 'PICKED_UP', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Consignment loaded at farm gate' },
      { status: 'IN_TRANSIT', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), note: 'Vehicle en route on NH-160 highway' }
    ],
    deliveryOtp: '482915',
    pickupAddress: 'Patel Bio-Green Farms, Niphad, Nashik',
    dropoffAddress: 'FreshDirect Hub, APMC Yard Vashi, Navi Mumbai',
    contractId: sampleContract.id,
    paymentId: samplePayment.id
  });

  // 6. Delivery Tracking details
  db.insert('deliveries', {
    id: 'del_demo_501',
    orderId: sampleOrder.id,
    transporterId: transporter.id,
    transporterName: transporter.name,
    vehicleNumber: 'MH-12-QX-4890',
    pickupLocation: {
      name: 'Niphad Farm Gate, Nashik',
      coordinates: [20.076, 74.108]
    },
    dropoffLocation: {
      name: 'APMC Market Hub, Vashi, Navi Mumbai',
      coordinates: [19.076, 73.003]
    },
    currentCoordinates: [19.62, 73.55], // On route near Kasara Ghat / Asangaon
    status: 'IN_TRANSIT',
    speedKmH: 52,
    etaMinutes: 75,
    distanceTotalKm: 165,
    distanceRemainingKm: 62,
    temperatureCelsius: 18.2,
    otp: '482915'
  });

  // 7. Initial Chat between Farmer and Buyer
  db.insert('messages', {
    id: 'msg_1',
    conversationId: `${farmer.id}_${buyer.id}`,
    senderId: buyer.id,
    senderName: buyer.name,
    receiverId: farmer.id,
    orderId: sampleOrder.id,
    text: 'Hello Ramesh ji, we accepted the counter-offer for the 2,000 kg red onions. The consignment is urgently needed for retail packaging.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: true
  });

  db.insert('messages', {
    id: 'msg_2',
    conversationId: `${farmer.id}_${buyer.id}`,
    senderId: farmer.id,
    senderName: farmer.name,
    receiverId: buyer.id,
    orderId: sampleOrder.id,
    text: 'Namaste! The crates are pre-sorted and loaded into Kisan Logistics refrigerated truck. Temperature maintained at 18°C.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: true
  });

  // 8. Audit logs
  db.insert('auditLogs', {
    id: 'audit_1',
    action: 'SYSTEM_INITIALIZATION',
    performedBy: 'SYSTEM',
    details: 'Initial database seed completed with 4 role accounts, 8 crops, and live demo order.',
    timestamp: new Date().toISOString()
  });

  console.log('Demonstration data seeded successfully!');
}

module.exports = { seedInitialData };
