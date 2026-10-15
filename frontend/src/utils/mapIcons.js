import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Vite asset resolution for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/**
 * Palette mapping for incident status pin icons
 */
const STATUS_COLORS = {
  reported: { bg: '#8B5CF6', text: '#FFFFFF', border: '#7C3AED' }, // Purple
  under_review: { bg: '#0D9488', text: '#FFFFFF', border: '#0F766E' }, // Teal
  assigned: { bg: '#F59E0B', text: '#FFFFFF', border: '#D97706' }, // Amber
  in_progress: { bg: '#EA580C', text: '#FFFFFF', border: '#C2410C' }, // Orange
  pending_verification: { bg: '#6366F1', text: '#FFFFFF', border: '#4F46E5' }, // Indigo
  resolved: { bg: '#10B981', text: '#FFFFFF', border: '#059669' }, // Emerald
  rejected: { bg: '#64748B', text: '#FFFFFF', border: '#475569' }, // Slate
  reopened: { bg: '#F43F5E', text: '#FFFFFF', border: '#E11D48' }, // Rose
};

/**
 * Create a custom SVG Leaflet DivIcon for an incident marker
 */
export const createIncidentIcon = (status = 'reported', isSelected = false) => {
  const normStatus = (status || 'reported').toLowerCase().replace(/\s+/g, '_');
  const palette = STATUS_COLORS[normStatus] || STATUS_COLORS.reported;
  const size = isSelected ? 38 : 30;
  const anchorY = isSelected ? 38 : 30;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${
        isSelected
          ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: ${palette.bg}; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, ${palette.bg}, ${palette.border});
        border: 2px solid #FFFFFF;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-incident-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, anchorY],
    popupAnchor: [0, -anchorY],
  });
};

/**
 * Origin / Staff Start Location Pin
 */
export const createOriginIcon = () => {
  const size = 32;
  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #2563EB, #1D4ED8);
        border: 2.5px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-origin-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

/**
 * Draggable location picker target pin
 */
export const createPickerIcon = () => {
  const size = 36;
  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: grab;">
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #7C3AED, #6D28D9);
        border: 2.5px solid #FFFFFF;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 9px;
          height: 9px;
          background-color: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-picker-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};
