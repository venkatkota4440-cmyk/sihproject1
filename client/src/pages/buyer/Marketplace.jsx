import React, { useState, useEffect, useRef } from 'react';
import FilterPanel from '../../components/marketplace/FilterPanel';
import CropCard from '../../components/marketplace/CropCard';
import OfferModal from '../../components/negotiation/OfferModal';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import {
  Store,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  ShoppingCart,
  Tag,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LiveLocationBadge from '../../components/common/LiveLocationBadge';
import { calculateDistanceKm, formatDistance, getCropCoordinates, getCachedLiveLocation } from '../../services/locationService';

export default function Marketplace() {
  const [crops, setCrops] = useState([]);
  const [featuredCrops, setFeaturedCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [subCategory, setSubCategory] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
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
  const loadCrops = async () => {
    setLoading(true);
    setError(null);
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
        setCrops(res.data.crops || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setLiveSearchMarketData(res.data.liveSearchMarketData || null);
        setCorrectedQuery(res.data.correctedQuery || null);
      } else {
        setError(res.message || 'Unable to retrieve agricultural listings');
      }
    } catch (err) {
      console.warn('Marketplace fetch error:', err);
      setError(err.message || 'Unable to connect to the marketplace database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
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
    <div style={{ background: '#f8fafc', minHeight: '85vh', padding: '24px 0 48px' }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* =========================================================================
            1. INSTITUTIONAL BREADCRUMBS & PORTAL HERO HEADER
           ========================================================================= */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '24px 28px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1 1 540px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Home / Wholesale Produce Marketplace / All Harvest Listings
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Agricultural Marketplace
              </h1>
              <p style={{ color: '#475569', fontSize: '0.9375rem', marginTop: '6px', lineHeight: 1.5, maxWidth: '720px' }}>
                Connect farmers and buyers through a transparent digital marketplace. Browse verified producer lots with official APMC mandi benchmark pricing and escrow trade settlement.
              </p>

              {/* Trust and Key Info Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#166534',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '3px 10px',
                  borderRadius: '4px'
                }}>
                  <ShieldCheck size={13} /> Direct Farm Gate Listings
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#0369a1',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  padding: '3px 10px',
                  borderRadius: '4px'
                }}>
                  <TrendingUp size={13} /> APMC Mandi Benchmarked
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#475569',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '3px 10px',
                  borderRadius: '4px'
                }}>
                  Escrow Contract Protected
                </span>
              </div>
            </div>

            {/* Procurement Hub / Buyer Location Widget */}
            <div style={{
              flex: '0 1 360px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '16px'
            }}>
              <LiveLocationBadge
                role="BUYER"
                compact={false}
                onLocationDetected={(loc) => setBuyerLocation(loc)}
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. READY FARM GATE HARVESTS (IMMEDIATE BULK PROCUREMENT)
           ========================================================================= */}
        {featuredCrops.length > 0 && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} color="#166534" />
                  <span>Ready Farm Gate Harvests (Immediate Procurement)</span>
                </h2>
                <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: '2px 0 0' }}>
                  Verified produce stored in producer collection centers and ready for immediate refrigerated dispatch.
                </p>
              </div>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => scrollHorizontal('left')}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Scroll Left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontal('right')}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Scroll Right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Strip */}
            <div
              ref={horizontalScrollRef}
              style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollSnapType: 'x mandatory'
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
                    style={{
                      flex: '0 0 300px',
                      scrollSnapAlign: 'start',
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'relative', height: '140px', overflow: 'hidden', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                      <img
                        src={imgUrl}
                        alt={crop.title}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                        <span style={{ background: '#0f172a', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                          Ready Lot
                        </span>
                        {crop.isOrganic && (
                          <span style={{ background: '#166534', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                            Organic
                          </span>
                        )}
                      </div>

                      <div style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        color: '#ffffff',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {crop.quantity?.toLocaleString('en-IN')} {crop.unit || 'kg'}
                      </div>
                    </div>

                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                        {crop.category} • {crop.variety || 'Standard'}
                      </div>

                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.3, color: '#0f172a', margin: 0 }}>
                        {crop.title}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', fontSize: '0.75rem', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <MapPin size={12} color="#166534" style={{ flexShrink: 0 }} />
                          <span>{crop.location?.district || 'Nashik'}, {crop.location?.state || 'Maharashtra'}</span>
                        </div>
                        {featDist !== null && (
                          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#0369a1' }}>
                            {formatDistance(featDist)}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>Farmer:</span>
                        <strong style={{ color: '#0f172a' }}>{crop.farmerName || 'Verified Producer'}</strong>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Farm Gate Rate</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>
                            ₹{crop.pricePerUnit} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>/ {crop.unit || 'kg'}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
                          APMC: ₹{crop.mandiBenchmark || 28}/kg
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => addToCart(crop, 500)}
                          style={{
                            padding: '5px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '3px',
                            border: '1px solid #166534',
                            background: inCart ? '#ecfdf5' : '#ffffff',
                            color: '#166534',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <ShoppingCart size={12} /> {inCart ? 'In Cart' : 'Add'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedCropForOffer(crop)}
                          style={{
                            padding: '5px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '3px',
                            border: '1px solid #166534',
                            background: '#166534',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Tag size={12} /> Offer
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
            3. OFFICIAL APMC MANDI BENCHMARK DATA TABLE (WHEN SEARCH / FILTER ACTIVE)
           ========================================================================= */}
        {liveSearchMarketData && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            marginBottom: '24px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Table Header Bar */}
            <div style={{
              background: '#166534',
              color: '#ffffff',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#bbf7d0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  OFFICIAL APMC MANDI BENCHMARK DATA (DAILY ARRIVALS)
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                  {liveSearchMarketData.searchedCommodity} Market Price Overview
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 10px', borderRadius: '3px' }}>
                  Source: Government of India (data.gov.in / DMI)
                </span>
                <Link
                  to={`/prices?crop=${encodeURIComponent(liveSearchMarketData.searchedCommodity)}`}
                  style={{
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    background: '#ffffff',
                    color: '#166534',
                    padding: '6px 12px',
                    borderRadius: '3px',
                    textDecoration: 'none'
                  }}
                >
                  View All Mandis →
                </Link>
              </div>
            </div>

            {/* Table Component */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 16px' }}>Commodity</th>
                    <th style={{ padding: '12px 16px' }}>Reporting Mandi Hub</th>
                    <th style={{ padding: '12px 16px' }}>State / District</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Min Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Max Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Modal Benchmark</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Daily Arrivals</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {liveSearchMarketData.searchedCommodity}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>
                      {liveSearchMarketData.market}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {liveSearchMarketData.district}, {liveSearchMarketData.state}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#475569' }}>
                      ₹{liveSearchMarketData.minPrice}/kg
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>₹{(liveSearchMarketData.minPrice * 100).toLocaleString('en-IN')}/Qtl</div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#475569' }}>
                      ₹{liveSearchMarketData.maxPrice}/kg
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>₹{(liveSearchMarketData.maxPrice * 100).toLocaleString('en-IN')}/Qtl</div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#166534', fontSize: '1.05rem' }}>
                      ₹{Number(liveSearchMarketData.modalPrice).toFixed(2)}/kg
                      <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>₹{Number(liveSearchMarketData.pricePerQuintal || (liveSearchMarketData.modalPrice * 100)).toLocaleString('en-IN')}/Qtl</div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
                      {liveSearchMarketData.arrivalsMT} MT
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                      {liveSearchMarketData.date || 'Today'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Direct Advantage Footer Bar */}
            <div style={{
              padding: '12px 18px',
              background: '#f0fdf4',
              borderTop: '1px solid #bbf7d0',
              fontSize: '0.8125rem',
              color: '#166534',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div>
                <strong>Direct Farm-Gate Advantage:</strong> Listed below are {crops.length} verified producer lots for <strong>{liveSearchMarketData.searchedCommodity}</strong> ready for direct procurement below terminal APMC rates at zero intermediary commission.
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. MAIN LISTINGS SECTION HEADER & CONTROLS
           ========================================================================= */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Harvest Lots Available for Procurement
            </h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
              Showing {crops.length} certified harvest lots • APMC Mandi Benchmarked
            </div>
          </div>

          {/* View Mode Toggle: Cards Grid vs Data Table */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                fontSize: '0.78125rem',
                fontWeight: viewMode === 'grid' ? 700 : 500,
                background: viewMode === 'grid' ? '#166534' : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                fontSize: '0.78125rem',
                fontWeight: viewMode === 'table' ? 700 : 500,
                background: viewMode === 'table' ? '#166534' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              <TableIcon size={14} />
              <span>Table View</span>
            </button>
          </div>
        </div>

        {/* Filter Bar Component */}
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
            5. LOADING, ERROR, EMPTY, OR DATA GRID / TABLE
           ========================================================================= */}
        {loading ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '48px 20px',
            textAlign: 'center'
          }}>
            <RefreshCw size={26} className="spin" color="#166534" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
              Loading verified agricultural crop listings...
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>
              Fetching producer lots and APMC mandi benchmarks from database
            </div>
          </div>
        ) : error ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#b91c1c' }}>
              Unable to load marketplace listings
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '6px 0 16px' }}>
              {error}. Please check your connection and retry.
            </p>
            <button
              type="button"
              onClick={loadCrops}
              style={{
                padding: '7px 18px',
                borderRadius: '4px',
                background: '#166534',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : crops.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <Store size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              No marketplace listings found
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '6px' }}>
              Try adjusting your search keywords, category filters, or location criteria.
            </p>
            <button
              type="button"
              onClick={() => { setSearch(''); setCategory('All'); setOrganicOnly(false); setSortBy('latest'); }}
              style={{
                marginTop: '16px',
                padding: '8px 18px',
                borderRadius: '4px',
                background: '#166534',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Institutional Structured Data Table View */
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 16px' }}>Produce Lot</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px' }}>Grade</th>
                    <th style={{ padding: '12px 16px' }}>Location</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Available Qty</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Farm Gate Rate</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>APMC Benchmark</th>
                    <th style={{ padding: '12px 16px' }}>Producer</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCrops.map((crop) => {
                    const inCart = cartItems.some(i => i.id === crop.id);
                    const mandiModal = Number(crop.mandiBenchmark || crop.liveMarketPrice?.modalPrice || 26.5);
                    const farmPrice = Number(crop.pricePerUnit || 0);

                    return (
                      <tr key={crop.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <Link to={`/crops/${crop.id}`} style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 700 }}>
                            {crop.title}
                          </Link>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {crop.variety || 'Standard Variety'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          {crop.category}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', background: '#f1f5f9', color: '#334155' }}>
                            {crop.qualityGrade || 'Grade A'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          {crop.location ? `${crop.location.district || crop.location}, ${crop.location.state || ''}` : 'Maharashtra'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                          {Number(crop.quantity).toLocaleString('en-IN')} {crop.unit || 'kg'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#166534' }}>
                          ₹{farmPrice.toFixed(2)}/{crop.unit || 'kg'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', color: '#475569' }}>
                          ₹{mandiModal.toFixed(2)}/kg
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                          {crop.farmerName || 'Verified Producer'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => addToCart(crop, 500)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                borderRadius: '3px',
                                border: '1px solid #166534',
                                background: inCart ? '#ecfdf5' : '#ffffff',
                                color: '#166534',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                            >
                              {inCart ? 'In Cart' : '+ Cart'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedCropForOffer(crop)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                borderRadius: '3px',
                                border: '1px solid #166534',
                                background: '#166534',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                            >
                              Offer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards Grid View */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '18px'
          }}>
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

        {/* =========================================================================
            6. INSTITUTIONAL PAGINATION CONTROLS
           ========================================================================= */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '36px' }}>
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: page === 1 ? '#f1f5f9' : '#ffffff',
                color: page === 1 ? '#94a3b8' : '#334155',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', padding: '0 8px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: page === totalPages ? '#f1f5f9' : '#ffffff',
                color: page === totalPages ? '#94a3b8' : '#334155',
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
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
            onOfferSubmitted={() => alert('Offer submitted successfully! You can track negotiation status under My Offers.')}
          />
        )}
      </div>
    </div>
  );
}
