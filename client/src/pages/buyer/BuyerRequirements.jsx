import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CropCard from '../../components/marketplace/CropCard';
import OfferModal from '../../components/negotiation/OfferModal';
import {
  cropMasterCatalog,
  getCategories,
  getCropsByCategory
} from '../../data/cropMasterCatalog';
import { PlusCircle, Search, Sparkles, CheckCircle2, MapPin, Calendar, Tag, ShieldCheck } from 'lucide-react';

export default function BuyerRequirements() {
  const [requirements, setRequirements] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [matchedCrops, setMatchedCrops] = useState([]);
  const [selectedCropForOffer, setSelectedCropForOffer] = useState(null);

  // Form inputs
  const catalogCategories = getCategories();
  const [category, setCategory] = useState('Vegetables');
  const [cropName, setCropName] = useState('Red Onions');
  const [quantity, setQuantity] = useState(3000);
  const [maxPrice, setMaxPrice] = useState(30);
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [isOrganic, setIsOrganic] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('2026-10-05');
  const [loading, setLoading] = useState(false);

  const availableCrops = getCropsByCategory(category);

  useEffect(() => {
    async function loadReqs() {
      try {
        const res = await api.get('/requirements');
        if (res.success) setRequirements(res.data);
      } catch (err) {
        console.warn('Error fetching requirements:', err);
      }
    }
    loadReqs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/requirements', {
        cropName,
        category,
        quantity: Number(quantity),
        maxPrice: Number(maxPrice),
        qualityGrade,
        isOrganic,
        deliveryDate
      });

      if (res.success) {
        setRequirements([res.data.requirement, ...requirements]);
        setMatchedCrops(res.data.matches || []);
        setShowCreateModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit requirement.');
    } finally {
      setLoading(false);
    }
  };

  const viewMatches = async (reqId) => {
    try {
      const res = await api.get(`/requirements/${reqId}/match`);
      if (res.success) setMatchedCrops(res.data);
    } catch (err) {
      console.warn('Matches error:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-success">BULK PROCUREMENT TENDERS</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
            Buyer Procurement Requirements
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Post bulk commodity demand; our algorithm automatically matches verified farmers matching price and quality.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusCircle size={18} /> Post New Requirement
        </button>
      </div>

      {/* Posted Requirements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Active Tender Postings</h3>
        {requirements.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No requirements posted yet. Click "Post New Requirement" above.</p>
          </div>
        ) : (
          requirements.map((req) => (
            <div
              key={req.id}
              className="glass-card"
              style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}
            >
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{req.cropName}</h4>
                  {req.isOrganic && <span className="badge badge-success"><Sparkles size={11} /> Organic</span>}
                  <span className="badge badge-neutral">{req.qualityGrade}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>Required: <strong>{Number(req.quantity).toLocaleString()} {req.unit || 'kg'}</strong></span>
                  <span>Max Budget: <strong>₹{req.maxPrice} / {req.unit || 'kg'}</strong></span>
                  <span>Target Delivery: <strong>{req.deliveryDate}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => viewMatches(req.id)}
                  className="btn btn-secondary btn-sm"
                >
                  <Search size={16} /> View Matched Farmers ({req.matchedFarmerCount || 3})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Matched Farmers Harvests */}
      {matchedCrops.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Algorithmically Matched Farmers ({matchedCrops.length} Found)
              </h3>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Formula: <code>net value = price × quantity − transport cost</code>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {matchedCrops.map((crop) => (
              <div key={crop.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ fontWeight: 800, color: '#10b981' }}>
                    🎯 {crop.matchScore || 92}% Match Score
                  </span>
                  {crop.netValue && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Net: ₹{Number(crop.netValue).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <CropCard
                  crop={crop}
                  onMakeOffer={(c) => setSelectedCropForOffer(c)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>Post Procurement Tender</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Broadcast your demand to verified farm producers
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setCategory(newCat);
                      const list = getCropsByCategory(newCat);
                      if (list.length > 0) {
                        setCropName(list[0].name);
                        setMaxPrice(list[0].benchmarkPricePerKg);
                      }
                    }}
                    className="form-select"
                  >
                    {catalogCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Select Crop ({availableCrops.length})
                  </label>
                  <select
                    value={cropName}
                    onChange={(e) => {
                      const selected = availableCrops.find(c => c.name === e.target.value);
                      setCropName(e.target.value);
                      if (selected) {
                        setMaxPrice(selected.benchmarkPricePerKg);
                      }
                    }}
                    className="form-select"
                    style={{ fontWeight: 600 }}
                  >
                    {availableCrops.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} (₹{c.benchmarkPricePerKg}/kg)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Commodity Requirement Title / Specifications
                </label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Grade A Basmati Rice or Nashik Red Onions"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Max Price (₹/kg)</label>
                  <input
                    type="number"
                    required
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="form-select"
                  >
                    <option>Grade A</option>
                    <option>Export Grade</option>
                    <option>Grade B</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Target Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                />
                <span>Require Organic Certified Harvest</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                  {loading ? 'Matching Farmers...' : 'Publish Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {selectedCropForOffer && (
        <OfferModal
          crop={selectedCropForOffer}
          onClose={() => setSelectedCropForOffer(null)}
          onOfferSubmitted={() => alert('Offer submitted to matched farmer!')}
        />
      )}
    </div>
  );
}
