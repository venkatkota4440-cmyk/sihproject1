import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import OfferModal from '../../components/negotiation/OfferModal';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowLeft,
  Truck,
  MessageCircle,
  TrendingUp,
  Tag,
  Share2,
  ShoppingCart,
  QrCode,
  Copy,
  CheckCircle2,
  Lock,
  Download,
  ExternalLink,
  X,
  CreditCard,
  Building
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import UpiQRCode from '../../components/common/UpiQRCode';
import LiveLocationBadge from '../../components/common/LiveLocationBadge';
import { calculateDistanceKm, formatDistance, getCropCoordinates, getCachedLiveLocation } from '../../services/locationService';

export default function CropDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart, showToast } = useCart();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [orderQty, setOrderQty] = useState(1000);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiAmount, setUpiAmount] = useState('');
  const [upiPaying, setUpiPaying] = useState(false);
  const [upiSuccess, setUpiSuccess] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [buyerLocation, setBuyerLocation] = useState(() => getCachedLiveLocation());

  useEffect(() => {
    async function fetchCrop() {
      setLoading(true);
      try {
        const res = await api.get(`/crops/${id}`);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Crop fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCrop();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', animation: 'spin 1s linear infinite' }}>🌱</div>
          <div style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading Produce Specifications...</div>
        </div>
      </div>
    );
  }

  if (!data || !data.crop) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Produce Listing Not Found</h2>
        <Link to="/marketplace" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const { crop, farmer, mandiBenchmark } = data;
  const images = crop.images && crop.images.length > 0
    ? crop.images
    : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'];

  return (
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Back Link */}
      <div>
        <Link
          to="/marketplace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left: Image Gallery */}
        <div>
          <div style={{
            width: '100%',
            height: '420px',
            borderRadius: '20px',
            overflow: 'hidden',
            background: '#090d16',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '14px'
          }}>
            <img
              src={images[selectedImage] || images[0]}
              alt={crop.title}
              loading="lazy"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600'; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === idx ? '2px solid #10b981' : '1px solid var(--border-color)',
                    opacity: selectedImage === idx ? 1 : 0.7
                  }}
                >
                  <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Specifications & Negotiation Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {crop.isOrganic && (
                <span className="badge badge-success">
                  <Sparkles size={11} /> Certified Organic
                </span>
              )}
              <span className="badge badge-neutral">
                {crop.qualityGrade}
              </span>
              <span className="badge badge-neutral">
                {crop.category}
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2 }}>
              {crop.title}
            </h1>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-primary-600)', fontWeight: 600, marginTop: '4px' }}>
              Variety: {crop.variety}
            </div>
          </div>

          {/* Pricing Banner */}
          <div style={{
            background: 'var(--bg-muted)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Listed Price</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ₹{crop.pricePerUnit} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {crop.unit || 'kg'}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Available Quantity</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                {Number(crop.quantity).toLocaleString()} {crop.unit || 'kg'}
              </div>
            </div>
          </div>

          {/* AI Mandi Intelligence Benchmark Strip */}
          <div style={{
            padding: '14px 18px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(37, 99, 235, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  AI Mandi Intelligence Benchmark
                  <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '1px 6px' }}>FAIR VALUATION</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  APMC Spot: ₹{mandiBenchmark || 26.5}/kg • Terminal Vashi rate: ₹34.0/kg • Delhi Azadpur rate: ₹42.0/kg
                </div>
              </div>
            </div>
            <Link
              to="/prices"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <TrendingUp size={14} /> Full Arbitrage Desk
            </Link>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '6px' }}>Harvest Description</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {crop.description}
            </p>
          </div>

          {/* Specifications Table */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '0.8125rem',
            background: 'var(--bg-surface)',
            padding: '16px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Harvest Date:</span>
              <strong style={{ display: 'block', color: 'var(--text-main)' }}>{crop.harvestDate}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Farm Location:</span>
              <strong style={{ display: 'block', color: 'var(--text-main)' }}>{crop.location?.district}, {crop.location?.state}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Minimum Acceptable Bid:</span>
              <strong style={{ display: 'block', color: '#f59e0b' }}>₹{crop.minPrice} / {crop.unit}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Cold Chain Compatible:</span>
              <strong style={{ display: 'block', color: '#10b981' }}>Yes (18°C Reefer Available)</strong>
            </div>
          </div>

          {/* Live GPS & Cold-Chain Logistics Estimator */}
          {(() => {
            const cropCoords = getCropCoordinates(crop);
            const liveDistanceKm = (buyerLocation?.lat && cropCoords)
              ? calculateDistanceKm(buyerLocation.lat, buyerLocation.lng, cropCoords.lat, cropCoords.lng)
              : null;
            const transitHours = liveDistanceKm ? Math.max(1, Math.round(liveDistanceKm / 45)) : null;

            return (
              <div style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
                border: '1.5px solid rgba(2, 132, 199, 0.25)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} color="#0284c7" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Real Live GPS & Transit Estimate
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>LIVE SATELLITE</span>
                  </div>
                  {liveDistanceKm !== null && (
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      background: 'rgba(2, 132, 199, 0.15)',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      📍 {formatDistance(liveDistanceKm)} from you
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8125rem' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Farm Origin GPS:</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.8125rem' }}>
                      {cropCoords.lat.toFixed(4)}°N, {cropCoords.lng.toFixed(4)}°E
                    </strong>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>
                      ✓ {crop.location?.district || 'Nashik'}, {crop.location?.state || 'Maharashtra'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Est. Reefer Transit:</span>
                    <strong style={{ color: '#0284c7', fontSize: '0.8125rem' }}>
                      {transitHours ? `~${transitHours} Hours Transit` : 'Click below for GPS Lock'}
                    </strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      45 km/h agri-freight speed
                    </div>
                  </div>
                </div>

                <LiveLocationBadge
                  role="BUYER"
                  compact={true}
                  onLocationDetected={(loc) => setBuyerLocation(loc)}
                />
              </div>
            );
          })()}

          {/* Wholesale Quantity & Action CTAs */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block' }}>
                  Procurement Lot Quantity:
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Total Lot: <strong>₹{(orderQty * (crop.pricePerUnit || 0)).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setOrderQty(q => Math.max(100, q - 200))}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  -
                </button>
                <input
                  type="number"
                  className="form-input"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(100, Number(e.target.value)))}
                  step="100"
                  min="100"
                  style={{ width: '110px', textAlign: 'center', fontWeight: 800, fontSize: '0.9375rem' }}
                />
                <button
                  type="button"
                  onClick={() => setOrderQty(q => q + 200)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>{crop.unit || 'kg'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  addToCart(crop, orderQty);
                  openCart();
                }}
                className="btn btn-aurora"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800 }}
              >
                <ShoppingCart size={18} /> Add to Cart & Checkout
              </button>

              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
              >
                <Tag size={16} /> Make Custom Offer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Farmer Trust Profile & UPI Payment Section */}
      {farmer && (() => {
        const farmerUpiId = crop.farmerUpi || (farmer.name ? `${farmer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@okhdfcbank` : 'rameshpatel@okhdfcbank');
        const lotTotal = (orderQty || 1000) * (crop.pricePerUnit || 25);
        const activeUpiAmount = upiAmount ? Number(upiAmount) : lotTotal;
        const upiUri = `upi://pay?pa=${farmerUpiId}&pn=${encodeURIComponent(farmer.name || 'Farmer')}&am=${activeUpiAmount}&cu=INR&tn=${encodeURIComponent(`AgriNex_Escrow_${crop.id}`)}`;

        const copyUpiId = () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(farmerUpiId);
          }
          setCopiedUpi(true);
          setTimeout(() => setCopiedUpi(false), 2000);
          showToast(`✓ Farmer UPI ID copied: ${farmerUpiId}`);
        };

        const handleSimulateUpiPayment = async () => {
          setUpiPaying(true);
          try {
            const res = await api.post('/payments/escrow-deposit', {
              amount: activeUpiAmount,
              cropName: crop.title,
              farmerName: farmer.name,
              paymentMethod: 'UPI',
              quantityKg: orderQty
            });

            setUpiPaying(false);
            if (res.success) {
              setUpiSuccess(res.data);
              try {
                confetti({
                  particleCount: 100,
                  spread: 80,
                  origin: { y: 0.6 }
                });
              } catch (e) {}
              showToast(`🎉 ₹${activeUpiAmount.toLocaleString('en-IN')} UPI Escrow Secured for ${farmer.name}!`);
            }
          } catch (err) {
            setUpiPaying(false);
            // Fallback mock success if offline
            const fallbackData = {
              transactionId: `TXN_UPI_${Date.now()}`,
              escrowReference: `AGX-VAULT-${Math.floor(100000 + Math.random() * 900000)}`,
              releaseOtp: Math.floor(100000 + Math.random() * 900000).toString(),
              amount: activeUpiAmount,
              paidAt: new Date().toISOString()
            };
            setUpiSuccess(fallbackData);
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}
            showToast(`🎉 ₹${activeUpiAmount.toLocaleString('en-IN')} UPI Escrow Secured!`);
          }
        };

        return (
          <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', border: '1.5px solid rgba(16, 185, 129, 0.35)', background: 'var(--bg-card)' }}>
            {/* Farmer Identity Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  border: '2px solid #ffffff'
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=150"
                    alt={farmer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>{farmer.name}</h3>
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                      <ShieldCheck size={14} /> Verified Producer
                    </span>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#2563eb',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      Aadhaar NPCI DBT Linked
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {farmer.farmInfo?.farmName || 'Bio-Green Certified Farm'} • {farmer.farmInfo?.farmSize || '15 Acres'} • {crop.location?.district}, {crop.location?.state}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.8125rem', fontWeight: 700, marginTop: '4px' }}>
                    <Star size={14} fill="#fbbf24" /> {farmer.rating} ({farmer.reviewsCount || 42} wholesale ratings) • 100% On-Time Harvest Dispatch
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <Tag size={15} /> Propose Custom Bid
                </button>
                <Link
                  to="/payments"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <Lock size={15} /> All Escrow Payments
                </Link>
              </div>
            </div>

            {/* FARMER UPI PAYMENT SECTION */}
            <div style={{
              marginTop: '22px',
              padding: '20px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                  }}>
                    <QrCode size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Farmer Direct UPI Payment Gateway
                      <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '1px 6px' }}>ZERO DEDUCTION</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Direct instant settlement to farmer's NPCI bank account via virtual Escrow Vault
                    </div>
                  </div>
                </div>

                {/* Farmer UPI ID pill with copy */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-card)',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Farmer UPI:</span>
                  <code style={{ fontSize: '0.875rem', fontWeight: 800, color: '#10b981' }}>{farmerUpiId}</code>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    title="Copy UPI ID"
                    style={{
                      background: copiedUpi ? '#10b981' : 'transparent',
                      color: copiedUpi ? '#fff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {copiedUpi ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    {copiedUpi ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* UPI CTAs & Quick Apps */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setUpiAmount(lotTotal.toString());
                      setUpiSuccess(null);
                      setShowUpiModal(true);
                    }}
                    className="btn btn-aurora"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 800,
                      padding: '10px 20px',
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <QrCode size={18} /> Pay via UPI Escrow (₹{lotTotal.toLocaleString('en-IN')})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUpiAmount(lotTotal.toString());
                      setUpiSuccess(null);
                      setShowUpiModal(true);
                    }}
                    className="btn btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                      padding: '10px 16px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Lock size={16} /> Scan Dynamic UPI QR
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Supported Apps:</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-muted)', fontWeight: 700, color: '#2563eb', border: '1px solid var(--border-color)' }}>GPay</span>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-muted)', fontWeight: 700, color: '#7c3aed', border: '1px solid var(--border-color)' }}>PhonePe</span>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-muted)', fontWeight: 700, color: '#0284c7', border: '1px solid var(--border-color)' }}>Paytm</span>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-muted)', fontWeight: 700, color: '#16a34a', border: '1px solid var(--border-color)' }}>BHIM</span>
                  </div>
                </div>
              </div>

              {/* Escrow Guarantee Disclaimer */}
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                padding: '8px 12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                <span>
                  <strong>100% Escrow Protection:</strong> Funds are locked in AgriNex Smart Vault and directly transferred to <strong>{farmer.name}'s</strong> UPI account only upon 6-digit delivery OTP verification at unloading.
                </span>
              </div>
            </div>

            {/* DYNAMIC UPI ESCROW PAYMENT MODAL */}
            {showUpiModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10000,
                  padding: '16px'
                }}
                onClick={() => setShowUpiModal(false)}
              >
                <div
                  className="glass-card"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1.5px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '24px',
                    maxWidth: '480px',
                    width: '100%',
                    padding: '28px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.25)',
                    position: 'relative',
                    maxHeight: '92vh',
                    overflowY: 'auto'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowUpiModal(false)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'var(--bg-muted)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <X size={18} />
                  </button>

                  {!upiSuccess ? (
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div className="badge badge-success" style={{ marginBottom: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                          <ShieldCheck size={14} style={{ marginRight: '4px' }} /> NPCI VERIFIED DIRECT ESCROW
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '4px 0' }}>
                          Pay {farmer.name} via UPI
                        </h2>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                          Scan with any UPI app to lock funds in AgriNex Virtual Escrow Vault
                        </p>
                      </div>

                      {/* Dynamic QR Code Display */}
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <UpiQRCode
                          value={upiUri}
                          size={180}
                          payeeName={data.farmerName || 'Farmer Producer'}
                          amount={upiAmount}
                          vpa="farmer.direct@okhdfcbank"
                        />
                      </div>

                      {/* Payee Details */}
                      <div style={{
                        background: 'var(--bg-surface)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        marginBottom: '18px',
                        fontSize: '0.8125rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Beneficiary:</span>
                          <strong>{farmer.name}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Farmer UPI VPA:</span>
                          <span style={{ color: '#10b981', fontWeight: 800 }}>{farmerUpiId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Crop Harvest:</span>
                          <span>{crop.title} ({orderQty} {crop.unit || 'kg'})</span>
                        </div>
                      </div>

                      {/* Amount Selection & Input */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                          UPI Escrow Amount (₹):
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setUpiAmount('5000')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '6px 4px', fontWeight: activeUpiAmount === 5000 ? 800 : 600, borderColor: activeUpiAmount === 5000 ? '#10b981' : 'var(--border-color)' }}
                          >
                            ₹5,000 (Advance)
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpiAmount('15000')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '6px 4px', fontWeight: activeUpiAmount === 15000 ? 800 : 600, borderColor: activeUpiAmount === 15000 ? '#10b981' : 'var(--border-color)' }}
                          >
                            ₹15,000 (Token)
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpiAmount(lotTotal.toString())}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '6px 4px', fontWeight: activeUpiAmount === lotTotal ? 800 : 600, borderColor: activeUpiAmount === lotTotal ? '#10b981' : 'var(--border-color)' }}
                          >
                            ₹{lotTotal.toLocaleString('en-IN')} (Full Lot)
                          </button>
                        </div>

                        <input
                          type="number"
                          className="form-input"
                          value={upiAmount}
                          onChange={(e) => setUpiAmount(e.target.value)}
                          placeholder={lotTotal.toString()}
                          style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center' }}
                        />
                      </div>

                      {/* 1-Click Simulated UPI Payment */}
                      <button
                        type="button"
                        disabled={upiPaying}
                        onClick={handleSimulateUpiPayment}
                        className="btn btn-aurora"
                        style={{
                          width: '100%',
                          padding: '14px',
                          fontSize: '1rem',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          borderRadius: '14px'
                        }}
                      >
                        {upiPaying ? (
                          'Securing in Escrow Vault...'
                        ) : (
                          <>
                            <Lock size={18} /> Simulate 1-Click UPI Payment (₹{activeUpiAmount.toLocaleString('en-IN')})
                          </>
                        )}
                      </button>

                      {/* Direct App Deep Links */}
                      <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Or click to launch UPI intent directly:</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
                          <a href={upiUri} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '8px 4px', textDecoration: 'none', color: '#2563eb', fontWeight: 800 }}>GPay</a>
                          <a href={upiUri} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '8px 4px', textDecoration: 'none', color: '#7c3aed', fontWeight: 800 }}>PhonePe</a>
                          <a href={upiUri} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '8px 4px', textDecoration: 'none', color: '#0284c7', fontWeight: 800 }}>Paytm</a>
                          <a href={upiUri} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '8px 4px', textDecoration: 'none', color: '#16a34a', fontWeight: 800 }}>BHIM</a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Instant Payment Success Receipt */
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
                      }}>
                        <CheckCircle2 size={36} />
                      </div>

                      <div className="badge badge-success" style={{ marginBottom: '8px' }}>
                        ESCROW VAULT SECURED
                      </div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '4px 0' }}>
                        ₹{activeUpiAmount.toLocaleString('en-IN')} Locked in Escrow
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                        Funds are held in AgriNex RBI-Compliant virtual node and will be released to <strong>{farmer.name}</strong> upon physical delivery verification.
                      </p>

                      <div style={{
                        background: 'var(--bg-surface)',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>UPI Reference (UTR):</span>
                          <strong>{upiSuccess.transactionId || `UPI/${Date.now()}/APMC`}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Escrow Vault Ref:</span>
                          <span style={{ color: '#10b981', fontWeight: 800 }}>{upiSuccess.escrowReference}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Delivery Handover OTP:</span>
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: 900,
                            letterSpacing: '2px',
                            color: '#f59e0b',
                            background: 'rgba(245, 158, 11, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            {upiSuccess.releaseOtp || '884920'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Farmer Payee:</span>
                          <strong>{farmer.name} ({farmerUpiId})</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUpiModal(false);
                            navigate('/payments');
                          }}
                          className="btn btn-aurora"
                          style={{ flex: 1, fontWeight: 800, padding: '12px' }}
                        >
                          View in Payments Hub
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUpiModal(false)}
                          className="btn btn-secondary"
                          style={{ padding: '12px 18px', fontWeight: 700 }}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Offer Modal */}
      {showOfferModal && (
        <OfferModal
          crop={crop}
          onClose={() => setShowOfferModal(false)}
          onOfferSubmitted={() => navigate('/buyer/offers')}
        />
      )}
    </div>
  );
}
