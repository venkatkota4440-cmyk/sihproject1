import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useSocket } from '../../context/SocketContext';
import { Truck, MapPin, Thermometer, Clock, Navigation, ShieldCheck, AlertCircle, Crosshair, CheckCircle2 } from 'lucide-react';
import { getRealLiveLocation, getCachedLiveLocation } from '../../services/locationService';

export default function DeliveryTrackerMap({ orderId = 'order_demo_301', deliveryData }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerTruckRef = useRef(null);
  const markerUserGpsRef = useRef(null);
  const { telemetry } = useSocket();

  const [locatingUser, setLocatingUser] = useState(false);
  const [userLocation, setUserLocation] = useState(() => getCachedLiveLocation());

  // Telemetry state
  const [currentCoords, setCurrentCoords] = useState([19.75, 73.65]); // Default midpoint Nashik-Mumbai
  const [speed, setSpeed] = useState(52);
  const [eta, setEta] = useState(65);
  const [temp, setTemp] = useState(18.2);
  const [remainingKm, setRemainingKm] = useState(58);

  const farmCoords = [20.076, 74.108]; // Niphad Nashik
  const buyerCoords = [19.076, 73.003]; // Vashi APMC Mumbai

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Reset leaflet ID if container was previously used (prevents React 18 remount crashes)
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [19.58, 73.55],
      zoom: 8,
      zoomControl: true,
      scrollWheelZoom: false
    });
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Invalidate size to guarantee tile alignment in modal/tabs
    const resizeTimer1 = setTimeout(() => map.invalidateSize(), 150);
    const resizeTimer2 = setTimeout(() => map.invalidateSize(), 500);

    // Custom Icon helper
    const createCustomIcon = (emoji, color) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="
          width: 36px;
          height: 36px;
          background: ${color};
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        ">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
    };

    // Farm Marker
    L.marker(farmCoords, { icon: createCustomIcon('🌾', '#059669') })
      .addTo(map)
      .bindPopup('<b>Farm Gate Origin</b><br>Niphad, Nashik<br>Harvest loaded and certified.');

    // Buyer Hub Marker
    L.marker(buyerCoords, { icon: createCustomIcon('🏢', '#2563eb') })
      .addTo(map)
      .bindPopup('<b>Destination APMC Hub</b><br>Navi Mumbai<br>Cold storage distribution dock.');

    // Route Polyline
    const routeCoords = [
      farmCoords,
      [19.85, 73.85],
      [19.75, 73.65],
      [19.42, 73.35],
      [19.22, 73.15],
      buyerCoords
    ];
    L.polyline(routeCoords, { color: '#10b981', weight: 4, dashArray: '8, 8', opacity: 0.8 }).addTo(map);

    // Animated Transporter Truck Marker
    const truckMarker = L.marker(currentCoords, { icon: createCustomIcon('🚚', '#d97706') })
      .addTo(map)
      .bindPopup('<b>Kisan Logistics Reefer Truck</b><br>Reg: MH-12-QX-4890<br>Temp: 18.2°C (Grade A preserved)');
    markerTruckRef.current = truckMarker;

    return () => {
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      map.remove();
      mapInstanceRef.current = null;
      if (mapContainerRef.current) {
        mapContainerRef.current._leaflet_id = null;
      }
    };
  }, []);

  // Real-time animated simulation when socket is idle
  useEffect(() => {
    const simInterval = setInterval(() => {
      setCurrentCoords(prev => {
        // Move towards Mumbai slowly
        const nextLat = prev[0] - 0.003;
        const nextLng = prev[1] - 0.0035;
        if (nextLat < 19.12) return [19.85, 73.80]; // Loop back
        const newCoords = [nextLat, nextLng];
        if (markerTruckRef.current) {
          markerTruckRef.current.setLatLng(newCoords);
        }
        return newCoords;
      });

      setSpeed(prev => Math.floor(48 + Math.random() * 10));
      setTemp(prev => +(18.0 + (Math.random() * 0.6 - 0.3)).toFixed(1));
      setRemainingKm(prev => Math.max(12, prev - 1));
      setEta(prev => Math.max(15, prev - 1));
    }, 2800);

    return () => clearInterval(simInterval);
  }, []);

  // Update marker position on real-time telemetry stream
  useEffect(() => {
    if (telemetry && telemetry.coordinates) {
      setCurrentCoords(telemetry.coordinates);
      setSpeed(telemetry.speedKmH);
      setEta(telemetry.etaMinutes);
      setTemp(telemetry.temperatureCelsius);
      setRemainingKm(telemetry.distanceRemainingKm);

      if (markerTruckRef.current) {
        markerTruckRef.current.setLatLng(telemetry.coordinates);
      }
    }
  }, [telemetry]);

  const handleLocateUser = async () => {
    setLocatingUser(true);
    try {
      const loc = await getRealLiveLocation();
      setUserLocation(loc);

      if (mapInstanceRef.current) {
        const coords = [loc.lat, loc.lng];
        if (markerUserGpsRef.current) {
          markerUserGpsRef.current.setLatLng(coords);
          markerUserGpsRef.current.setPopupContent(`<b>Your Real Live GPS Location</b><br>${loc.formattedAddress}<br>Accuracy: ±${loc.accuracy}m`).openPopup();
        } else {
          const userIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `<div style="
              width: 38px;
              height: 38px;
              background: #0284c7;
              border: 3px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              box-shadow: 0 0 15px rgba(2, 132, 199, 0.7);
            ">📍</div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19]
          });
          const userMarker = L.marker(coords, { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`<b>Your Real Live GPS Location</b><br>${loc.formattedAddress}<br>Accuracy: ±${loc.accuracy}m`);
          markerUserGpsRef.current = userMarker;
          userMarker.openPopup();
        }
        mapInstanceRef.current.flyTo(coords, 10, { duration: 1.5 });
      }
    } catch (e) {
      alert(e.message || 'Unable to retrieve real live GPS position.');
    } finally {
      setLocatingUser(false);
    }
  };

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      {/* Top Telematics Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-warning">Demo GPS Tracking</span>
            <span className="badge badge-success">Cold-Chain Active</span>
            {userLocation && (
              <span className="badge badge-primary" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7' }}>
                📍 Real Live GPS Active ({userLocation.district || 'Synced'})
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
            Live Shipment Telemetry & Route
          </h3>
        </div>

        {/* Telemetry Metric Badges */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={16} color="#10b981" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Speed:</span>
            <strong style={{ fontSize: '0.875rem' }}>{speed} km/h</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#f59e0b" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>ETA:</span>
            <strong style={{ fontSize: '0.875rem' }}>{eta} mins ({remainingKm} km left)</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Thermometer size={16} color="#06b6d4" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Reefer Temp:</span>
            <strong style={{ fontSize: '0.875rem' }}>{temp}°C</strong>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div style={{ height: '290px', width: '100%', position: 'relative' }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
      </div>

      {/* Interactive Telematics Simulation Bar */}
      <div style={{
        padding: '10px 18px',
        background: 'var(--bg-muted)',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Cold-chain integrity verified. Live GPS coordinates updating every 2.8s.</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleLocateUser}
            disabled={locatingUser}
            className="btn btn-primary btn-sm"
            style={{
              padding: '3px 10px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700,
              background: userLocation ? '#0284c7' : undefined
            }}
            title="Detect real device hardware GPS coordinates"
          >
            <Crosshair size={13} />
            {locatingUser ? 'Fixing GPS...' : userLocation ? `📍 My Live GPS (${userLocation.district || 'Locked'})` : 'Pin My Live GPS'}
          </button>
          <button
            type="button"
            onClick={() => setSpeed(s => Math.min(85, s + 10))}
            className="btn btn-secondary btn-sm"
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            title="Simulate truck acceleration"
          >
            ⚡ Accelerate
          </button>
          <button
            type="button"
            onClick={() => setTemp(t => +(t - 0.5).toFixed(1))}
            className="btn btn-secondary btn-sm"
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            title="Simulate Reefer Chiller blast"
          >
            ❄️ Chill (-0.5°C)
          </button>
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current && markerTruckRef.current) {
                mapInstanceRef.current.setView(markerTruckRef.current.getLatLng(), 9);
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            title="Recenter on current truck position"
          >
            📍 Recenter
          </button>
        </div>
      </div>
    </div>
  );
}
