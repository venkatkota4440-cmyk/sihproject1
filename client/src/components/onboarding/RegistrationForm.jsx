import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sprout, ShoppingCart, Lock, Mail, Phone, User, MapPin, Eye, EyeOff, ChevronLeft, ArrowRight } from 'lucide-react';

export default function RegistrationForm({ role = 'FARMER', onRegistered, onBackToRole }) {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: 'Maharashtra',
    district: 'Nashik',
    villageCity: '',
    // Farmer fields
    farmName: '',
    farmSize: '5 Acres',
    primaryCrops: 'Wheat, Onion, Tomato',
    // Buyer fields
    businessName: '',
    buyerType: 'Wholesaler',
    requiredCropCategories: 'Vegetables, Cereals'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all mandatory fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.villageCity
        },
        farmInfo: role === 'FARMER' ? {
          farmName: formData.farmName || `${formData.name}'s Farm`,
          farmSize: formData.farmSize,
          primaryCrops: formData.primaryCrops.split(',').map(s => s.trim()).filter(Boolean)
        } : null,
        companyName: role === 'BUYER' ? (formData.businessName || `${formData.name} Trading`) : '',
        businessInfo: role === 'BUYER' ? {
          businessName: formData.businessName || `${formData.name} Trading`,
          buyerType: formData.buyerType,
          requiredCrops: formData.requiredCropCategories.split(',').map(s => s.trim()).filter(Boolean)
        } : null
      };

      const res = await register(payload);
      setLoading(false);

      if (res.success) {
        if (onRegistered) onRegistered(res.data.user);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Network error occurred during registration.');
    }
  };

  const isFarmer = role === 'FARMER';

  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '28px',
      padding: '36px 32px',
      boxShadow: 'var(--shadow-xl)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={onBackToRole}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={16} /> Change Role
        </button>

        <span className={`badge ${isFarmer ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.8125rem' }}>
          {isFarmer ? '🌾 Farmer Registration' : '🛒 Buyer Registration'}
        </span>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
          Create Your {isFarmer ? 'Farmer Producer' : 'Direct Buyer'} Account
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Verification will be conducted on the next step before accessing live marketplace trading.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Full Name & Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Full Name *</label>
            <div className="input-group">
              <span className="input-icon"><User size={16} /></span>
              <input
                type="text"
                name="name"
                required
                className="form-control"
                placeholder={isFarmer ? 'e.g. Ramesh Patel' : 'e.g. Suresh Singhal'}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Mobile Number (for OTP) *</label>
            <div className="input-group">
              <span className="input-icon"><Phone size={16} /></span>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                className="form-control"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Email Address *</label>
          <div className="input-group">
            <span className="input-icon"><Mail size={16} /></span>
            <input
              type="email"
              name="email"
              required
              className="form-control"
              placeholder="e.g. name@agrinex.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Passwords */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Password *</label>
            <div className="input-group">
              <span className="input-icon"><Lock size={16} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Confirm Password *</label>
            <div className="input-group">
              <span className="input-icon"><Lock size={16} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Location Row (State, District, Village/City) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>State *</label>
            <select name="state" className="form-control" value={formData.state} onChange={handleChange}>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>District *</label>
            <input
              type="text"
              name="district"
              required
              className="form-control"
              placeholder="e.g. Nashik"
              value={formData.district}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Village / City</label>
            <input
              type="text"
              name="villageCity"
              className="form-control"
              placeholder="e.g. Dindori"
              value={formData.villageCity}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Role Specific Fields */}
        {isFarmer ? (
          <div style={{
            background: 'var(--bg-muted)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sprout size={16} /> Farmer Agricultural Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Farm Name</label>
                <input
                  type="text"
                  name="farmName"
                  className="form-control"
                  placeholder="e.g. Kisan Green Farm"
                  value={formData.farmName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Farm Size</label>
                <input
                  type="text"
                  name="farmSize"
                  className="form-control"
                  placeholder="e.g. 5 Acres"
                  value={formData.farmSize}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Primary Crops</label>
              <input
                type="text"
                name="primaryCrops"
                className="form-control"
                placeholder="e.g. Wheat, Basmati Rice, Onion"
                value={formData.primaryCrops}
                onChange={handleChange}
              />
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-muted)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingCart size={16} /> Buyer Procurement Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  className="form-control"
                  placeholder="e.g. FreshProduce Wholesalers"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Buyer Type</label>
                <select name="buyerType" className="form-control" value={formData.buyerType} onChange={handleChange}>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retail Chain">Retail Chain</option>
                  <option value="Exporter">Exporter</option>
                  <option value="Food Processing Mill">Food Processing Mill</option>
                  <option value="Institutional Buyer">Institutional Buyer</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Required Crop Categories</label>
              <input
                type="text"
                name="requiredCropCategories"
                className="form-control"
                placeholder="e.g. Cereals, Vegetables, Spices"
                value={formData.requiredCropCategories}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{
            marginTop: '12px',
            padding: '14px',
            fontSize: '1.05rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>{loading ? 'Creating Account...' : 'Continue to Verification'}</span>
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
