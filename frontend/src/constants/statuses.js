export const INCIDENT_STATUSES = {
  REPORTED: 'reported',
  UNDER_REVIEW: 'under_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  PENDING_VERIFICATION: 'pending_verification',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  REOPENED: 'reopened',
  OVERDUE: 'overdue',
};

export const STATUS_CONFIG = {
  [INCIDENT_STATUSES.REPORTED]: {
    label: 'Reported',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    description: 'Submitted by citizen and awaiting initial review',
  },
  [INCIDENT_STATUSES.UNDER_REVIEW]: {
    label: 'Under Review',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    description: 'Department manager is assessing priority and scope',
  },
  [INCIDENT_STATUSES.ASSIGNED]: {
    label: 'Assigned',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    description: 'Work delegated to field staff with instructions',
  },
  [INCIDENT_STATUSES.IN_PROGRESS]: {
    label: 'In Progress',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    description: 'Field staff are actively working on repairs',
  },
  [INCIDENT_STATUSES.PENDING_VERIFICATION]: {
    label: 'Pending Verification',
    bg: 'bg-violet-50',
    text: 'text-violet-800',
    border: 'border-violet-200',
    dot: 'bg-violet-600',
    description: 'Work completed by staff; awaiting manager inspection',
  },
  [INCIDENT_STATUSES.RESOLVED]: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    description: 'Manager verified work and closed the incident',
  },
  [INCIDENT_STATUSES.REJECTED]: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    description: 'Deemed invalid, duplicate, or rejected during verification',
  },
  [INCIDENT_STATUSES.REOPENED]: {
    label: 'Reopened',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    description: 'Work was incomplete or issue recurred; reopened for remediation',
  },
  [INCIDENT_STATUSES.OVERDUE]: {
    label: 'Overdue',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-600',
    description: 'Incident has exceeded target SLA resolution deadline',
  },
};

export const getStatusConfig = (status) => {
  if (!status) return STATUS_CONFIG[INCIDENT_STATUSES.REPORTED];
  const key = status.toLowerCase().replace(/[\s-]/g, '_');
  return STATUS_CONFIG[key] || {
    label: status.replace(/_/g, ' ').toUpperCase(),
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  };
};

export const INCIDENT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const PRIORITY_CONFIG = {
  [INCIDENT_PRIORITIES.LOW]: {
    label: 'Low',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
  [INCIDENT_PRIORITIES.MEDIUM]: {
    label: 'Medium',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  [INCIDENT_PRIORITIES.HIGH]: {
    label: 'High',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  [INCIDENT_PRIORITIES.CRITICAL]: {
    label: 'Critical',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
  },
};

export const getPriorityConfig = (priority) => {
  if (!priority) return PRIORITY_CONFIG[INCIDENT_PRIORITIES.MEDIUM];
  const key = priority.toLowerCase();
  return PRIORITY_CONFIG[key] || PRIORITY_CONFIG[INCIDENT_PRIORITIES.MEDIUM];
};
