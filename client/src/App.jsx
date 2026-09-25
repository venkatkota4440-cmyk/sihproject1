import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DemoAccountBar from './components/layout/DemoAccountBar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Aurora3DBackground from './components/three/Aurora3DBackground';

// Onboarding, Tour & AI Assistant
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import GuidedTour from './components/tour/GuidedTour';
import AssistantLauncher from './components/assistant/AssistantLauncher';
import AIChatAssistant from './components/assistant/AIChatAssistant';

// Public Pages
import LandingPage from './pages/LandingPage';
import AuthGatewayScreen from './pages/AuthGatewayScreen';
import Marketplace from './pages/buyer/Marketplace';
import CropDetails from './pages/buyer/CropDetails';
import PriceDiscoveryPage from './pages/PriceDiscoveryPage';
import EscrowPaymentPage from './pages/EscrowPaymentPage';
import CropScanner from './components/ai/CropScanner';
import DeliveryTrackerMap from './components/map/DeliveryTrackerMap';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FarmDirectGateway from './pages/FarmDirectGateway';
import BuyerCart from './pages/buyer/BuyerCart';
import CartDrawer from './components/cart/CartDrawer';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddCrop from './pages/farmer/AddCrop';
import MyCrops from './pages/farmer/MyCrops';
import FarmerOffers from './pages/farmer/FarmerOffers';
import FarmerOrders from './pages/farmer/FarmerOrders';
import FarmerEarnings from './pages/farmer/FarmerEarnings';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerRequirements from './pages/buyer/BuyerRequirements';
import BuyerOffers from './pages/buyer/BuyerOffers';
import BuyerOrders from './pages/buyer/BuyerOrders';

// Transporter Pages
import TransporterDashboard from './pages/transporter/TransporterDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

import { useAuth } from './context/AuthContext';

export default function App() {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 3D Animated Aurora & Agricultural Terrain Canvas */}
      <Aurora3DBackground />

      {/* 1-Click Hackathon Evaluator Bar */}
      <DemoAccountBar />

      {/* Primary Sticky Header */}
      <Navbar />

      {/* Main Viewport */}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public / Gateway Routes */}
          <Route path="/welcome" element={<AuthGatewayScreen />} />
          <Route path="/portal" element={<FarmDirectGateway />} />
          <Route path="/gateway" element={<FarmDirectGateway />} />
          <Route path="/aadhar-login" element={<FarmDirectGateway />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Root Route: If authenticated -> Home (LandingPage), If NOT authenticated -> Welcome Gateway */}
          <Route
            path="/"
            element={
              loading ? (
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>🌱</div>
                    <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Loading AgriNex...</div>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <LandingPage />
              ) : (
                <Navigate to="/welcome" replace />
              )
            }
          />

          {/* Protected Internal Routes for All Authenticated Users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<LandingPage />} />
            <Route path="/verify" element={<OnboardingFlow initialStep="VERIFY_CHOICE" />} />
            <Route path="/tour" element={<GuidedTour onComplete={() => window.location.href = '/'} />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/cart" element={<BuyerCart />} />
            <Route path="/buyer/cart" element={<BuyerCart />} />
            <Route path="/crops/:id" element={<CropDetails />} />
            <Route path="/prices" element={<PriceDiscoveryPage />} />
            <Route path="/payments" element={<EscrowPaymentPage />} />
            <Route path="/escrow" element={<EscrowPaymentPage />} />
            <Route path="/escrow-vault" element={<EscrowPaymentPage />} />
            <Route path="/crop-scanner" element={
              <div className="container" style={{ padding: '40px 20px' }}>
                <CropScanner />
              </div>
            } />
            <Route path="/fleet" element={
              <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px' }}>
                  <span className="badge badge-warning" style={{ fontSize: '0.8125rem' }}>🛰️ REAL-TIME TELEMETRY</span>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>Live GPS Fleet Cold-Chain Telematics</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                    Live tracking of active refrigerated agricultural transports across Nashik, Pune, and Mumbai wholesale corridors.
                  </p>
                </div>
                <DeliveryTrackerMap />
              </div>
            } />
          </Route>

          {/* Farmer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN']} />}>
            <Route path="/home/farmer" element={<LandingPage forcedRole="FARMER" />} />
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/my-crops" element={<MyCrops />} />
            <Route path="/farmer/add-crop" element={<AddCrop />} />
            <Route path="/add-crop" element={<AddCrop />} />
            <Route path="/farmer/offers" element={<FarmerOffers />} />
            <Route path="/farmer/orders" element={<FarmerOrders />} />
            <Route path="/farmer/earnings" element={<FarmerEarnings />} />
            <Route path="/farmer/profit-calculator" element={<FarmerDashboard />} />
          </Route>

          {/* Buyer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['BUYER', 'ADMIN']} />}>
            <Route path="/home/buyer" element={<LandingPage forcedRole="BUYER" />} />
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/requirements" element={<BuyerRequirements />} />
            <Route path="/buyer/offers" element={<BuyerOffers />} />
            <Route path="/buyer/orders" element={<BuyerOrders />} />
          </Route>

          {/* Transporter Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['TRANSPORTER', 'ADMIN']} />}>
            <Route path="/transporter/dashboard" element={<TransporterDashboard />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/listings" element={<AdminDashboard />} />
            <Route path="/admin/transactions" element={<AdminDashboard />} />
            <Route path="/admin/audit-logs" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Wholesale Buyer Procurement Cart Drawer */}
      <CartDrawer />

      {/* Floating AI Assistant Chatbot */}
      <AssistantLauncher onClick={() => setAssistantOpen(prev => !prev)} isOpen={assistantOpen} />
      <AIChatAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />

      {/* Responsive Bottom Tab Bar for Mobile */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />
    </div>
  );
}
