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

  return (
    <div className="glass-card card-hover-depth" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Crop Image Header */}
      <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden', background: '#1e293b' }}>
        <img
          src={primaryImage}
          alt={crop.title || 'Agricultural Crop'}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          className="crop-card-img"
        />

        {imgError && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(0,0,0,0.7)',
            color: '#f87171',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ImageOff size={10} /> Crop image unavailable (safe placeholder)
          </div>
        )}

        {/* Badges Overlay */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          {crop.isOrganic && (
            <span className="badge badge-success" style={{ boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}>
              <Sparkles size={11} /> Organic
            </span>
          )}
          <span className="badge badge-neutral" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.5)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
            {crop.qualityGrade || 'Grade A'}
          </span>
        </div>

        {/* Top Right Quick Add to Cart Badge */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(crop, 500);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isInCart ? '#10b981' : 'rgba(9, 13, 22, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          title={isInCart ? 'Already in Procurement Cart (Click to add +500kg)' : 'Quick Add 500kg to Procurement Cart'}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <ShoppingCart size={16} />
        </button>

        {crop.farmerRating && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            color: '#fbbf24',
            padding: '3px 8px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            <Star size={12} fill="#fbbf24" /> {crop.farmerRating}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {crop.category} • {crop.variety || 'Standard'}
          </div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.3 }}>
            {crop.title}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <MapPin size={14} color="#10b981" style={{ flexShrink: 0 }} />
            <span>{crop.location ? `${crop.location.district || crop.location}, ${crop.location.state || ''}` : 'Maharashtra'}</span>
          </div>
          {distanceKm !== null && (
            <span
              style={{
                flexShrink: 0,
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#0284c7',
                background: 'rgba(2, 132, 199, 0.12)',
                padding: '2px 6px',
                borderRadius: '6px',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
              title={`Calculated from your live GPS location: ${distanceKm} km`}
            >
              📍 {formatDistance(distanceKm)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <span>Farmer:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            {crop.farmerName || 'Verified Producer'}
            <ShieldCheck size={14} color="#10b981" />
          </span>
        </div>

        {/* Live Marketing Prices & Pricing Comparison */}
        {(() => {
          const mandiModal = Number(crop.mandiBenchmark || crop.liveMarketPrice?.modalPrice || 26.5);
          const mandiQtl = Number(crop.mandiPricePerQuintal || (mandiModal * 100));
          const farmPrice = Number(crop.pricePerUnit || 0);
          const savingsPerKg = mandiModal - farmPrice;
          const savingsPct = mandiModal > 0 ? Math.round((savingsPerKg / mandiModal) * 100) : 0;
          const marketName = crop.liveMarketPrice?.market || 'Regional APMC Hub';

          return (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Mandi vs Farm Gate Comparison Strip */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  <span>APMC Live: ₹{mandiModal.toFixed(1)}/kg</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(₹{mandiQtl}/Qtl)</span>
                </div>
                {savingsPerKg > 0 ? (
                  <span style={{
                    color: '#15803d',
                    fontWeight: 800,
                    background: 'rgba(34, 197, 94, 0.18)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    Save ₹{savingsPerKg.toFixed(1)}/kg ({savingsPct}%)
                  </span>
                ) : (
                  <span style={{
                    color: '#b45309',
                    fontWeight: 700,
                    background: 'rgba(245, 158, 11, 0.15)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    Grade-A Quality
                  </span>
                )}
              </div>

              {/* Pricing & Stock */}
              <div style={{
                paddingTop: '6px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Farm Gate Direct Price</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹{crop.pricePerUnit} <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {crop.unit || 'kg'}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    Mandi: {marketName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('marketplace.availableQuantity', 'Available')}</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#059669' }}>
                    {Number(crop.quantity).toLocaleString('en-IN')} {crop.unit || 'kg'}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Action Buttons: Details, Add to Cart & Make Offer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => addToCart(crop, 500)}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontWeight: 700,
              background: isInCart ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-muted)',
              borderColor: isInCart ? '#10b981' : 'var(--border-color)',
              color: isInCart ? '#10b981' : 'var(--text-main)'
            }}
          >
            <ShoppingCart size={14} /> {isInCart ? 'In Cart (+)' : 'Add to Cart'}
          </button>

          <button
            type="button"
            onClick={() => onMakeOffer && onMakeOffer(crop)}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
          >
            <Tag size={14} /> {t('marketplace.makeOffer', 'Make Offer')}
          </button>
        </div>

        <Link
          to={`/crops/${crop.id}`}
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            padding: '4px 0',
            fontWeight: 600
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          View Full Harvest Specifications →
        </Link>
      </div>
    </div>
  );
}
