import React, { useState, useEffect } from 'react';
import {
  getRealLiveLocation,
  getCachedLiveLocation,
  watchLiveLocation,
  clearLiveLocationWatch
} from '../../services/locationService';
import { MapPin, Navigation, RefreshCw, CheckCircle2, ShieldAlert, Satellite } from 'lucide-react';

export default function LiveLocationBadge({
  onLocationDetected,
  role = 'BUYER', // 'FARMER' | 'BUYER'
  compact = false,
  autoRequest = false
}) {
  const [location, setLocation] = useState(getCachedLiveLocation());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);

  const requestLiveGPS = async () => {
    setLoading(true);
    setError(null);
    try {
      const loc = await getRealLiveLocation();
      setLocation(loc);
      setLoading(false);
      if (onLocationDetected) {
        onLocationDetected(loc);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (autoRequest && !location) {
      requestLiveGPS();
    } else if (location && onLocationDetected) {
      onLocationDetected(location);
    }
  }, []);

  // Compact Pill Variant
  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={requestLiveGPS}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78125rem',
            fontWeight: 600,
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            background: location ? '#f0fdf4' : '#ffffff',
            color: location ? '#166534' : '#334155',
            cursor: 'pointer'
          }}
          title={location ? `GPS Active: ${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E (±${location.accuracy}m)` : 'Click to detect procurement location'}
        >
          {loading ? (
            <RefreshCw size={13} className="spin" />
          ) : (
            <MapPin size={13} color="#166534" />
          )}

          <span>
            {loading ? 'Detecting GPS...' : location ? `${location.district || location.city}, ${location.state}` : 'Detect Location'}
          </span>
        </button>

        {error && (
          <span style={{ fontSize: '0.7rem', color: '#b91c1c' }} title={error}>
            GPS unavailable
          </span>
        )}
      </div>
    );
  }

  // Full Feature Card Variant
  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${location ? '#bbf7d0' : '#e2e8f0'}`,
      borderRadius: '4px',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="#166534" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
              {role === 'FARMER' ? 'Farm Location Coordinates' : 'Procurement Sourcing Location'}
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '3px', lineHeight: 1.4 }}>
            {location ? (
              <span>
                <strong>{location.district || location.city || 'Nashik'}, {location.state || 'Maharashtra'}</strong>
                <span style={{ color: '#64748b' }}> • Lat: {location.lat?.toFixed(3)}°, Lng: {location.lng?.toFixed(3)}°</span>
              </span>
            ) : (
              <span>
                Detect browser coordinates to calculate accurate harvest logistics & transport distances.
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={requestLiveGPS}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '3px',
            border: '1px solid #166534',
            background: location ? '#f0fdf4' : '#166534',
            color: location ? '#166534' : '#ffffff',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {loading ? (
            <RefreshCw size={12} className="spin" />
          ) : (
            <Navigation size={12} />
          )}
          <span>{loading ? 'Detecting...' : location ? 'Refresh' : 'Detect GPS'}</span>
        </button>
      </div>

      {location && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#166534' }}>
          <CheckCircle2 size={12} />
          <span>Active GPS calibrated within ±{location.accuracy || 15}m</span>
        </div>
      )}

      {error && (
        <div style={{ fontSize: '0.72rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldAlert size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
