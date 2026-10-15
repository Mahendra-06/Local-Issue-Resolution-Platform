import React, { useEffect, useMemo } from 'react';
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { MapPin, Navigation, Compass, AlertCircle, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  createIncidentIcon,
  createOriginIcon,
  createPickerIcon,
} from '../../utils/mapIcons';
import { isValidCoordinate } from '../../api/routingService';

/**
 * MapController component - safely handles map panning, zooming, and bound fitting
 */
const MapController = ({ center, zoom, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    // Ensure map tiles and dimensions resize correctly inside flex/grid containers
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (!map) return;
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (isValidCoordinate(center?.lat, center?.lng)) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [map, center?.lat, center?.lng, zoom, bounds]);

  return null;
};

/**
 * MapEvents component - listens for interactive clicks on map canvas
 */
const MapEvents = ({ onMapClick, interactive }) => {
  useMapEvents({
    click(e) {
      if (!interactive || !onMapClick) return;
      onMapClick({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      });
    },
  });
  return null;
};

/**
 * CivicPulse MapContainer Component
 * Displays interactive OpenStreetMap tiles with real incident pins,
 * OSRM routing polylines, and responsive UI panels.
 */
export const MapContainer = ({
  center = { lat: 12.9716, lng: 77.5946 }, // Default municipal center
  zoom = 13,
  markers = [],
  selectedMarkerId = null,
  onMarkerClick = null,
  onMapClick = null,
  interactive = true,
  height = '400px',
  className = '',
  route = null, // { polylinePositions, bounds, distanceText, durationText }
  originPoint = null, // [lat, lng] or { lat, lng }
  onNavigateDetail = null,
  role = 'citizen',
  emptyMessage = null,
}) => {
  // Normalize center coordinates
  const safeCenter = useMemo(() => {
    const lat = Number(center?.lat);
    const lng = Number(center?.lng);
    if (isValidCoordinate(lat, lng)) {
      return { lat, lng };
    }
    return { lat: 12.9716, lng: 77.5946 };
  }, [center?.lat, center?.lng]);

  // Filter markers to only valid coordinates (No fake markers!)
  const validMarkers = useMemo(() => {
    return (markers || []).filter(
      (m) => m && isValidCoordinate(m.latitude, m.longitude)
    );
  }, [markers]);

  // Normalize origin coordinates
  const safeOrigin = useMemo(() => {
    if (!originPoint) return null;
    if (Array.isArray(originPoint) && originPoint.length === 2) {
      if (isValidCoordinate(originPoint[0], originPoint[1])) return originPoint;
    } else if (originPoint.lat && originPoint.lng) {
      if (isValidCoordinate(originPoint.lat, originPoint.lng)) {
        return [Number(originPoint.lat), Number(originPoint.lng)];
      }
    }
    return null;
  }, [originPoint]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-[#E9E5F0] bg-[#F1EFF7] shadow-inner select-none ${className}`}
      style={{ height }}
    >
      <LeafletMap
        center={[safeCenter.lat, safeCenter.lng]}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        attributionControl={true}
      >
        <MapController
          center={safeCenter}
          zoom={zoom}
          bounds={route?.bounds}
          interactive={interactive}
        />

        <MapEvents onMapClick={onMapClick} interactive={interactive} />

        {/* Standard OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Real Backend Incident Markers */}
        {validMarkers.map((item, idx) => {
          const markerId = item.id || item._id || idx;
          const isSelected = selectedMarkerId != null && (selectedMarkerId === item.id || selectedMarkerId === item._id);
          const icon =
            item.id === 'picked'
              ? createPickerIcon()
              : createIncidentIcon(item.status, isSelected);

          return (
            <Marker
              key={markerId}
              position={[Number(item.latitude), Number(item.longitude)]}
              icon={icon}
              draggable={item.draggable || false}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(item);
                  }
                },
                dragend: (e) => {
                  if (item.onDragEnd) {
                    const pos = e.target.getLatLng();
                    item.onDragEnd({
                      lat: Number(pos.lat.toFixed(6)),
                      lng: Number(pos.lng.toFixed(6)),
                    });
                  }
                },
              }}
            >
              <Popup className="civicpulse-popup" closeButton={true}>
                <div className="p-1 space-y-2 text-xs min-w-[200px] max-w-[260px]">
                  <div className="flex items-center justify-between gap-1 border-b border-[#E9E5F0] pb-1.5">
                    <StatusBadge status={item.status} size="sm" />
                    {item.priority && <PriorityBadge priority={item.priority} size="sm" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-[#252238] text-sm leading-snug">
                      {item.title || item.incidentTitle || `Incident #${item.referenceId || item.id?.substring?.(0, 8) || ''}`}
                    </h4>
                    {item.category && (
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                        {typeof item.category === 'object' ? item.category.name : item.category}
                      </span>
                    )}
                  </div>

                  {item.address && (
                    <div className="flex items-start gap-1 text-[11px] text-[#6B687A]">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item.address}</span>
                    </div>
                  )}

                  {onNavigateDetail && (
                    <button
                      type="button"
                      onClick={() => onNavigateDetail(item)}
                      className="w-full mt-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>View Incident Record</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Start / Origin Marker (e.g., Staff GPS location) */}
        {safeOrigin && (
          <Marker position={safeOrigin} icon={createOriginIcon()}>
            <Popup>
              <div className="p-1 text-xs font-semibold text-[#252238]">
                <span>Your Location (Route Origin)</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* OSRM Road Route Polyline */}
        {route?.polylinePositions && route.polylinePositions.length > 0 && (
          <Polyline
            positions={route.polylinePositions}
            pathOptions={{
              color: '#EA580C', // Amber-orange route line
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
      </LeafletMap>

      {/* Floating Center Coordinate Indicator */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E9E5F0] text-[11px] text-[#6B687A] flex items-center gap-2 shadow-sm pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-purple-600" />
        <span>
          Center: <strong className="text-[#252238]">{safeCenter.lat.toFixed(4)}, {safeCenter.lng.toFixed(4)}</strong>
        </span>
      </div>

      {/* Route Distance / Duration Floating Badge */}
      {route && (route.distanceText || route.durationText) && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-orange-200 shadow-md text-xs flex items-center gap-2.5">
          <Navigation className="w-4 h-4 text-orange-600 shrink-0" />
          <div className="flex items-center gap-2 font-medium">
            <span className="text-[#252238]">
              Distance: <strong className="font-bold text-orange-950">{route.distanceText}</strong>
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[#252238]">
              Est. Travel: <strong className="font-bold text-orange-950">{route.durationText}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Empty State Overlay if no markers have coordinates */}
      {validMarkers.length === 0 && markers.length > 0 && (
        <div className="absolute inset-x-4 top-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {emptyMessage ||
              'Loaded records do not have geographic coordinates registered yet.'}
          </span>
        </div>
      )}
    </div>
  );
};
