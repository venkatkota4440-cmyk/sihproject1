import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ProfitCalculatorModal from '../../components/farmer/ProfitCalculatorModal';
import ReceiptModal from '../../components/orders/ReceiptModal';
import {
  Sprout,
  PlusCircle,
  Package,
  MessageSquareDiff,
  ShoppingBag,
  DollarSign,
  Calculator,
  ScanLine,
  TrendingUp,
  ShieldCheck,
  Star,
  ArrowRight,
  Building2,
  Calendar,
  RefreshCw,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Info,
  Truck,
  Receipt,
  Eye,
  Search,
  Users
} from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  // Government Mandi Market Price State (data.gov.in integration)
  const [selectedMandiCrop, setSelectedMandiCrop] = useState(user?.primaryCrop || 'Potato');
  const [selectedMandiState, setSelectedMandiState] = useState('All');
  const [mandiPrices, setMandiPrices] = useState([]);
  const [latestMandiPrice, setLatestMandiPrice] = useState(null);
  const [loadingMandi, setLoadingMandi] = useState(false);
  const [mandiStates, setMandiStates] = useState([]);

  const commonCommodities = ['Potato', 'Tomato', 'Onion', 'Wheat', 'Rice', 'Cotton', 'Maize', 'Chilli', 'Mustard', 'Soyabean'];

  useEffect(() => {
    async function loadData() {
      try {
        const cropsRes = await api.get('/crops/farmer/my-crops');
        if (cropsRes.success) setCrops(cropsRes.data);

        const offersRes = await api.get('/offers');
        if (offersRes.success) setOffers(offersRes.data);

        const ordersRes = await api.get('/orders');
        if (ordersRes.success) setOrders(ordersRes.data);
      } catch (err) {
        console.warn('Farmer dashboard fetch error:', err);
      }
    }
    loadData();
  }, []);

  // Fetch available states for Mandi filtering
  useEffect(() => {
    async function loadMandiStates() {
      try {
        const res = await api.get('/market-prices/states');
        if (res.success && Array.isArray(res.data)) {
          setMandiStates(res.data);
        }
      } catch (err) {}
    }
    loadMandiStates();
  }, []);

  // Fetch official Mandi prices when crop or state filter changes
  useEffect(() => {
    let isMounted = true;
    async function fetchMandiData() {
      setLoadingMandi(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('commodity', selectedMandiCrop);
        if (selectedMandiState && selectedMandiState !== 'All') {
          queryParams.append('state', selectedMandiState);
        }
        queryParams.append('limit', '4');

        const [listRes, latestRes] = await Promise.all([
          api.get(`/market-prices?${queryParams.toString()}`),
          api.get(`/market-prices/latest?commodity=${encodeURIComponent(selectedMandiCrop)}${selectedMandiState !== 'All' ? `&state=${encodeURIComponent(selectedMandiState)}` : ''}`)
        ]);

        if (isMounted) {
          if (listRes.success && Array.isArray(listRes.data)) {
            setMandiPrices(listRes.data);
          } else {
            setMandiPrices([]);
          }

          if (latestRes.success && latestRes.data) {
            setLatestMandiPrice(latestRes.data);
          } else {
            setLatestMandiPrice(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Mandi price fetch error:', err);
          setMandiPrices([]);
        }
      } finally {
        if (isMounted) setLoadingMandi(false);
      }
    }
    fetchMandiData();
    return () => { isMounted = false; };
  }, [selectedMandiCrop, selectedMandiState]);

  const totalEarnings = orders
    .filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const pendingOffersCount = offers.filter(o => o.status === 'PENDING' || o.status === 'COUNTERED').length;

  return (
    <div style={{ background: '#f8fafc', minHeight: '85vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        {/* =========================================================================
            1. INSTITUTIONAL BREADCRUMBS & CULTIVATOR PROFILE SUMMARY
           ========================================================================= */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '24px 28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Home / Kisan Farmer Services / Producer Portal Dashboard
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#166534',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '2px 8px',
                  borderRadius: '3px'
                }}>
                  <ShieldCheck size={13} /> Verified Kisan Cultivator
                </span>
                <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                  Aadhaar / Land Registry Linked
                </span>
              </div>

              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px', letterSpacing: '-0.02em' }}>
                Welcome to AgriNex, {user?.name || 'Ramesh Patel'}!
              </h1>
              <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: 1.5, margin: 0 }}>
                {user?.farmInfo?.farmName || 'Patel Bio-Green Farms, Niphad (Nashik)'} • Direct wholesale farmer-to-buyer exchange with daily APMC mandi benchmark pricing and escrow settlement.
              </p>
            </div>

            {/* Quick Profile Summary Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '0.8125rem'
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Location: </span>
                <strong style={{ color: '#0f172a' }}>{user?.location?.district || 'Nashik'}, {user?.location?.state || 'Maharashtra'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Primary Crop: </span>
                <strong style={{ color: '#166534' }}>{user?.primaryCrop || 'Potato / Onion'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Producer Rating: </span>
                <strong style={{ color: '#0f172a' }}>★ 4.9 / 5.0 (Verified lots)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. MANDATORY 8 QUICK ACTIONS GRID (FARMER-FIRST ACCESS TILES)
           ========================================================================= */}
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Kisan Direct Actions
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
            gap: '12px'
          }}>
            {/* 1. List Crop */}
            <Link
              to="/farmer/add-crop"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 10px',
                background: '#166534',
                color: '#ffffff',
                border: '1px solid #166534',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              <PlusCircle size={22} />
              <span>List Crop</span>
            </Link>

            {/* 2. Check Market Prices */}
            <Link
              to="/prices"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 10px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              <TrendingUp size={22} color="#166534" />
              <span>Market Prices</span>
            </Link>

            {/* 3. Find Buyers */}
            <Link
              to="/marketplace"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 10px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              <Search size={22} color="#166534" />
              <span>Find Buyers</span>
            </Link>

            {/* 4. My Listings */}
            <Link
              to="/farmer/my-crops"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 10px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              <Package size={22} color="#166534" />
              <span>My Listings ({crops.length})</span>
            </Link>

            {/* 5. My Offers */}
            <Link
              to="/farmer/offers"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 10px',
                background: pendingOffersCount > 0 ? '#fef3c7' : '#ffffff',
                color: pendingOffersCount > 0 ? '#92400e' : '#0f172a',
                border: pendingOffersCount > 0 ? '1px solid #fcd34d' : '1px solid #cbd5e1',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              <MessageSquareDiff size={22} color={pendingOffersCount > 0 ? '#d97706' : '#166534'} />
              <span>My Offers ({pendingOffersCount})</span>
            </Link>

            {/* 6. Orders */}
            <Link
              to="/farmer/orders"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 10px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              <ShoppingBag size={22} color="#166534" />
              <span>Orders ({orders.length})</span>
            </Link>

            {/* 7. Transport */}
            <Link
              to="/fleet"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 10px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              <Truck size={22} color="#166534" />
              <span>Transport</span>
            </Link>

            {/* 8. Receipts */}
            <Link
              to="/farmer/orders"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 10px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              <Receipt size={22} color="#166534" />
              <span>Receipts</span>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            3. KEY PRODUCTION & FINANCIAL METRICS (KPIs)
           ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Total Settled Earnings</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534', marginTop: '4px' }}>
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
              ✓ 100% Escrow Bank Disbursed
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Active Crop Listings</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {crops.length} Lots
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Listed on Live Wholesale Marketplace
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Pending Buyer Offers</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: pendingOffersCount > 0 ? '#b45309' : '#0f172a', marginTop: '4px' }}>
              {pendingOffersCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Awaiting your counter or acceptance
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Active Orders in Transit</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369a1', marginTop: '4px' }}>
              {orders.filter(o => o.status === 'IN_TRANSIT' || o.status === 'TRANSPORT_ASSIGNED').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Refrigerated Logistics Handshake
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. OFFICIAL APMC MANDI BENCHMARK RATES (data.gov.in / DMI)
           ========================================================================= */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Header Bar */}
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
                OFFICIAL APMC MANDI MARKET PRICES (DAILY ARRIVALS)
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                Daily Mandi Benchmark Rates — {selectedMandiCrop}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 10px', borderRadius: '3px' }}>
                Source: Government of India (data.gov.in / DMI)
              </span>
              <Link
                to={`/prices?crop=${encodeURIComponent(selectedMandiCrop)}`}
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
                Compare All Mandis →
              </Link>
            </div>
          </div>

          {/* Filter Bar: Commodity Pills & State Dropdown */}
          <div style={{
            padding: '12px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginRight: '4px' }}>
                SELECT COMMODITY:
              </span>
              {commonCommodities.map((comm) => {
                const isSelected = selectedMandiCrop.toLowerCase() === comm.toLowerCase();
                return (
                  <button
                    key={comm}
                    onClick={() => setSelectedMandiCrop(comm)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '3px',
                      fontSize: '0.78125rem',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#166534' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #166534' : '1px solid #cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    {comm}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="#64748b" />
              <select
                value={selectedMandiState}
                onChange={(e) => setSelectedMandiState(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '3px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="All">All States (National Feed)</option>
                {mandiStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mandi Rates Table */}
          {loadingMandi ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={24} className="spin" color="#166534" />
              <span style={{ fontSize: '0.875rem' }}>Loading latest APMC market prices from Government of India...</span>
            </div>
          ) : mandiPrices.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc' }}>
              <Info size={24} color="#b45309" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                Market data currently unavailable for {selectedMandiCrop} in selected region.
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '4px 0 0' }}>
                Showing latest verified benchmark data. Try selecting another commodity or "All States".
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 16px' }}>Commodity & Variety</th>
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
                  {mandiPrices.map((m, idx) => (
                    <tr key={m.id || `${m.commodity}_${m.market}_${idx}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {m.commodity || selectedMandiCrop}
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>
                          {m.variety || 'Local Standard'} {m.grade ? `• ${m.grade}` : ''}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 600 }}>
                        {m.market || 'Regional Mandi'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {m.district || ''}, {m.state || 'India'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#475569' }}>
                        ₹{Number(m.minPrice || 0).toLocaleString('en-IN')}/Qtl
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#475569' }}>
                        ₹{Number(m.maxPrice || 0).toLocaleString('en-IN')}/Qtl
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#166534', fontSize: '1rem' }}>
                        ₹{Number(m.modalPrice || 0).toLocaleString('en-IN')}/Qtl
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          ₹{(m.modalPricePerKg || ((m.modalPrice || 0) / 100)).toFixed(1)}/kg
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
                        {m.arrivalsMT ? `${m.arrivalsMT} MT` : 'Available'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                        {m.arrivalDate || m.lastUpdated || 'Today'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Transparency Strip */}
          <div style={{
            padding: '10px 18px',
            background: '#f0fdf4',
            borderTop: '1px solid #bbf7d0',
            fontSize: '0.78125rem',
            color: '#166534',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div>
              <strong>Kisan Advisory:</strong> Modal benchmark rates reflect terminal mandi prices reported to the Directorate of Marketing & Inspection (DMI). Use these benchmarks to negotiate fair farm gate asking rates on AgriNex.
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. ACTIVE CROP LISTINGS SUMMARY (WITH DIRECT ACTION CONTROLS)
           ========================================================================= */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                My Active Crop Listings ({crops.length})
              </h2>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                Harvest lots actively published to wholesale buyers on the AgriNex marketplace
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                to="/farmer/add-crop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  background: '#166534',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <PlusCircle size={14} /> + List New Crop
              </Link>
              <Link
                to="/farmer/my-crops"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Manage All Listings →
              </Link>
            </div>
          </div>

          {crops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: '4px' }}>
              <Package size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, color: '#0f172a' }}>No harvest lots listed yet</div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '4px 0 14px' }}>
                List your produce to receive direct bids and escrow contracts from verified buyers.
              </p>
              <Link to="/farmer/add-crop" style={{ padding: '6px 16px', background: '#166534', color: '#ffffff', borderRadius: '4px', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none' }}>
                + List First Harvest Lot
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '14px'
            }}>
              {crops.slice(0, 4).map((crop) => (
                <div
                  key={crop.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', height: '130px', overflow: 'hidden', background: '#f1f5f9' }}>
                    <img
                      src={crop.images && crop.images[0] ? crop.images[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                      alt={crop.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: '#166534',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      ACTIVE
                    </span>
                    <span style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '6px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      {Number(crop.quantity).toLocaleString()} {crop.unit || 'kg'}
                    </span>
                  </div>

                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                      {crop.category} • {crop.variety || 'Standard'}
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                      {crop.title}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Asking Rate</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>
                          ₹{crop.pricePerUnit} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>/ {crop.unit || 'kg'}</span>
                        </div>
                      </div>
                      <Link to={`/crops/${crop.id}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', textDecoration: 'none' }}>
                        Preview →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            6. INCOMING BUYER OFFERS TABLE (WITH 1-CLICK ACCEPT / COUNTER / REJECT)
           ========================================================================= */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Incoming Buyer Proposals & Bids ({offers.length})
              </h2>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                Review wholesale bids directly from buyers. Accept to lock digital contracts or propose a counter-rate.
              </div>
            </div>

            <Link
              to="/farmer/offers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              View Full Negotiation Desk →
            </Link>
          </div>

          {offers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: '4px' }}>
              <MessageSquareDiff size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, color: '#0f172a' }}>No buyer offers received yet</div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '4px 0 0' }}>
                When institutional buyers place price bids on your listings, they will appear here in real time.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 14px' }}>Produce Lot</th>
                    <th style={{ padding: '10px 14px' }}>Wholesale Buyer</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Bid Rate</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Lot Value</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.slice(0, 4).map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {o.cropTitle}
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>
                          Lot: {o.quantity} {o.unit || 'kg'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>
                        <strong>{o.buyerName}</strong>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#166534' }}>
                        ₹{o.offeredPrice} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>/ {o.unit || 'kg'}</span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                        ₹{Number(o.totalPrice).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '3px',
                          background: o.status === 'ACCEPTED' ? '#ecfdf5' : o.status === 'PENDING' ? '#fef3c7' : '#f1f5f9',
                          color: o.status === 'ACCEPTED' ? '#166534' : o.status === 'PENDING' ? '#92400e' : '#475569'
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <Link
                          to="/farmer/offers"
                          style={{
                            padding: '4px 10px',
                            background: '#166534',
                            color: '#ffffff',
                            borderRadius: '3px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          Review & Settle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =========================================================================
            7. RECENT DISPATCHED ORDERS & DIGITAL RECEIPTS
           ========================================================================= */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Dispatched Orders & Escrow Settlements ({orders.length})
              </h2>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                Track cold-chain transporter dispatch, escrow payment releases, and official digital tax receipts
              </div>
            </div>

            <Link
              to="/farmer/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              View All Orders & Deliveries →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: '4px' }}>
              <ShoppingBag size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, color: '#0f172a' }}>No orders currently dispatched</div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '4px 0 0' }}>
                Accepted buyer offers will generate contract orders and dispatch records here automatically.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 14px' }}>Order Ref #</th>
                    <th style={{ padding: '10px 14px' }}>Produce Lot</th>
                    <th style={{ padding: '10px 14px' }}>Procuring Buyer</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Settled Value</th>
                    <th style={{ padding: '10px 14px' }}>Transporter</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Digital Record</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 4).map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                        {ord.orderNumber || ord.id}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>
                        <strong>{ord.cropTitle}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {ord.quantity} {ord.unit || 'kg'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>
                        {ord.buyerName}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#166534' }}>
                        ₹{Number(ord.totalPrice).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '0.8125rem' }}>
                        <Truck size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {ord.transporterName || 'Kisan Logistics'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '3px',
                          background: ord.status === 'COMPLETED' || ord.status === 'DELIVERED' ? '#ecfdf5' : '#eff6ff',
                          color: ord.status === 'COMPLETED' || ord.status === 'DELIVERED' ? '#166534' : '#1d4ed8'
                        }}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(ord)}
                          style={{
                            padding: '4px 10px',
                            background: '#ffffff',
                            color: '#166534',
                            border: '1px solid #166534',
                            borderRadius: '3px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Receipt size={12} /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Profit Calculator Modal */}
        <ProfitCalculatorModal
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
        />

        {/* Digital Receipt Modal */}
        {selectedReceiptOrder && (
          <ReceiptModal
            order={selectedReceiptOrder}
            onClose={() => setSelectedReceiptOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
