export const ROLE_THEMES = {
  citizen: {
    primary: '#7C3AED',
    secondary: '#DB2777',
    bgTint: '#F5F0FF',
    heroGradient: 'from-violet-600 to-pink-600',
    heroGradientText: 'from-violet-600 via-fuchsia-600 to-pink-600',
    buttonGradient: 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-violet-200',
    activeNav: 'text-violet-700 bg-violet-100/70 border-violet-300',
    borderHighlight: 'border-violet-200',
    pill: 'bg-violet-50 text-violet-700 border-violet-200',
    accentRing: 'focus:ring-violet-500',
  },
  staff: {
    primary: '#C2410C',
    secondary: '#D97706',
    bgTint: '#FFF7ED',
    heroGradient: 'from-orange-600 to-amber-600',
    heroGradientText: 'from-orange-600 via-amber-600 to-amber-700',
    buttonGradient: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-amber-200',
    activeNav: 'text-amber-900 bg-amber-100/80 border-amber-300',
    borderHighlight: 'border-amber-200',
    pill: 'bg-amber-50 text-amber-800 border-amber-200',
    accentRing: 'focus:ring-amber-500',
  },
  manager: {
    primary: '#0F766E',
    secondary: '#65A30D',
    bgTint: '#ECFDF5',
    heroGradient: 'from-teal-700 to-lime-600',
    heroGradientText: 'from-teal-700 via-emerald-600 to-lime-600',
    buttonGradient: 'bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white shadow-teal-200',
    activeNav: 'text-teal-900 bg-teal-100/80 border-teal-300',
    borderHighlight: 'border-teal-200',
    pill: 'bg-teal-50 text-teal-800 border-teal-200',
    accentRing: 'focus:ring-teal-500',
  },
  admin: {
    primary: '#4338CA',
    secondary: '#8B5CF6',
    bgTint: '#EEF2FF',
    heroGradient: 'from-indigo-700 to-violet-600',
    heroGradientText: 'from-indigo-700 via-indigo-600 to-violet-600',
    buttonGradient: 'bg-gradient-to-r from-indigo-700 to-violet-600 hover:from-indigo-800 hover:to-violet-700 text-white shadow-indigo-200',
    activeNav: 'text-indigo-900 bg-indigo-100/80 border-indigo-300',
    borderHighlight: 'border-indigo-200',
    pill: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    accentRing: 'focus:ring-indigo-500',
  },
};

export const getRoleTheme = (role) => {
  if (!role) return ROLE_THEMES.citizen;
  const key = role.toLowerCase();
  return ROLE_THEMES[key] || ROLE_THEMES.citizen;
};
