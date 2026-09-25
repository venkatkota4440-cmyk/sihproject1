import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ProfitCalculatorModal from '../../components/farmer/ProfitCalculatorModal';
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
  Info
} from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);

  // Government Mandi Market Price State (data.gov.in integration)
  const [selectedMandiCrop, setSelectedMandiCrop] = useState(user?.primaryCrop || 'Potato');
  const [selectedMandiState, setSelectedMandiState] = useState('All');
  const [mandiPrices, setMandiPrices] = useState([]);
  const [latestMandiPrice, setLatestMandiPrice] = useState(null);
  const [loadingMandi, setLoadingMandi] = useState(false);
  const [mandiStates, setMandiStates] = useState([]);
  const [dataFreshness, setDataFreshness] = useState('VERIFIED_STORED');

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
            if (listRes.dataFreshness) setDataFreshness(listRes.dataFreshness);
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
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-success">
              <ShieldCheck size={12} /> VERIFIED FARM PRODUCER
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#fbbf24', fontWeight: 700 }}>
              <Star size={14} fill="#fbbf24" /> 4.9 (38 ratings)
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
            Namaste, {user?.name || 'Ramesh Patel'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {user?.farmInfo?.farmName || 'Patel Bio-Green Farms, Niphad (Nashik)'} • Direct Wholesale Marketplace
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/farmer/add-crop" className="btn btn-primary">
            <PlusCircle size={18} /> List New Crop
          </Link>
          <Link to="/crop-scanner" className="btn btn-secondary">
            <ScanLine size={18} color="#10b981" /> AI Crop Scanner
          </Link>
          <button
            onClick={() => setShowCalculator(true)}
            className="btn btn-secondary"
          >
            <Calculator size={18} color="#f59e0b" /> Profit Calculator
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Settled Earnings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            100% Escrow Bank Disbursed
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Crop Listings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {crops.length} Harvests
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
            Listed on Live Marketplace
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pending Buyer Bids</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
            {pendingOffersCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Awaiting your counter/acceptance
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Orders in Transit</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
            {orders.filter(o => o.status === 'IN_TRANSIT' || o.status === 'TRANSPORT_ASSIGNED').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Reefer Logistics Assigned
          </div>
        </div>
      </div>

      {/* TODAY'S MARKET PRICES - Government Mandi API (data.gov.in / DMI) */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header with Title, Source Badge, and Full Discovery Desk Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={12} /> OFFICIAL MANDI BENCHMARK
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Directorate of Marketing & Inspection (DMI)
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              TODAY'S MARKET PRICES
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Official Government of India daily mandi wholesale rates for pricing decisions and harvest planning.
            </p>
          </div>

          <Link to={`/prices?crop=${encodeURIComponent(selectedMandiCrop)}`} className="btn btn-outline btn-sm" style={{ fontWeight: 700 }}>
            Compare All Mandis <ArrowRight size={14} />
          </Link>
        </div>

        {/* Filter Controls: Commodity Pills & State Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: 'var(--bg-muted)', padding: '12px 16px', borderRadius: '14px' }}>
          {/* Commodity Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>
              CROP:
            </span>
            {commonCommodities.map((comm) => (
              <button
                key={comm}
                onClick={() => setSelectedMandiCrop(comm)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8125rem',
                  fontWeight: selectedMandiCrop.toLowerCase() === comm.toLowerCase() ? 800 : 500,
                  background: selectedMandiCrop.toLowerCase() === comm.toLowerCase() ? '#059669' : 'transparent',
                  color: selectedMandiCrop.toLowerCase() === comm.toLowerCase() ? '#ffffff' : 'var(--text-main)',
                  border: selectedMandiCrop.toLowerCase() === comm.toLowerCase() ? '1px solid #059669' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {comm}
              </button>
            ))}
          </div>

          {/* State Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={14} color="var(--text-muted)" />
            <select
              value={selectedMandiState}
              onChange={(e) => setSelectedMandiState(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="All">All States (Nationwide)</option>
              {mandiStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loadingMandi && (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <RefreshCw size={24} className="spin" color="#059669" />
            <span style={{ fontSize: '0.875rem' }}>Loading latest market prices from Government of India...</span>
          </div>
        )}

        {/* Empty / Error State */}
        {!loadingMandi && mandiPrices.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', background: 'var(--bg-muted)', borderRadius: '12px' }}>
            <Info size={28} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Market data temporarily unavailable for {selectedMandiCrop}</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Showing latest verified stored data from Government of India. Try selecting another crop or "All States".
            </p>
          </div>
        )}

        {/* Mandi Price Cards Grid */}
        {!loadingMandi && mandiPrices.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {mandiPrices.map((m, idx) => (
              <div
                key={m.id || `${m.commodity}_${m.market}_${idx}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div>
                  {/* Card Header: Commodity & Variety */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        {m.commodity || selectedMandiCrop}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Variety: <strong>{m.variety || 'Local / Standard'}</strong> {m.grade ? `• ${m.grade}` : ''}
                      </div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                      {m.state || 'India'}
                    </span>
                  </div>

                  {/* Market & Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-main)', fontWeight: 600, margin: '10px 0 16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <MapPin size={14} color="#059669" />
                    <span>Market: <strong>{m.market || 'Regional Mandi'}</strong></span>
                  </div>

                  {/* Price Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-muted)', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Min Price:</span>
                      <strong style={{ color: 'var(--text-main)' }}>₹{Number(m.minPrice || 0).toLocaleString('en-IN')} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>/ Quintal</span></strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Max Price:</span>
                      <strong style={{ color: 'var(--text-main)' }}>₹{Number(m.maxPrice || 0).toLocaleString('en-IN')} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>/ Quintal</span></strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
                      <div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#059669' }}>Modal Price:</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Official Benchmark)</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>
                          ₹{Number(m.modalPrice || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          ₹{(m.modalPricePerKg || ((m.modalPrice || 0) / 100)).toFixed(1)} / kg
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date & Metadata */}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>Last Updated: <strong>{m.arrivalDate || m.lastUpdated || 'Today'}</strong></span>
                    </div>
                    <div>Source: <strong>Government of India – data.gov.in / DMI</strong></div>
                  </div>
                </div>

                {/* View Details Link */}
                <Link
                  to={`/prices?crop=${encodeURIComponent(m.commodity || selectedMandiCrop)}&tab=compare`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(5, 150, 105, 0.08)',
                    color: '#059669',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Source Attribution Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            Data Source: <strong>Government of India — data.gov.in / Directorate of Marketing & Inspection (DMI)</strong>
          </div>
          <div>
            Official Daily Mandi Granularity • Real Mandi Benchmark
          </div>
        </div>
      </div>

      {/* Smart Market Intelligence & Arbitrage Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.22) 100%)',
        border: '1.5px solid rgba(16, 185, 129, 0.35)',
        borderRadius: '20px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>AI MARKET INTELLIGENCE</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#059669' }}>+₹22,572 Profit Opportunity</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              High-Paying APMC Arbitrage Opportunity Detected
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Wholesale onion rates in Azadpur Mandi are currently ₹42/kg (+42.6% net surplus over local Lasalgaon spot after transport freight).
            </p>
          </div>
        </div>

        <Link to="/prices" className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
          Open Arbitrage Scanner <ArrowRight size={14} />
        </Link>
      </div>

      {/* Incoming Offers Preview */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Incoming Wholesale Bids</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Direct price proposals from verified institutional purchasers</p>
          </div>
          <Link to="/farmer/offers" className="btn btn-outline btn-sm">
            View All Offers <ArrowRight size={14} />
          </Link>
        </div>

        {offers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No offers received yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {offers.slice(0, 3).map((o) => (
              <div
                key={o.id}
                style={{
                  background: 'var(--bg-muted)',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{o.cropTitle}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Buyer: <strong>{o.buyerName}</strong> • {o.quantity} {o.unit}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹{o.offeredPrice} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {o.unit}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                    Total: ₹{Number(o.totalPrice).toLocaleString('en-IN')}
                  </div>
                </div>

                <Link to="/farmer/offers" className="btn btn-primary btn-sm">
                  Review & Counter
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Orders Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Dispatched Orders & Escrow Status</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Track refrigerated logistics and delivery handshakes</p>
          </div>
          <Link to="/farmer/orders" className="btn btn-outline btn-sm">
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No orders currently dispatched.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.slice(0, 2).map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: 'var(--bg-muted)',
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800 }}>{ord.orderNumber || ord.id}</span>
                    <span className="badge badge-warning">{ord.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {ord.quantity} {ord.unit} {ord.cropTitle} ➔ {ord.buyerName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#059669' }}>
                    ₹{Number(ord.totalPrice).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Transporter: {ord.transporterName || 'Kisan Logistics'}
                  </div>
                </div>

                <Link to="/farmer/orders" className="btn btn-secondary btn-sm">
                  Track Delivery
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profit Calculator Modal */}
      <ProfitCalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
      />
    </div>
  );
}
