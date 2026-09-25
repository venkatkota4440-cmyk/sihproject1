import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  ShoppingBag,
  Store,
  PlusCircle,
  Truck,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  Building2,
  Search,
  MapPin,
  Calendar,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);

  // Mandi Price Intelligence State (data.gov.in integration)
  const [searchCommodity, setSearchCommodity] = useState('Potato');
  const [selectedState, setSelectedState] = useState('All');
  const [mandiPrices, setMandiPrices] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [loadingMandi, setLoadingMandi] = useState(false);

  const quickCommodities = ['Potato', 'Onion', 'Tomato', 'Wheat', 'Rice', 'Soyabean', 'Maize', 'Cotton'];

  useEffect(() => {
    async function loadStates() {
      try {
        const res = await api.get('/market-prices/states');
        if (res.success && Array.isArray(res.data)) {
          setStatesList(res.data);
        }
      } catch (e) {}
    }
    loadStates();
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchMandiPrices() {
      setLoadingMandi(true);
      try {
        const params = new URLSearchParams();
        if (searchCommodity) params.append('commodity', searchCommodity);
        if (selectedState && selectedState !== 'All') params.append('state', selectedState);
        params.append('limit', '6');

        const res = await api.get(`/market-prices?${params.toString()}`);
        if (active && res.success && Array.isArray(res.data)) {
          setMandiPrices(res.data);
        } else if (active) {
          setMandiPrices([]);
        }
      } catch (err) {
        if (active) setMandiPrices([]);
      } finally {
        if (active) setLoadingMandi(false);
      }
    }
    fetchMandiPrices();
    return () => { active = false; };
  }, [searchCommodity, selectedState]);

  useEffect(() => {
    async function loadData() {
      try {
        const ordRes = await api.get('/orders');
        if (ordRes.success) setOrders(ordRes.data);

        const offRes = await api.get('/offers');
        if (offRes.success) setOffers(offRes.data);
      } catch (err) {}
    }
    loadData();
  }, []);

  const totalSpent = orders
    .filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED' || o.status === 'IN_TRANSIT')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const activeInTransit = orders.filter(o => o.status === 'IN_TRANSIT' || o.status === 'TRANSPORT_ASSIGNED').length;

  return (
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-success">BUYER PROCUREMENT HUB</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
            Welcome back, {user?.name || 'Wholesale Buyer'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Direct agricultural wholesale purchasing, contract fulfillment, and cold-chain deliveries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/marketplace" className="btn btn-primary">
            <Store size={18} /> Browse Marketplace
          </Link>
          <Link to="/buyer/requirements" className="btn btn-secondary">
            <PlusCircle size={18} /> Post Tender
          </Link>
        </div>
      </div>

      {/* AI Market Intelligence & Sourcing Desk Banner */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        borderLeft: '4px solid #2563eb',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(30, 64, 175, 0.03))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>AI Smart Procurement & Sourcing Matchmaker</span>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>AI POWERED</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Compare real-time terminal APMC prices against direct farm gate lots, calculate transport margins, and auto-match with verified Grade-A farmers.
            </p>
          </div>
        </div>
        <Link to="/prices" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
          Launch Intelligence Desk <ArrowRight size={16} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Procurement Volume</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {orders.length} orders
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Shipments In Transit</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
            {activeInTransit} Loads
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Live GPS telemetry active
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Bids & Negotiations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {offers.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Direct bids with producers
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Escrow Status</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
            100% Protected
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            OTP release guarantee
          </div>
        </div>
      </div>

      {/* LATEST MANDI MARKET PRICES & APMC BENCHMARKS (data.gov.in / DMI) */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={12} /> OFFICIAL APMC BENCHMARKS
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Directorate of Marketing & Inspection (DMI) • data.gov.in
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Latest Mandi Market Prices & Comparisons
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Verified Government of India daily mandi modal rates for terminal procurement, cold-storage intake, and contract benchmarking.
            </p>
          </div>

          <Link to={`/prices?crop=${encodeURIComponent(searchCommodity)}`} className="btn btn-outline btn-sm" style={{ fontWeight: 700 }}>
            Launch Full Market Discovery <ArrowRight size={14} />
          </Link>
        </div>

        {/* Search Bar & State Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: 'var(--bg-muted)', padding: '14px 18px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search commodity (e.g. Potato, Wheat, Onion)..."
                value={searchCommodity}
                onChange={(e) => setSearchCommodity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>QUICK CROPS:</span>
            {quickCommodities.map((comm) => (
              <button
                key={comm}
                onClick={() => setSearchCommodity(comm)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: searchCommodity.toLowerCase() === comm.toLowerCase() ? 800 : 500,
                  background: searchCommodity.toLowerCase() === comm.toLowerCase() ? '#2563eb' : 'transparent',
                  color: searchCommodity.toLowerCase() === comm.toLowerCase() ? '#ffffff' : 'var(--text-main)',
                  border: searchCommodity.toLowerCase() === comm.toLowerCase() ? '1px solid #2563eb' : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {comm}
              </button>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
              <MapPin size={14} color="var(--text-muted)" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
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
                <option value="All">All States</option>
                {statesList.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Factual Comparison Metric Pills */}
        {!loadingMandi && mandiPrices.length > 1 && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'rgba(37, 99, 235, 0.05)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.15)' }}>
            <div style={{ fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Verified Mandis Reporting: </span>
              <strong>{mandiPrices.length} markets</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Lowest modal price: </span>
              <strong style={{ color: '#059669' }}>₹{minModal.toLocaleString('en-IN')} / Qtl (₹{(minModal / 100).toFixed(1)}/kg)</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Average modal price: </span>
              <strong>₹{avgModal.toLocaleString('en-IN')} / Qtl (₹{(avgModal / 100).toFixed(1)}/kg)</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Highest modal price: </span>
              <strong style={{ color: '#d97706' }}>₹{maxModal.toLocaleString('en-IN')} / Qtl (₹{(maxModal / 100).toFixed(1)}/kg)</strong>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingMandi && (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <RefreshCw size={24} className="spin" color="#2563eb" />
            <span style={{ fontSize: '0.875rem' }}>Loading latest market prices from Government of India...</span>
          </div>
        )}

        {/* Empty State */}
        {!loadingMandi && mandiPrices.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', background: 'var(--bg-muted)', borderRadius: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No verified market data available for "{searchCommodity}"</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              No official mandi arrival report has been recorded yet for this filter. Try selecting "All States" or another commodity.
            </p>
          </div>
        )}

        {/* Mandi Cards Grid */}
        {!loadingMandi && mandiPrices.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {mandiPrices.map((m, idx) => {
              const isLowest = mandiPrices.length > 1 && Number(m.modalPrice) === minModal;
              const isHighest = mandiPrices.length > 1 && Number(m.modalPrice) === maxModal;

              return (
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                          {m.commodity || searchCommodity}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Variety: <strong>{m.variety || 'Standard'}</strong> {m.grade ? `• ${m.grade}` : ''}
                        </div>
                      </div>
                      {isLowest && (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Lowest Modal Price</span>
                      )}
                      {isHighest && (
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Highest Modal Price</span>
                      )}
                      {!isLowest && !isHighest && (
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{m.state || 'India'}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-main)', fontWeight: 600, margin: '10px 0 16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                      <MapPin size={14} color="#2563eb" />
                      <span>Market: <strong>{m.market || 'Regional Mandi'}</strong></span>
                    </div>

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
                          <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#2563eb' }}>Modal Price:</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Official Benchmark)</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb' }}>
                            ₹{Number(m.modalPrice || 0).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            ₹{(m.modalPricePerKg || ((m.modalPrice || 0) / 100)).toFixed(1)} / kg
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        <span>Last Updated: <strong>{m.arrivalDate || m.lastUpdated || 'Today'}</strong></span>
                      </div>
                      <div>Source: <strong>Government of India – data.gov.in / DMI</strong></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to={`/marketplace?search=${encodeURIComponent(m.commodity || searchCommodity)}`}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      Source Crop
                    </Link>
                    <Link
                      to={`/prices?crop=${encodeURIComponent(m.commodity || searchCommodity)}&tab=compare`}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      Compare Markets
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            Data Source: <strong>Government of India — data.gov.in / Directorate of Marketing & Inspection (DMI)</strong>
          </div>
          <div>
            Daily Granularity • Last Updated Mandi Benchmarks
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Link to="/buyer/orders" className="glass-card" style={{ padding: '24px', textDecoration: 'none', color: 'inherit' }}>
          <Truck size={28} color="#059669" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Track Shipments & Orders</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
            View live GPS truck positions, inspect delivery temperature, and provide arrival OTP.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700, fontSize: '0.8125rem', marginTop: '14px' }}>
            Open Order Tracker <ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/buyer/offers" className="glass-card" style={{ padding: '24px', textDecoration: 'none', color: 'inherit' }}>
          <Clock size={28} color="#f59e0b" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Review Counter-Offers</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
            Accept farmer price negotiations to automatically lock digital contracts.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700, fontSize: '0.8125rem', marginTop: '14px' }}>
            Review Bids <ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/prices" className="glass-card" style={{ padding: '24px', textDecoration: 'none', color: 'inherit' }}>
          <TrendingUp size={28} color="#2563eb" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Price Discovery Desk</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
            Compare spot rates against official APMC Mandi trends and AI forecasts.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 700, fontSize: '0.8125rem', marginTop: '14px' }}>
            View Market Mandis <ArrowRight size={14} />
          </div>
        </Link>
      </div>
    </div>
  );
}
