/**
 * CivicPulse - OSRM Routing and Nominatim Geocoding Service
 * Uses Open Source Routing Machine (OSRM) for road routing, distance, and duration calculations.
 * Uses OpenStreetMap Nominatim for address search and reverse geocoding with caching and rate protection.
 */

const OSRM_BASE_URL =
  import.meta.env.VITE_OSRM_ROUTING_URL || 'https://router.project-osrm.org';

const NOMINATIM_BASE_URL =
  import.meta.env.VITE_NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

// In-memory caches to prevent redundant external API requests and comply with fair usage
const reverseGeocodeCache = new Map();
const searchAddressCache = new Map();

/**
 * Format meters into readable kilometers or meters
 */
export const formatDistance = (meters) => {
  if (meters == null || isNaN(meters)) return '—';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration in seconds to human-readable string
 * Note: Represents estimated road travel duration; does not claim live traffic guarantees.
 */
export const formatDuration = (seconds) => {
  if (seconds == null || isNaN(seconds)) return '—';
  const totalMins = Math.round(seconds / 60);
  if (totalMins < 1) return '< 1 min';
  if (totalMins < 60) return `${totalMins} mins`;
  const hours = Math.floor(totalMins / 60);
  const remainingMins = totalMins % 60;
  return remainingMins > 0 ? `${hours} hr ${remainingMins} min` : `${hours} hr`;
};

/**
 * Validate latitude and longitude values
 */
export const isValidCoordinate = (lat, lng) => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return (
    !isNaN(nLat) &&
    !isNaN(nLng) &&
    nLat >= -90 &&
    nLat <= 90 &&
    nLng >= -180 &&
    nLng <= 180 &&
    !(nLat === 0 && nLng === 0)
  );
};

export const routingService = {
  /**
   * Calculate driving route using OSRM
   * OSRM coordinate order convention: {longitude},{latitude}
   * Returns Leaflet-ready polyline positions [[lat, lng], ...], distance, and duration
   */
  async getDrivingRoute({ startLat, startLng, endLat, endLng }) {
    if (!isValidCoordinate(startLat, startLng)) {
      throw new Error(`Invalid start coordinates: (${startLat}, ${startLng})`);
    }
    if (!isValidCoordinate(endLat, endLng)) {
      throw new Error(`Invalid destination coordinates: (${endLat}, ${endLng})`);
    }

    const sLat = Number(startLat);
    const sLng = Number(startLng);
    const eLat = Number(endLat);
    const eLng = Number(endLng);

    // OSRM expects: {lon},{lat};{lon},{lat}
    const coordinates = `${sLng.toFixed(6)},${sLat.toFixed(6)};${eLng.toFixed(6)},${eLat.toFixed(6)}`;
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Routing server error: HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(data.message || 'No navigable road route found between selected points.');
      }

      const route = data.routes[0];
      const distanceMeters = route.distance;
      const durationSeconds = route.duration;

      // OSRM GeoJSON geometry coordinates are [longitude, latitude]
      // Leaflet polylines require [latitude, longitude]
      const rawCoordinates = route.geometry?.coordinates || [];
      const polylinePositions = rawCoordinates.map(([lon, lat]) => [lat, lon]);

      // Calculate bounding box for auto-fitting the map view
      const lats = polylinePositions.map((p) => p[0]);
      const lngs = polylinePositions.map((p) => p[1]);
      const bounds =
        lats.length > 0
          ? [
              [Math.min(...lats), Math.min(...lngs)],
              [Math.max(...lats), Math.max(...lngs)],
            ]
          : null;

      return {
        success: true,
        distanceMeters,
        distanceText: formatDistance(distanceMeters),
        durationSeconds,
        durationText: formatDuration(durationSeconds),
        polylinePositions,
        bounds,
        startPoint: [sLat, sLng],
        endPoint: [eLat, eLng],
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Routing service timed out. Please check your network and retry.');
      }
      throw err;
    }
  },

  /**
   * Reverse geocode latitude/longitude to a formatted address using Nominatim
   * Includes rate limit protection, user caching, and graceful failure
   */
  async reverseGeocode(lat, lng) {
    if (!isValidCoordinate(lat, lng)) return null;

    const cacheKey = `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
    if (reverseGeocodeCache.has(cacheKey)) {
      return reverseGeocodeCache.get(cacheKey);
    }

    const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'CivicPulse-LocalProblemPlatform/1.0',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) return null;

      const data = await response.json();
      if (!data || !data.address) return null;

      const a = data.address;
      // Compose a clean, localized address summary
      const parts = [
        a.road || a.pedestrian || a.suburb || a.neighbourhood,
        a.city_district || a.city || a.town || a.village,
        a.postcode,
      ].filter(Boolean);

      const formatted = parts.length > 0 ? parts.join(', ') : data.display_name;
      reverseGeocodeCache.set(cacheKey, formatted);
      return formatted;
    } catch (err) {
      console.warn('Reverse geocoding unavailable or rate limited:', err.message);
      return null;
    }
  },

  /**
   * Forward geocode query to search for places/landmarks
   */
  async searchAddress(query) {
    const cleanQuery = query?.trim();
    if (!cleanQuery || cleanQuery.length < 3) return [];

    const cacheKey = cleanQuery.toLowerCase();
    if (searchAddressCache.has(cacheKey)) {
      return searchAddressCache.get(cacheKey);
    }

    const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(
      cleanQuery
    )}&limit=5&addressdetails=1`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'CivicPulse-LocalProblemPlatform/1.0',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      const results = data.map((item) => ({
        displayName: item.display_name,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
      }));

      searchAddressCache.set(cacheKey, results);
      return results;
    } catch (err) {
      console.warn('Address search unavailable:', err.message);
      return [];
    }
  },
};
