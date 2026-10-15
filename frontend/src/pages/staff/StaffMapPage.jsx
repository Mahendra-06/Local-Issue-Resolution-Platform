import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { MapContainer } from '../../components/reports/MapContainer';
import { GlassCard } from '../../components/common/GlassCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { assignmentsService } from '../../api/assignmentsService';
import { routingService, isValidCoordinate } from '../../api/routingService';
import {
  MapPin,
  ArrowRight,
  X,
  Navigation,
  Compass,
  RotateCcw,
  AlertTriangle,
  Clock,
  Info,
  LocateFixed,
} from 'lucide-react';

export const StaffMapPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Routing State
  const [originCoords, setOriginCoords] = useState(null); // [lat, lng]
  const [originName, setOriginName] = useState('');
  const [acquiringGps, setAcquiringGps] = useState(false);
  const [pickingOriginOnMap, setPickingOriginOnMap] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState(null);

  useEffect(() => {
    const fetchMapTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await assignmentsService.getStaffTasks();
        const list = Array.isArray(response) ? response : response?.data || [];
        setTasks(list);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapTasks();
  }, []);

  // Filter tasks with valid coordinates (No fake data!)
  const validMarkers = tasks.filter(
    (t) => t && isValidCoordinate(t.latitude, t.longitude)
  );

  // Request browser geolocation for staff origin
  const handleAcquireStaffLocation = () => {
    if (!navigator.geolocation) {
      setRoutingError('Geolocation is not supported by your browser.');
      return;
    }

    setAcquiringGps(true);
    setRoutingError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAcquiringGps(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setOriginCoords([lat, lng]);
        setOriginName('Current GPS Location');
        setPickingOriginOnMap(false);

        // If a task with coordinates is already selected, automatically calculate driving route
        if (selectedTask && isValidCoordinate(selectedTask.latitude, selectedTask.longitude)) {
          calculateRoute([lat, lng], [Number(selectedTask.latitude), Number(selectedTask.longitude)]);
        }
      },
      (err) => {
        setAcquiringGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setRoutingError('Location permission denied. Click "Pick on Map" to choose your starting depot.');
        } else {
          setRoutingError(`Could not obtain GPS location: ${err.message}`);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle map click when staff is in "pick origin" mode
  const handleMapClick = (coords) => {
    if (pickingOriginOnMap) {
      const origin = [coords.lat, coords.lng];
      setOriginCoords(origin);
      setOriginName(`Map Point (${coords.lat}, ${coords.lng})`);
      setPickingOriginOnMap(false);
      setRoutingError(null);

      if (selectedTask && isValidCoordinate(selectedTask.latitude, selectedTask.longitude)) {
        calculateRoute(origin, [Number(selectedTask.latitude), Number(selectedTask.longitude)]);
      }
    }
  };

  // Request road route from OSRM
  const calculateRoute = async (startPoint, endPoint) => {
    setRoutingLoading(true);
    setRoutingError(null);
    try {
      const res = await routingService.getDrivingRoute({
        startLat: startPoint[0],
        startLng: startPoint[1],
        endLat: endPoint[0],
        endLng: endPoint[1],
      });
      setRouteData(res);
    } catch (err) {
      setRoutingError(err.message || 'Failed to calculate driving route.');
      setRouteData(null);
    } finally {
      setRoutingLoading(false);
    }
  };

  // When a staff selects a task
  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setRoutingError(null);
    // If staff origin is already established, recalculate route to this task
    if (originCoords && isValidCoordinate(task.latitude, task.longitude)) {
      calculateRoute(originCoords, [Number(task.latitude), Number(task.longitude)]);
    } else {
      setRouteData(null);
    }
  };

  // Clear active route
  const handleClearRoute = () => {
    setRouteData(null);
    setRoutingError(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="staff"
        title="Field Operations Issue Map"
        subtitle="Geographic distribution, on-site task navigation, and OSRM driving routes for your assigned municipal repair tasks."
      />

      {error && (
        <ErrorState
          title="Could Not Load Map Data"
          message="Failed to fetch assigned task coordinates from the municipal server."
          error={error}
          role="staff"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Leaflet Map */}
        <div className="lg:col-span-8 space-y-3">
          <GlassCard className="p-4 overflow-hidden relative">
            {pickingOriginOnMap && (
              <div className="absolute top-6 inset-x-8 z-[1001] bg-amber-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center justify-between animate-pulse">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  Click anywhere on the map to set your starting depot / location
                </span>
                <button
                  type="button"
                  onClick={() => setPickingOriginOnMap(false)}
                  className="bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded text-[11px]"
                >
                  Cancel
                </button>
              </div>
            )}

            <MapContainer
              center={{ lat: 12.9716, lng: 77.5946 }}
              zoom={13}
              markers={validMarkers}
              selectedMarkerId={selectedTask?.id || selectedTask?._id}
              onMarkerClick={handleSelectTask}
              onMapClick={handleMapClick}
              route={routeData}
              originPoint={originCoords}
              height="550px"
              role="staff"
              emptyMessage={
                tasks.length > 0
                  ? 'None of your assigned tasks currently have geographic coordinates registered.'
                  : 'No tasks currently assigned to you.'
              }
            />
          </GlassCard>

          {/* Quick Route Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-[#E9E5F0] text-xs">
            <div className="flex items-center gap-2">
              <LocateFixed className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[#6B687A]">
                Starting Point:{' '}
                <strong className="text-[#252238]">
                  {originName || 'Not Set (Select GPS or Map)'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAcquireStaffLocation}
                disabled={acquiringGps}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-xl border border-amber-200 transition-colors"
              >
                <Navigation className={`w-3.5 h-3.5 ${acquiringGps ? 'animate-spin' : ''}`} />
                <span>{acquiringGps ? 'Locating...' : 'Use My GPS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPickingOriginOnMap((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-colors ${
                  pickingOriginOnMap
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white hover:bg-gray-50 text-[#252238] border-[#E9E5F0]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span>{pickingOriginOnMap ? 'Clicking Map...' : 'Pick Origin on Map'}</span>
              </button>

              {routeData && (
                <button
                  type="button"
                  onClick={handleClearRoute}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                  title="Clear road route polyline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Route</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Task Details & OSRM Routing Details */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B687A]">
            Selected Task & Dispatch Routing
          </h3>

          {selectedTask ? (
            <GlassCard tint="staff" className="p-5 space-y-4 relative">
              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  handleClearRoute();
                }}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Deselect task"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={selectedTask.status} size="sm" />
                  <PriorityBadge priority={selectedTask.priority} size="sm" />
                </div>
                <h4 className="font-bold text-base text-[#252238] line-clamp-2">
                  {selectedTask.title || selectedTask.incidentTitle}
                </h4>
              </div>

              {selectedTask.address && (
                <div className="flex items-start gap-1.5 text-xs text-[#6B687A]">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{selectedTask.address}</span>
                </div>
              )}

              {/* Coordinates Indicator */}
              <div className="text-[11px] px-3 py-1.5 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900 flex items-center justify-between">
                <span>Coordinates:</span>
                <strong className="font-mono">
                  {isValidCoordinate(selectedTask.latitude, selectedTask.longitude)
                    ? `${Number(selectedTask.latitude).toFixed(4)}, ${Number(selectedTask.longitude).toFixed(4)}`
                    : 'No Coordinates'}
                </strong>
              </div>

              {/* Instructions */}
              {selectedTask.instructions && (
                <p className="text-xs text-[#6B687A] bg-white p-3 rounded-xl border border-amber-200">
                  <strong className="block text-amber-900 mb-0.5">Instructions:</strong>
                  {selectedTask.instructions}
                </p>
              )}

              {/* OSRM Driving Route Results Panel */}
              {isValidCoordinate(selectedTask.latitude, selectedTask.longitude) ? (
                <div className="p-3.5 bg-white rounded-xl border border-orange-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-orange-950 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-orange-600" />
                      OSRM Road Driving Route
                    </span>
                    {originCoords && (
                      <button
                        type="button"
                        onClick={() =>
                          calculateRoute(originCoords, [
                            Number(selectedTask.latitude),
                            Number(selectedTask.longitude),
                          ])
                        }
                        disabled={routingLoading}
                        className="text-[11px] font-semibold text-orange-700 hover:text-orange-900 underline"
                      >
                        {routingLoading ? 'Calculating...' : 'Recalculate'}
                      </button>
                    )}
                  </div>

                  {routingLoading && (
                    <div className="py-3 text-center text-xs text-orange-700 animate-pulse">
                      Calculating road geometry and distance via OSRM...
                    </div>
                  )}

                  {routingError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Route Calculation Error</span>
                      </div>
                      <p className="text-[11px]">{routingError}</p>
                      {originCoords && (
                        <button
                          type="button"
                          onClick={() =>
                            calculateRoute(originCoords, [
                              Number(selectedTask.latitude),
                              Number(selectedTask.longitude),
                            ])
                          }
                          className="mt-1 text-[11px] text-rose-900 font-bold underline"
                        >
                          Retry Route Request
                        </button>
                      )}
                    </div>
                  )}

                  {routeData ? (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                          <span className="text-[10px] text-orange-800 block">Road Distance</span>
                          <span className="text-sm font-bold text-orange-950">
                            {routeData.distanceText}
                          </span>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                          <span className="text-[10px] text-orange-800 block">Estimated Travel</span>
                          <span className="text-sm font-bold text-orange-950">
                            {routeData.durationText}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 italic">
                        * Estimated driving duration calculated via OSRM. Does not account for live traffic congestion.
                      </p>
                    </div>
                  ) : (
                    !routingLoading &&
                    !routingError && (
                      <div className="text-[11px] text-gray-600 space-y-2 pt-1">
                        <p>
                          Set your starting point above using GPS or by clicking on the map to display the road driving path.
                        </p>
                        {!originCoords && (
                          <button
                            type="button"
                            onClick={handleAcquireStaffLocation}
                            className="w-full py-1.5 text-xs bg-orange-100 hover:bg-orange-200 text-orange-900 font-semibold rounded-lg flex items-center justify-center gap-1"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Route from My GPS Location</span>
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Cannot calculate road route because this incident lacks verified GPS coordinates.</span>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate(`/staff/tasks/${selectedTask.id || selectedTask._id}`)
                }
                className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Open Task Details & Work Controls</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </GlassCard>
          ) : (
            <EmptyState
              title="No Task Selected"
              message="Click on any pin on the field map to view task instructions, inspect location, and calculate road driving routes."
            />
          )}
        </div>
      </div>
    </div>
  );
};
