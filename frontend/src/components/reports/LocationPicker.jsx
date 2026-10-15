import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Crosshair,
  AlertTriangle,
  Search,
  Loader2,
  X,
} from 'lucide-react';
import { MapContainer } from './MapContainer';
import { routingService, isValidCoordinate } from '../../api/routingService';

/**
 * LocationPicker - Accessible OpenStreetMap location selector with
 * repositionable marker, Nominatim reverse geocoding, and GPS integration.
 */
export const LocationPicker = ({
  address = '',
  latitude = null,
  longitude = null,
  onChange,
  error = null,
  className = '',
}) => {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  // Address search query state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Reposition coordinates & reverse geocode
  const handleUpdateCoordinates = async (lat, lng, overwriteAddress = false) => {
    const validLat = Number(Number(lat).toFixed(6));
    const validLng = Number(Number(lng).toFixed(6));

    // Clear any previous GPS error once user interacts manually
    setGeoError(null);

    // Call parent onChange immediately with existing or fallback address
    let currentAddress = address;
    if (!currentAddress || overwriteAddress) {
      currentAddress = `Coordinates (${validLat}, ${validLng})`;
    }

    onChange({
      address: currentAddress,
      latitude: validLat,
      longitude: validLng,
    });

    // Attempt reverse geocoding via Nominatim to populate clean address
    setReverseGeocoding(true);
    try {
      const resolvedAddress = await routingService.reverseGeocode(validLat, validLng);
      if (resolvedAddress && (!address || overwriteAddress || address.startsWith('Coordinates ('))) {
        onChange({
          address: resolvedAddress,
          latitude: validLat,
          longitude: validLng,
        });
      }
    } catch {
      // Non-blocking: keep coordinates even if reverse geocoding fails
    } finally {
      setReverseGeocoding(false);
    }
  };

  // Browser Geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleUpdateCoordinates(lat, lng, true);
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission denied. You can select your location by clicking the map.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Location information is unavailable. Please click on the map to set coordinates.');
            break;
          case err.TIMEOUT:
            setGeoError('GPS acquisition timed out. Please retry or click on the map.');
            break;
          default:
            setGeoError(`Could not obtain location: ${err.message}`);
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  // Click on map to place or reposition pin
  const handleMapClick = (coords) => {
    handleUpdateCoordinates(coords.lat, coords.lng, false);
  };

  // Drag marker to reposition
  const handleMarkerDragEnd = (coords) => {
    handleUpdateCoordinates(coords.lat, coords.lng, true);
  };

  // Debounced search for landmarks/streets using Nominatim
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await routingService.searchAddress(val);
        setSearchResults(results);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectSearchResult = (res) => {
    setSearchQuery('');
    setShowResults(false);
    onChange({
      address: res.displayName,
      latitude: res.latitude,
      longitude: res.longitude,
    });
  };

  const hasCoords = isValidCoordinate(latitude, longitude);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header and Geolocation Button */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#252238]">
          Incident Location & Verified Coordinates <span className="text-rose-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors cursor-pointer"
        >
          <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Acquiring GPS...' : 'Use Current GPS'}</span>
        </button>
      </div>

      {/* Geolocation Notice / Permission Banner */}
      {geoError && (
        <div className="flex items-start gap-2 p-3 text-xs bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{geoError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeoError(null)}
            className="text-amber-700 hover:text-amber-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Street Address / Landmark input with reverse geocoding indicator */}
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={address}
          onChange={(e) =>
            onChange({
              address: e.target.value,
              latitude,
              longitude,
            })
          }
          placeholder="Street address, junction, landmark, or ward name..."
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-300 transition-all shadow-sm"
        />
        {reverseGeocoding && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-purple-600 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">Detecting address...</span>
          </div>
        )}
      </div>

      {/* Landmark Search Autocomplete Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Search city landmarks or areas to place pin..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#F8F7FC] border border-[#E9E5F0] rounded-xl text-[#252238] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/30"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 animate-spin" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E9E5F0] rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                className="w-full text-left px-3 py-2 text-xs text-[#252238] hover:bg-purple-50 flex items-center gap-2 border-b border-gray-100 last:border-none"
              >
                <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{res.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Coordinates status badge */}
      <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-[#F8F7FC] border border-[#E9E5F0]">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-purple-600" />
          <span className="text-[#6B687A]">
            Lat: <strong className="text-[#252238]">{hasCoords ? Number(latitude).toFixed(5) : '—'}</strong>, Lng:{' '}
            <strong className="text-[#252238]">{hasCoords ? Number(longitude).toFixed(5) : '—'}</strong>
          </span>
        </div>
        {hasCoords ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Coordinates Verified
          </span>
        ) : (
          <span className="text-gray-400 italic">Click on map or use GPS to set</span>
        )}
      </div>

      {/* Interactive Map Picker (Draggable Marker + Click to Pick) */}
      <MapContainer
        center={{
          lat: hasCoords ? Number(latitude) : 12.9716,
          lng: hasCoords ? Number(longitude) : 77.5946,
        }}
        zoom={hasCoords ? 15 : 13}
        interactive={true}
        onMapClick={handleMapClick}
        markers={
          hasCoords
            ? [
                {
                  id: 'picked',
                  latitude: Number(latitude),
                  longitude: Number(longitude),
                  title: address || 'Reported Incident Location',
                  status: 'reported',
                  draggable: true,
                  onDragEnd: handleMarkerDragEnd,
                },
              ]
            : []
        }
        height="260px"
      />

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
