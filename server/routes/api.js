const express = require('express');
const router = express.Router();

const { authenticate, optionalAuthenticate, authorizeRoles } = require('../middleware/auth');
const authCtrl = require('../controllers/authController');
const cropCtrl = require('../controllers/cropController');
const offerCtrl = require('../controllers/offerController');
const orderCtrl = require('../controllers/orderController');
const paymentCtrl = require('../controllers/paymentController');
const deliveryCtrl = require('../controllers/deliveryController');
const chatCtrl = require('../controllers/chatController');
const marketCtrl = require('../controllers/marketController');
const aiCtrl = require('../controllers/aiController');
const adminCtrl = require('../controllers/adminController');
const reqCtrl = require('../controllers/requirementController');
const intelCtrl = require('../controllers/intelligenceController');

// 1. Auth Routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/login-otp', authCtrl.loginWithOtp);
router.post('/auth/send-otp', authCtrl.sendOtp);
router.post('/auth/demo-login', authCtrl.demoLogin);
router.post('/auth/verify-otp', authCtrl.verifyOtp);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.post('/auth/reset-password', authCtrl.resetPassword);
router.post('/auth/logout', authCtrl.logout);
router.get('/auth/profile', authenticate, authCtrl.getProfile);
router.put('/auth/profile', authenticate, authCtrl.updateProfile);

// 2. Crop Marketplace & Catalog Routes
router.get('/crops', cropCtrl.getAllCrops);
router.get('/crop-catalog', cropCtrl.getCropCatalog);
router.get('/crop-catalog/categories', cropCtrl.getCatalogCategories);
router.get('/crops/farmer/my-crops', authenticate, authorizeRoles('FARMER', 'ADMIN'), cropCtrl.getMyCrops);
router.get('/crops/:id', cropCtrl.getCropById);
router.post('/crops', optionalAuthenticate, cropCtrl.createCrop);
router.put('/crops/:id', authenticate, authorizeRoles('FARMER', 'ADMIN'), cropCtrl.updateCrop);
router.delete('/crops/:id', authenticate, authorizeRoles('FARMER', 'ADMIN'), cropCtrl.deleteCrop);

// 3. Buyer Requirements Routes
router.get('/requirements', reqCtrl.getRequirements);
router.post('/requirements', authenticate, authorizeRoles('BUYER', 'ADMIN'), reqCtrl.createRequirement);
router.get('/requirements/farmer-matches', authenticate, reqCtrl.getFarmerMatches);
router.get('/requirements/:id/match', reqCtrl.getMatchedFarmers);

// 4. Offer & Negotiation Routes
router.get('/offers', authenticate, offerCtrl.getMyOffers);
router.post('/offers', authenticate, authorizeRoles('BUYER', 'ADMIN'), offerCtrl.createOffer);
router.post('/offers/:id/counter', authenticate, offerCtrl.counterOffer);
router.post('/offers/:id/accept', authenticate, offerCtrl.acceptOffer);
router.post('/offers/:id/reject', authenticate, offerCtrl.rejectOffer);
router.post('/offers/:id/cancel', authenticate, offerCtrl.cancelOffer);

// 5. Order Management Routes
router.get('/orders', authenticate, orderCtrl.getOrders);
router.get('/orders/:id', authenticate, orderCtrl.getOrderById);
router.post('/orders/:id/status', authenticate, orderCtrl.updateOrderStatus);
router.get('/orders/:id/contract', authenticate, orderCtrl.getOrderContract);
router.get('/orders/:id/receipt', authenticate, orderCtrl.getOrderReceipt);

// 6. Payment & Escrow Vault Routes
router.get('/payments', optionalAuthenticate, paymentCtrl.getPayments);
router.get('/payments/escrow-stats', paymentCtrl.getEscrowStats);
router.post('/payments/create', optionalAuthenticate, paymentCtrl.createPaymentIntent);
router.post('/payments/verify', optionalAuthenticate, paymentCtrl.verifyPayment);
router.post('/payments/escrow-deposit', optionalAuthenticate, paymentCtrl.simulateEscrowDeposit);
router.post('/payments/escrow-release', optionalAuthenticate, paymentCtrl.releaseEscrow);

