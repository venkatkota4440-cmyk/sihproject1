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
          className={`btn ${location ? 'btn-secondary btn-sm' : 'btn-aurora btn-sm'}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78125rem',
            padding: '6px 12px',
            borderRadius: '12px'
          }}
          title={location ? `GPS Active: ${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E (±${location.accuracy}m)` : 'Click to enable real live GPS'}
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : location ? (
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
              display: 'inline-block'
            }} />
          ) : (
            <Navigation size={14} />
          )}

          <span>
            {loading ? 'Detecting GPS...' : location ? `${location.district || location.city}, ${location.state}` : '📍 Live GPS Location'}
          </span>
        </button>

        {error && (
          <span style={{ fontSize: '0.7rem', color: '#ef4444' }} title={error}>
            ⚠ GPS blocked
          </span>
        )}
      </div>
    );
  }

  // Full Feature Card Variant
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: `1.5px solid ${location ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
      borderRadius: '18px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '14px',
      boxShadow: location ? '0 0 20px rgba(16, 185, 129, 0.12)' : 'none',
      transition: 'all 0.25s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '14px',
          background: location ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'var(--bg-muted)',
          color: location ? '#ffffff' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: location ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
          flexShrink: 0
        }}>
          {location ? <Satellite size={22} /> : <Navigation size={22} />}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {role === 'FARMER' ? 'Real Live Farm GPS Coordinates' : 'Real Live Buyer Sourcing Location'}
            </span>
            {location && (
              <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                🟢 LIVE SATELLITE LOCK
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {location ? (
              <span>
                <strong>{location.formattedAddress}</strong> • Lat: {location.lat.toFixed(4)}°, Lng: {location.lng.toFixed(4)}° (±{location.accuracy}m accuracy)
              </span>
            ) : (
              <span>
                Click to request your real browser GPS coordinates to calculate harvest distances & delivery routes.
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={requestLiveGPS}
          disabled={loading}
          className={`btn ${location ? 'btn-secondary btn-sm' : 'btn-aurora btn-sm'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <MapPin size={14} />
          )}
          <span>{loading ? 'Acquiring GPS...' : location ? 'Refresh Live GPS' : '📍 Enable Real Live Location'}</span>
        </button>
      </div>

      {error && (
        <div style={{ width: '100%', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          <ShieldAlert size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
