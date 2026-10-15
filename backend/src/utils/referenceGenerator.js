import crypto from 'crypto';

/**
 * Generates human-friendly reference IDs for CivicPulse incidents & tasks
 * Example: CP-482910
 */
export const generateReferenceId = (prefix = 'CP') => {
  const num = crypto.randomInt(100000, 999999);
  return `${prefix}-${num}`;
};
