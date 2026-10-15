export const DEFAULT_CATEGORIES = [
  {
    id: 'potholes_roads',
    name: 'Roads & Potholes',
    description: 'Damaged pavement, potholes, missing manhole covers, and road hazards.',
    icon: 'AlertTriangle',
    department: 'Public Works & Roads',
    slaHours: 48,
  },
  {
    id: 'street_lighting',
    name: 'Street Lighting',
    description: 'Dark corridors, flickering fixtures, broken lampposts, or exposed wiring.',
    icon: 'Lightbulb',
    department: 'Electrical & Lighting',
    slaHours: 24,
  },
  {
    id: 'water_supply',
    name: 'Water Supply & Leakage',
    description: 'Pipeline bursts, water contamination, low pressure, or open hydrants.',
    icon: 'Droplets',
    department: 'Water & Sewage Board',
    slaHours: 12,
  },
  {
    id: 'sanitation_waste',
    name: 'Sanitation & Waste',
    description: 'Overflowing bins, illegal dumping, uncollected garbage, or biohazard spills.',
    icon: 'Trash2',
    department: 'Solid Waste Management',
    slaHours: 24,
  },
  {
    id: 'parks_recreation',
    name: 'Parks & Trees',
    description: 'Fallen trees, dangerous branches, damaged playground equipment, or overgrown parks.',
    icon: 'Trees',
    department: 'Parks & Horticulture',
    slaHours: 72,
  },
  {
    id: 'traffic_signals',
    name: 'Traffic & Signals',
    description: 'Non-functional signals, obscured road signs, or hazardous lane dividers.',
    icon: 'Activity',
    department: 'Traffic Management Dept',
    slaHours: 12,
  },
  {
    id: 'drainage_flooding',
    name: 'Drainage & Flooding',
    description: 'Clogged storm drains, waterlogging, overflowing gutters, or stagnant pools.',
    icon: 'Waves',
    department: 'Drainage & Stormwater',
    slaHours: 24,
  },
  {
    id: 'public_safety',
    name: 'Public Safety & Hazards',
    description: 'Structural cracks in public walls, dangerous building facades, or structural hazards.',
    icon: 'ShieldAlert',
    department: 'Municipal Safety Division',
    slaHours: 8,
  },
];

export const getCategoryById = (id) => {
  if (!id) return null;
  return DEFAULT_CATEGORIES.find((cat) => cat.id === id || cat.name.toLowerCase() === id.toLowerCase()) || {
    id,
    name: id.replace(/_/g, ' '),
    description: 'Municipal infrastructure issue',
    icon: 'HelpCircle',
  };
};
