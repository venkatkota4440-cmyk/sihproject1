import React, { useState, useEffect, useRef } from 'react';
import FilterPanel from '../../components/marketplace/FilterPanel';
import CropCard from '../../components/marketplace/CropCard';
import OfferModal from '../../components/negotiation/OfferModal';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import {
  Store,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Truck,
  ShieldCheck,
  ShoppingCart,
  Tag,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LiveLocationBadge from '../../components/common/LiveLocationBadge';
import { calculateDistanceKm, formatDistance, getCropCoordinates, getCachedLiveLocation } from '../../services/locationService';

export default function Marketplace() {
  const [crops, setCrops] = useState([]);
  const [featuredCrops, setFeaturedCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [subCategory, setSubCategory] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCropForOffer, setSelectedCropForOffer] = useState(null);
  const [buyerLocation, setBuyerLocation] = useState(() => getCachedLiveLocation());
  const [liveSearchMarketData, setLiveSearchMarketData] = useState(null);
  const [correctedQuery, setCorrectedQuery] = useState(null);

  const { addToCart, cartItems } = useCart();
  const horizontalScrollRef = useRef(null);

  // Load Priority Featured Crops for Horizontal Showcase
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await api.get('/crops?limit=10&sortBy=popular');
        if (res.success && res.data?.crops) {
          setFeaturedCrops(res.data.crops);
        }
      } catch (err) {
        console.warn('Featured crops error:', err);
      }
    }
    fetchFeatured();
  }, []);

  // Load Main Vertical Marketplace Grid
  useEffect(() => {
    async function fetchCrops() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: 12,
          sortBy
        });
        if (search) params.append('search', search);
        if (category && category !== 'All') params.append('category', category);
        if (subCategory && subCategory !== 'All') params.append('subCategory', subCategory);
        if (organicOnly) params.append('organic', 'true');

        const res = await api.get(`/crops?${params.toString()}`);
        if (res.success) {
          setCrops(res.data.crops);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setLiveSearchMarketData(res.data.liveSearchMarketData || null);
          setCorrectedQuery(res.data.correctedQuery || null);
        }
      } catch (err) {
        console.warn('Marketplace fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCrops();
  }, [search, category, subCategory, organicOnly, sortBy, page]);

  const scrollHorizontal = (direction) => {
    if (horizontalScrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      horizontalScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const displayedCrops = React.useMemo(() => {
    if (sortBy !== 'nearest' || !buyerLocation) return crops;
    return [...crops].sort((a, b) => {
      const coordA = getCropCoordinates(a);
      const coordB = getCropCoordinates(b);
      const distA = calculateDistanceKm(buyerLocation.lat, buyerLocation.lng, coordA.lat, coordA.lng) ?? 999999;
      const distB = calculateDistanceKm(buyerLocation.lat, buyerLocation.lng, coordB.lat, coordB.lng) ?? 999999;
      return distA - distB;
    });
  }, [crops, sortBy, buyerLocation]);

  return (
    <div className="container" style={{ padding: '36px 20px', minHeight: '80vh' }}>
      
      {/* Page Title, Badges & Real Live Location Access */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-success">DIRECT FARM GATE LISTINGS</span>
              <span className="badge badge-neutral">ESCROW PROTECTED</span>
              <span className="badge badge-primary">80+ CROPS AVAILABLE</span>
              <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                GOVT AGMARKNET INTEGRATED
              </span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.02em' }}>
              AgriNex Wholesale Produce Marketplace
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '4px' }}>
              Procure certified fresh harvests directly from verified Indian producers at fair, transparent APMC-benchmarked pricing.
            </p>
          </div>

          {/* Buyer Real Live GPS Location Access */}
          <div style={{ minWidth: '320px', flex: '0 1 360px' }}>
            <LiveLocationBadge
              role="BUYER"
              compact={false}
              onLocationDetected={(loc) => setBuyerLocation(loc)}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          HORIZONTAL SHOWCASE: READY HARVESTS FOR IMMEDIATE BULK PROCUREMENT
         ========================================================================= */}
      {featuredCrops.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Flame size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Ready Farm Gate Harvests (Immediate Procurement)
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Fresh lots verified in storage yards and ready for 24-hour truck dispatch.
                </p>
              </div>
            </div>

            {/* Carousel Navigation Buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => scrollHorizontal('left')}
                className="btn btn-secondary btn-sm"
                style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
                title="Scroll Left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollHorizontal('right')}
                className="btn btn-secondary btn-sm"
                style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
                title="Scroll Right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Strip */}
          <div
            ref={horizontalScrollRef}
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '12px',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'thin'
            }}
          >
            {featuredCrops.map((crop) => {
              const inCart = cartItems.some(i => i.id === crop.id);
              const imgUrl = (crop.images && crop.images[0]) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
              const featCoords = getCropCoordinates(crop);
              const featDist = (buyerLocation && buyerLocation.lat && featCoords)
                ? calculateDistanceKm(buyerLocation.lat, buyerLocation.lng, featCoords.lat, featCoords.lng)
                : null;

              return (
                <div
                  key={crop.id}
                  className="glass-card card-hover-depth"
                  style={{
                    flex: '0 0 320px',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: '16px'
                  }}
                >
                  <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#0f172a' }}>
                    <img
                      src={imgUrl}
                      alt={crop.title}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '4px' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                        Ready Lot
                      </span>
                      {crop.isOrganic && (
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Organic</span>
                      )}
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {crop.quantity?.toLocaleString('en-IN')} {crop.unit || 'kg'} available
                    </div>
                  </div>

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                      {crop.category} • {crop.variety || 'Standard'}
                    </div>

                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-main)' }}>
                      {crop.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <MapPin size={12} color="#10b981" style={{ flexShrink: 0 }} />
                        <span>{crop.location?.district || 'Nashik'}, {crop.location?.state || 'Maharashtra'}</span>
                      </div>
                      {featDist !== null && (
                        <span style={{
                          flexShrink: 0,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#0284c7',
                          background: 'rgba(2, 132, 199, 0.12)',
                          padding: '1px 5px',
                          borderRadius: '4px'
                        }}>
                          📍 {formatDistance(featDist)}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Farmer:</span>
                      <strong style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {crop.farmerName || 'Verified Producer'} <ShieldCheck size={12} color="#10b981" />
                      </strong>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Farm Gate Price</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          ₹{crop.pricePerUnit} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {crop.unit || 'kg'}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                        APMC: ₹{crop.mandiBenchmark || 28}/kg
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => addToCart(crop, 500)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '0.75rem',
                          justifyContent: 'center',
                          fontWeight: 700,
                          background: inCart ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-muted)',
                          borderColor: inCart ? '#10b981' : 'var(--border-color)',
                          color: inCart ? '#10b981' : 'var(--text-main)'
                        }}
                      >
                        <ShoppingCart size={13} /> {inCart ? 'In Cart (+)' : 'Add'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedCropForOffer(crop)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', justifyContent: 'center', fontWeight: 700 }}
                      >
                        <Tag size={13} /> Offer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VERTICAL MARKETPLACE: ALL 80+ CROPS FILTER & 4-COLUMN RESPONSIVE GRID
         ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>All Available Harvest Inventories</span>
          {liveSearchMarketData && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 10px', borderRadius: '12px' }}>
              Filtered: {liveSearchMarketData.searchedCommodity}
            </span>
          )}
        </h3>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing {crops.length} lots • Verified APMC Benchmarks
        </span>
      </div>

      {/* Filter Component */}
      <FilterPanel
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={(cat) => { setCategory(cat); setSubCategory('All'); setPage(1); }}
        subCategory={subCategory}
        setSubCategory={(sub) => { setSubCategory(sub); setPage(1); }}
        organicOnly={organicOnly}
        setOrganicOnly={(org) => { setOrganicOnly(org); setPage(1); }}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* =========================================================================
          LIVE APMC MANDI MARKET PRICE INTELLIGENCE BENCHMARK CARD
         ========================================================================= */}
      {liveSearchMarketData && (
        <div
          className="glass-panel"
          style={{
            padding: '22px 26px',
            borderRadius: '18px',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.25), 0 0 15px rgba(16, 185, 129, 0.1)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', padding: '3px 8px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                  LIVE APMC MANDI BENCHMARK
                </span>
                {liveSearchMarketData.isTypoCorrected && (
                  <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', borderColor: 'rgba(245, 158, 11, 0.3)', fontSize: '0.72rem', fontWeight: 700 }}>
                    ✨ Auto-matched from "{search}"
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Verified Source: {liveSearchMarketData.verifiedSource}
                </span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>Live APMC Market Price:</span>
                <span style={{ color: '#10b981' }}>{liveSearchMarketData.searchedCommodity}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '2px 10px', borderRadius: '12px' }}>
                  {crops.length} Farm Lots Available
                </span>
              </h3>
            </div>

            <Link
              to="/prices"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, padding: '8px 14px' }}
            >
              <TrendingUp size={15} color="#10b981" /> Open All-India Arbitrage Desk →
            </Link>
          </div>

          {/* Key Benchmark Metrics 4-Col Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            {/* Modal Mandi Benchmark Rate */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                APMC Modal Benchmark
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', marginTop: '4px', lineHeight: 1.1 }}>
                ₹{Number(liveSearchMarketData.modalPrice).toFixed(2)}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '4px' }}>/ kg</span>
              </div>
              <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                ₹{Number(liveSearchMarketData.pricePerQuintal || (liveSearchMarketData.modalPrice * 100)).toLocaleString('en-IN')} / Quintal
              </div>
            </div>

            {/* Auction Price Spread */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Mandi Auction Range
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.2 }}>
                ₹{liveSearchMarketData.minPrice} - ₹{liveSearchMarketData.maxPrice}
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px' }}>/ kg</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Spread: ₹{(liveSearchMarketData.minPrice * 100).toLocaleString('en-IN')} - ₹{(liveSearchMarketData.maxPrice * 100).toLocaleString('en-IN')} / Qtl
              </div>
            </div>

            {/* Benchmark APMC Mandi Hub */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Reporting Mandi Hub
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={15} color="#10b981" style={{ flexShrink: 0 }} />
                <span>{liveSearchMarketData.market}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {liveSearchMarketData.district}, {liveSearchMarketData.state}
              </div>
            </div>

            {/* Daily Volume & Trend */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Daily Arrivals & Pulse
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{liveSearchMarketData.arrivalsMT} MT Daily</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: liveSearchMarketData.trend === 'UP' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: liveSearchMarketData.trend === 'UP' ? '#ef4444' : '#10b981'
                }}>
                  {liveSearchMarketData.trend === 'UP' ? '📈 Bullish (+)' : liveSearchMarketData.trend === 'DOWN' ? '📉 Softening (-)' : '⚖️ Steady'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Official AGMARKNET data ({liveSearchMarketData.date})
              </div>
            </div>
          </div>

          {/* Wholesale Farm-Gate Direct Advantage Strip */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px dashed rgba(16, 185, 129, 0.4)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#10b981" />
              <span>
                <strong>Direct Farm Gate Procurement:</strong> Listed below are {crops.length} verified producer lots for <strong>{liveSearchMarketData.searchedCommodity}</strong> ready for direct booking at zero intermediary commission.
              </span>
            </div>
            {liveSearchMarketData.isTypoCorrected && (
              <button
                type="button"
                onClick={() => setSearch(liveSearchMarketData.searchedCommodity)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#10b981',
                  fontWeight: 700,
                  fontSize: '0.78125rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Set search filter to "{liveSearchMarketData.searchedCommodity}"
              </button>
            )}
          </div>
        </div>
      )}

      {/* Crop Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '2.5rem', animation: 'spin 1s linear infinite' }}>🌱</div>
          <div style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading Verified Farm Listings...</div>
        </div>
      ) : crops.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Store size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Crop Listings Match Your Criteria</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Try adjusting your search keywords, category filters, or organic toggle.
          </p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setOrganicOnly(false); }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '16px' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {displayedCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              buyerLocation={buyerLocation}
              onMakeOffer={(c) => setSelectedCropForOffer(c)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary btn-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Offer Modal */}
      {selectedCropForOffer && (
        <OfferModal
          crop={selectedCropForOffer}
          onClose={() => setSelectedCropForOffer(null)}
          onOfferSubmitted={() => alert('Offer submitted! View negotiation status under My Offers.')}
        />
      )}
    </div>
  );
}
