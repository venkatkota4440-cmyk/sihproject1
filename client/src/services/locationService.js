/**
 * AgriNex Real Live Location Service
 * Accesses device hardware GPS via browser Geolocation API
 * Provides live location tracking, reverse geocoding, and distance calculations for Farmers and Buyers.
 */

// Fallback Indian Agri-Hub coordinates mapper (used if reverse-geocoding service is unavailable/offline)
function getNearestAgriHub(lat, lng) {
  const hubs = [
    { district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
    { district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { district: 'Mumbai / Vashi', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
    { district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365 },
    { district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373 },
    { district: 'Bengaluru Rural', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { district: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
    { district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
    { district: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 }
  ];

  let nearest = hubs[0];
  let minDistance = Infinity;

  for (const hub of hubs) {
    const d = calculateDistanceKm(lat, lng, hub.lat, hub.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = hub;
    }
  }

  return { ...nearest, distanceKm: minDistance };
}

/**
 * Calculates distance in Kilometers between two coordinates using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function formatDistance(km) {
  if (km === null || km === undefined) return '';
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

/**
 * Fetches real device GPS coordinates using browser navigator.geolocation
 */
export async function getRealLiveLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        const timestamp = position.timestamp;

        let reverseInfo = {
          district: 'Nashik',
          state: 'Maharashtra',
          city: 'Nashik',
          pincode: '',
          formattedAddress: `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`
        };

        // Attempt online reverse geocode with 2.5s timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'en' },
              signal: controller.signal
            }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const district = addr.state_district || addr.county || addr.city || addr.town || 'Nashik';
            const state = addr.state || 'Maharashtra';
            const city = addr.city || addr.town || addr.village || district;
            const pincode = addr.postcode || '';

            reverseInfo = {
              district: district.replace(/\s+District/i, ''),
              state,
              city,
              pincode,
              formattedAddress: data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : `${city}, ${state}`
            };
          }
        } catch (e) {
          // If offline or timeout, use nearest Indian agri-hub fallback
          const hub = getNearestAgriHub(latitude, longitude);
          reverseInfo = {
            district: hub.district,
            state: hub.state,
            city: hub.district,
            pincode: '',
            formattedAddress: `${hub.district}, ${hub.state} (Live GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`
          };
        }

        const locationData = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          altitude,
          speed,
          heading,
          timestamp,
          district: reverseInfo.district,
          state: reverseInfo.state,
          city: reverseInfo.city,
          pincode: reverseInfo.pincode,
          formattedAddress: reverseInfo.formattedAddress
        };

        // Cache in localStorage
        try {
          localStorage.setItem('agrinex_real_live_location', JSON.stringify(locationData));
        } catch (err) {}

        resolve(locationData);
      },
      (error) => {
        let msg = 'Failed to retrieve live GPS location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'GPS Location permission denied. Please allow location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'GPS signal unavailable. Using cached or approximate network coordinates.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Retrying with network location.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  });
}

/**
 * Continuous live GPS tracking watcher
 */
export function watchLiveLocation(onPosition, onError) {
  if (!navigator.geolocation) {
    if (onError) onError(new Error('Geolocation is not supported.'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (pos) => {
      const loc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
        speed: pos.coords.speed,
        timestamp: pos.timestamp
      };
      if (onPosition) onPosition(loc);
    },
    (err) => {
      if (onError) onError(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 10000
    }
  );
}

export function clearLiveLocationWatch(watchId) {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

export function getCachedLiveLocation() {
  try {
    const raw = localStorage.getItem('agrinex_real_live_location');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

const DISTRICT_COORDS = {
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'guntur': { lat: 16.3067, lng: 80.4365 },
  'kurnool': { lat: 15.8281, lng: 78.0373 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'ludhiana': { lat: 30.9010, lng: 75.8573 },
  'amritsar': { lat: 31.6340, lng: 74.8723 },
  'kota': { lat: 25.2138, lng: 75.8648 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'mandya': { lat: 12.5244, lng: 76.8958 },
  'khanna': { lat: 30.7028, lng: 76.2163 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 }
};

export function getCropCoordinates(crop) {
  if (crop?.location?.coordinates?.lat && crop?.location?.coordinates?.lng) {
    return crop.location.coordinates;
  }
  const districtStr = (typeof crop?.location === 'string' ? crop.location : (crop?.location?.district || '')).toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDS)) {
    if (districtStr.includes(key)) {
      return coords;
    }
  }
  return { lat: 19.9975, lng: 73.7898 }; // Nashik default
}
