import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import CameraCapture from '../../components/camera/CameraCapture';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  cropMasterCatalog,
  getCategories,
  getCropsByCategory,
  getCropById
} from '../../data/cropMasterCatalog';
import {
  Camera,
  Upload,
  Sparkles,
  PlusCircle,
  X,
  CheckCircle2,
  Trash2,
  Star,
  Info,
  ExternalLink,
  ShieldCheck,
  Thermometer,
  Clock,
  UserCheck,
  Phone,
  Navigation
} from 'lucide-react';
import LiveLocationBadge from '../../components/common/LiveLocationBadge';

export default function AddCrop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill from AI Scanner if navigated with scan state
  const scanData = location.state?.scanData;
  const scanImage = location.state?.scanImage;

  const catalogCategories = getCategories();
  const [category, setCategory] = useState(scanData?.suggestedCategory || 'Vegetables');
  const [selectedCropId, setSelectedCropId] = useState('tomato');
  const [customCropName, setCustomCropName] = useState('');
  const [title, setTitle] = useState(scanData?.suggestedTitle || 'Vine-Ripened Grade A Tomato');
  const [variety, setVariety] = useState('Hybrid Tomato (F1)');
  const [quantity, setQuantity] = useState(1000);
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState(scanData?.suggestedExpectedPrice || 32);
  const [minPrice, setMinPrice] = useState(scanData?.suggestedMinPrice || 26);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [qualityGrade, setQualityGrade] = useState(scanData?.qualityGrade || 'Grade A');
  const [isOrganic, setIsOrganic] = useState(true);
  const [description, setDescription] = useState(
    scanData
      ? `AI Scanned Harvest: ${scanData.condition}. High quality produce grown under bio-organic standards.`
      : ''
  );
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [liveCoordinates, setLiveCoordinates] = useState(null);

  // Public Cultivator Details (for guest / public dashboard listing)
  const [publicFarmerName, setPublicFarmerName] = useState('');
  const [publicPhone, setPublicPhone] = useState('');

  // Images state
  const [images, setImages] = useState(scanImage ? [scanImage] : []);
  const [showCamera, setShowCamera] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Available crops under selected category
  const availableCrops = getCropsByCategory(category);
  const activeCropData = getCropById(selectedCropId) || availableCrops[0];

  // Handle category change
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const cropsInCat = getCropsByCategory(newCat);
    if (cropsInCat.length > 0) {
      applyCropDefaults(cropsInCat[0]);
    }
  };

  // Handle master crop selection
  const handleCropSelect = (cropId) => {
    setSelectedCropId(cropId);
    const crop = getCropById(cropId);
    if (crop) {
      applyCropDefaults(crop);
    }
  };

  const applyCropDefaults = (crop) => {
    setSelectedCropId(crop.id);
    const firstVariety = crop.varieties && crop.varieties.length > 0 ? crop.varieties[0] : 'Standard Grade';
    setVariety(firstVariety);
    setUnit(crop.unit || 'kg');
    setPricePerUnit(crop.benchmarkPricePerKg);
    setMinPrice(crop.minPricePerKg);
    setTitle(`Farm Fresh ${crop.name} (${firstVariety})`);
    if (!description || description.startsWith('Farm Fresh') || description.startsWith('Slender') || description.startsWith('High')) {
      setDescription(crop.description);
    }
    if (images.length === 0 && crop.image) {
      setImages([crop.image]);
    }
  };

  const handleAddImage = (imgBase64) => {
    setImages(prev => [imgBase64, ...prev]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimary = (index) => {
    setImages(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title,
        category,
        variety,
        quantity: Number(quantity),
        unit,
        pricePerUnit: Number(pricePerUnit),
        minPrice: Number(minPrice),
        harvestDate,
        qualityGrade,
        isOrganic,
        description: description || `Freshly harvested ${title}.`,
        location: {
          district,
          state,
          coordinates: liveCoordinates || { lat: 19.9975, lng: 73.7898 }
        },
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'],
        farmerName: user?.name || publicFarmerName || 'Verified Public Cultivator',
        farmerPhone: publicPhone || undefined
      };

      const res = await api.post('/crops', payload);
      if (res.success) {
        alert('🎉 Crop listed successfully on the AgriNex Marketplace!');
        if (user) {
          navigate('/farmer/my-crops');
        } else {
          navigate('/marketplace');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to publish crop listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px', maxWidth: '820px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-success">DIRECT LISTING PIPELINE</span>
          {!user && (
            <span className="badge badge-warning" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
              🌐 PUBLIC ACCESS ACTIVE
            </span>
          )}
          {scanData && (
            <span className="badge badge-warning">
              <Sparkles size={12} /> PRE-FILLED VIA AI SCANNER
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '4px' }}>
          List Your Harvest on Marketplace
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          Connect directly with thousands of institutional wholesale buyers. No middleman deductions.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Public Cultivator Card if not authenticated */}
        {!user && (
          <div className="glass-card" style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(2, 132, 199, 0.08))',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <UserCheck size={18} color="#10b981" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Public Cultivator / Farm Details</h3>
              <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>PUBLIC ACCESS DESK</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              You are listing this harvest lot directly from the public dashboard. Enter your farm details below so institutional buyers can contact you or submit escrow bids.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Cultivator / Farm Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patil Organic Farm"
                  value={publicFarmerName}
                  onChange={(e) => setPublicFarmerName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Contact Mobile (WhatsApp Enabled)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={publicPhone}
                  onChange={(e) => setPublicPhone(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}
        {/* Images Upload / Camera Section */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
            1. Crop Photographs
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Real photos increase buyer bid frequency by 3.4x. Use our browser camera or upload from your device.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="btn btn-primary btn-sm"
            >
              <Camera size={16} /> Take Live Photo
            </button>
            <button
              type="button"
              onClick={() => {
                const sampleTomato = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600';
                handleAddImage(sampleTomato);
              }}
              className="btn btn-secondary btn-sm"
            >
              Add Sample Photo
            </button>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '14px', marginTop: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: i === 0 ? '2.5px solid #10b981' : '1px solid var(--border-color)',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {i === 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      PRIMARY
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commodity Specifications */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. Harvest Commodity Details</h3>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              80+ MASTER CROPS SUPPORTED
            </span>
          </div>

          {/* 3-Tier Categorization: Category -> Master Crop -> Variety */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-select"
              >
                {catalogCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Select Master Crop ({availableCrops.length} available)
              </label>
              <select
                value={selectedCropId}
                onChange={(e) => handleCropSelect(e.target.value)}
                className="form-select"
                style={{ fontWeight: 600 }}
              >
                {availableCrops.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.subCategory ? `— (${c.subCategory})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Variety / Cultivar</label>
              {activeCropData?.varieties && activeCropData.varieties.length > 0 ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="form-select"
                  >
                    {activeCropData.varieties.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                    <option value="CUSTOM">Custom / Other Cultivar...</option>
                  </select>
                  {variety === 'CUSTOM' && (
                    <input
                      type="text"
                      placeholder="Type cultivar name..."
                      onChange={(e) => setVariety(e.target.value)}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Traditional Grade"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="form-input"
                />
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Crop Listing Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Farm Fresh Grade A Basmati"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Available Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="form-select"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="quintal">Quintals (100 kg)</option>
                <option value="ton">Tonnes (1000 kg)</option>
                <option value="crate">Crates (25 kg)</option>
                <option value="box">Carton Boxes</option>
                <option value="bunch">Bunches</option>
                <option value="sack">Sacks (40-50 kg)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Asking Price per {unit} (₹)
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.5"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Minimum Acceptable Price (₹)
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Dynamic AI Recommended Price & Agronomy Guidance */}
          {activeCropData && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(37, 99, 235, 0.05))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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
                  <div style={{ fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      APMC Benchmark for {activeCropData.name}:
                    </span>{' '}
                    <span style={{ color: '#10b981', fontWeight: 700 }}>
                      ₹{activeCropData.benchmarkPricePerKg} / {activeCropData.unit || 'kg'}
                    </span>{' '}
                    <span style={{ color: 'var(--text-muted)' }}>
                      (Typical Mandi range: ₹{activeCropData.minPricePerKg} – ₹{activeCropData.maxPricePerKg})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPricePerUnit(activeCropData.benchmarkPricePerKg);
                      setMinPrice(activeCropData.minPricePerKg);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '5px 12px', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  >
                    Apply Benchmark (₹{activeCropData.benchmarkPricePerKg})
                  </button>
                  <Link
                    to="/prices"
                    target="_blank"
                    style={{
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#10b981',
                      fontWeight: 700,
                      textDecoration: 'none',
                      padding: '4px 6px'
                    }}
                  >
                    Live Mandi Trends <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              {/* Shelf Life & Storage Parameters */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
                paddingTop: '8px',
                borderTop: '1px dashed rgba(16, 185, 129, 0.2)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} color="#10b981" />
                  <span><strong>Shelf Life:</strong> ~{activeCropData.shelfLifeDays} Days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Thermometer size={13} color="#3b82f6" />
                  <span><strong>Optimal Storage:</strong> {activeCropData.coldStorageTemp}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={13} color="#f59e0b" />
                  <span><strong>Major Belts:</strong> {activeCropData.states?.slice(0, 3).join(', ')}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Quality Grade</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="form-select"
              >
                <option>Grade A (Export Ready)</option>
                <option>Export Grade</option>
                <option>Grade B</option>
                <option>Commercial Grade</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Harvest Date</label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
            />
            <span>Certified Bio-Organic Cultivation (Zero Synthetic Pesticides)</span>
          </label>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Produce Description & Curing Notes</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="e.g. Well cured on hay beds, 55mm+ uniform bulb sizing, optimal moisture..."
            />
          </div>

          {/* Real Live GPS Location Access for Farmer */}
          <div style={{ marginBottom: '10px' }}>
            <LiveLocationBadge
              role="FARMER"
              onLocationDetected={(loc) => {
                if (loc.district) setDistrict(loc.district);
                if (loc.state) setState(loc.state);
                setLiveCoordinates({ lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy });
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Farm District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
        >
          {submitting ? 'Publishing Listing...' : 'Publish Harvest to AgriNex Marketplace'}
        </button>
      </form>

      {/* Real Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={(img) => {
            handleAddImage(img);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
