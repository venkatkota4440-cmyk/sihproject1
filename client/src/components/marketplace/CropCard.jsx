import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Tag, ArrowRight, Sparkles, ShoppingCart, ImageOff, Navigation } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { calculateDistanceKm, formatDistance, getCropCoordinates } from '../../services/locationService';

export default function CropCard({ crop, onMakeOffer, buyerLocation }) {
  const { t } = useLanguage();
  const { addToCart, cartItems } = useCart();
  const [imgError, setImgError] = useState(false);
  const isInCart = cartItems.some((i) => i.id === crop.id);

  const cropCoords = getCropCoordinates(crop);
  const distanceKm = (buyerLocation && buyerLocation.lat && cropCoords)
    ? calculateDistanceKm(buyerLocation.lat, buyerLocation.lng, cropCoords.lat, cropCoords.lng)
    : null;

  const fallbackPlaceholder = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600';
  const primaryImage = (!imgError && crop.images && crop.images.length > 0)
    ? crop.images[0]
    : fallbackPlaceholder;

  const mandiModal = Number(crop.mandiBenchmark || crop.liveMarketPrice?.modalPrice || 26.5);
  const mandiQtl = Number(crop.mandiPricePerQuintal || (mandiModal * 100));
  const farmPrice = Number(crop.pricePerUnit || 0);
  const farmPriceQtl = farmPrice * 100;
  const savingsPerKg = mandiModal - farmPrice;
  const marketName = crop.liveMarketPrice?.market || 'Regional APMC Hub';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      {/* Crop Image Header */}
      <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
        <img
          src={primaryImage}
          alt={crop.title || 'Agricultural Crop'}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {imgError && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.6875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ImageOff size={11} /> Photo unavailable
          </div>
        )}

        {/* Quality Grade & Certification Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
          <span style={{
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '3px'
          }}>
            {crop.qualityGrade || 'Grade A'}
          </span>
          {crop.isOrganic && (
            <span style={{
              background: '#166534',
              color: '#ffffff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '3px'
            }}>
              Certified Organic
            </span>
          )}
        </div>

        {/* Available Lot Badge */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#ffffff',
          padding: '3px 8px',
          borderRadius: '3px',
          fontSize: '0.72rem',
          fontWeight: 700
        }}>
          {Number(crop.quantity).toLocaleString('en-IN')} {crop.unit || 'kg'} available
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {crop.category} • {crop.variety || 'Standard Variety'}
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '2px', lineHeight: 1.3 }}>
            {crop.title}
          </h3>
        </div>

        {/* Location & Mandi Hub */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '0.8125rem', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <MapPin size={14} color="#166534" style={{ flexShrink: 0 }} />
            <span>{crop.location ? `${crop.location.district || crop.location}, ${crop.location.state || ''}` : 'Nashik, Maharashtra'}</span>
          </div>
          {distanceKm !== null && (
            <span style={{
              flexShrink: 0,
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#0369a1',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '1px 6px',
              borderRadius: '3px'
            }}>
              Dist: {formatDistance(distanceKm)}
            </span>
          )}
        </div>

        {/* Producer / Farmer Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#64748b' }}>
          <span>Producer:</span>
          <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '3px' }}>
            {crop.farmerName || 'Verified Producer'}
            <ShieldCheck size={14} color="#166534" title="Identity & Land Record Verified" />
          </span>
        </div>

        {/* Official Mandi vs Direct Farm Gate Price Comparison Box */}
        <div style={{
          marginTop: 'auto',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {/* APMC Mandi Benchmark */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
            <span>APMC Mandi Benchmark:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              ₹{mandiModal.toFixed(2)}/kg <span style={{ color: '#94a3b8', fontWeight: 500 }}>(₹{mandiQtl.toLocaleString('en-IN')}/Qtl)</span>
            </span>
          </div>

          {/* Farm Gate Asking Rate */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '4px', borderTop: '1px dashed #cbd5e1' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Farm Gate Asking Price:</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', lineHeight: 1.1 }}>
                ₹{farmPrice.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>/ {crop.unit || 'kg'}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.6875rem', color: '#64748b', display: 'block' }}>Per Quintal:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                ₹{farmPriceQtl.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Savings / Advantage Label */}
          {savingsPerKg > 0 && (
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#166534',
              background: '#ecfdf5',
              padding: '2px 6px',
              borderRadius: '3px',
              textAlign: 'center'
            }}>
              Direct procurement savings: ₹{savingsPerKg.toFixed(2)}/kg vs APMC spot rate
            </div>
          )}
        </div>

        {/* Action Buttons: Add to Cart & Make Offer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => addToCart(crop, 500)}
            style={{
              padding: '7px 10px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: '1px solid #166534',
              background: isInCart ? '#ecfdf5' : '#ffffff',
              color: '#166534',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <ShoppingCart size={14} />
            <span>{isInCart ? 'In Cart (+)' : 'Add to Cart'}</span>
          </button>

          <button
            type="button"
            onClick={() => onMakeOffer && onMakeOffer(crop)}
            style={{
              padding: '7px 10px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: '1px solid #166534',
              background: '#166534',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <Tag size={14} />
            <span>Make Offer</span>
          </button>
        </div>

        <Link
          to={`/crops/${crop.id}`}
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#475569',
            textDecoration: 'none',
            paddingTop: '6px',
            fontWeight: 600,
            display: 'block'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#166534'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
        >
          View Harvest Specifications & Mandi History →
        </Link>
      </div>
    </div>
  );
}
