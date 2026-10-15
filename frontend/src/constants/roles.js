export const USER_ROLES = {
  CITIZEN: 'citizen',
  STAFF: 'staff',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

export const ROLE_CONFIG = {
  [USER_ROLES.CITIZEN]: {
    id: USER_ROLES.CITIZEN,
    name: 'Citizen',
    tagline: 'Report, track, and stay informed',
    description: 'Report local issues, track their progress, and receive real-time resolution updates.',
    homePath: '/citizen',
    theme: 'citizen',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: 'User',
  },
  [USER_ROLES.STAFF]: {
    id: USER_ROLES.STAFF,
    name: 'Department Staff',
    tagline: 'Manage your assigned work',
    description: 'Inspect assigned tasks, execute repairs, upload evidence, and submit work for verification.',
    homePath: '/staff',
    theme: 'staff',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: 'HardHat',
  },
  [USER_ROLES.MANAGER]: {
    id: USER_ROLES.MANAGER,
    name: 'Department Manager',
    tagline: 'Review, assign, and verify resolution',
    description: 'Coordinate department incidents, assign staff with instructions, and verify completed resolutions.',
    homePath: '/manager',
    theme: 'manager',
    badgeClass: 'bg-emerald-100 text-teal-800 border-emerald-200',
    icon: 'Briefcase',
  },
  [USER_ROLES.ADMIN]: {
    id: USER_ROLES.ADMIN,
    name: 'Administrator',
    tagline: 'Manage platform, users, and departments',
    description: 'Oversee users, departments, categories, system health, analytics, and platform audit logs.',
    homePath: '/admin',
    theme: 'admin',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: 'ShieldCheck',
  },
};

export const getRoleDetails = (role) => {
  if (!role) return null;
  const normalized = role.toLowerCase();
  return ROLE_CONFIG[normalized] || null;
};