// 7. Delivery & GPS Tracking Routes
router.get('/delivery/:id', deliveryCtrl.getDeliveryByOrderId);
router.post('/delivery/:id/status', authenticate, deliveryCtrl.updateDeliveryStatus);
router.post('/delivery/:id/location', authenticate, deliveryCtrl.updateLocation);
router.post('/delivery/:id/otp', authenticate, deliveryCtrl.verifyDeliveryOtp);

// 8. Chat Routes
router.get('/messages', authenticate, chatCtrl.getMessages);
router.post('/messages', authenticate, chatCtrl.sendMessage);

// 9. Market Mandi Prices & Real-Time Price Discovery Pipeline
router.get('/market-prices', marketCtrl.getMarketPrices);
router.get('/market-prices/latest', marketCtrl.getLatestPrice);
router.get('/market-prices/search', marketCtrl.searchMarketPrices);
router.get('/market-prices/commodity/:commodity', marketCtrl.getByCommodity);
router.get('/market-prices/state/:state', marketCtrl.getByState);
router.get('/market-prices/market/:market', marketCtrl.getByMarket);
router.get('/market-prices/history', marketCtrl.getPriceHistory);
router.get('/market-prices/trends', marketCtrl.getPriceHistory);
router.get('/market-prices/compare', marketCtrl.compareMarkets);
router.get('/market-prices/states', marketCtrl.getStates);
router.get('/market-prices/districts', marketCtrl.getDistricts);
router.get('/market-prices/markets', marketCtrl.getMarkets);
router.get('/market-prices/predict', marketCtrl.predictPrice);
router.get('/market-prices/status', marketCtrl.getPipelineStatus);
router.post('/market-prices/refresh', marketCtrl.refreshMarketData);
router.get('/market-prices/alerts', authenticate, marketCtrl.getMyPriceAlerts);
router.post('/market-prices/alerts', authenticate, marketCtrl.createPriceAlert);
router.get('/market-prices/:crop', marketCtrl.getCropPrice);
router.get('/market-prices/:crop/:market', marketCtrl.getCropMarketPrice);

// 10. Smart Market Intelligence & AI Recommendation Engine
router.get('/market-intelligence/historical', marketCtrl.getHistoricalIntelligence);
router.get('/market-intelligence/crop-analysis', marketCtrl.getCropIntelligenceAnalysis);
router.get('/market-intelligence/arbitrage', intelCtrl.getArbitrageOpportunities);
router.get('/market-intelligence/sell-hold', intelCtrl.getSellOrHoldAdvisory);
router.get('/market-intelligence/recommendations', intelCtrl.getSmartRecommendations);
router.get('/market-intelligence/indices', intelCtrl.getMarketOverviewIndices);
router.get('/market-intelligence/forecast', intelCtrl.getPriceForecast);
router.get('/market-intelligence/storage-economics', intelCtrl.getStorageEconomics);
router.get('/market-intelligence/corridor-transporters', intelCtrl.getCorridorTransporters);

// 11. AI Services (Crop Scanner & Price Prediction)
router.post('/crop-scan', aiCtrl.scanCrop);
router.post('/ai/crop-analysis', aiCtrl.scanCrop);
router.get('/price-prediction', aiCtrl.predictPrice);
router.get('/ai/price-prediction', aiCtrl.predictPrice);

// 12. Admin Control Center Routes
router.get('/admin/stats', authenticate, authorizeRoles('ADMIN'), adminCtrl.getPlatformStats);
router.get('/admin/users', authenticate, authorizeRoles('ADMIN'), adminCtrl.getAllUsers);
router.post('/admin/users/:id/verify', authenticate, authorizeRoles('ADMIN'), adminCtrl.verifyUser);
router.get('/admin/transactions', authenticate, authorizeRoles('ADMIN'), adminCtrl.getTransactions);
router.get('/admin/audit-logs', authenticate, authorizeRoles('ADMIN'), adminCtrl.getAuditLogs);

// 13. Verification, Onboarding & Voice Assistant Routes
const verificationRoutes = require('./verificationRoutes');
const onboardingRoutes = require('./onboardingRoutes');
const assistantRoutes = require('./assistantRoutes');

router.use('/verification', verificationRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/assistant', assistantRoutes);

module.exports = router;

