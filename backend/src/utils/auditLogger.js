import mongoose from 'mongoose';

/**
 * Logs an operational or security event into the AuditLog collection
 */
export const logAuditEvent = async ({
  action,
  entityType,
  targetId,
  actor = null,
  details = '',
  req = null,
}) => {
  try {
    const AuditLog = mongoose.model('AuditLog');
    if (!AuditLog) return;

    let actorId = null;
    let actorName = 'System';
    let actorRole = 'system';

    if (actor) {
      actorId = actor._id || actor.id;
      actorName = actor.name || actor.email || 'Authorized User';
      actorRole = actor.role || 'user';
    } else if (req && req.user) {
      actorId = req.user._id || req.user.id;
      actorName = req.user.name || req.user.email || 'Authorized User';
      actorRole = req.user.role || 'user';
    }

    const ip = req ? req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress : null;

    await AuditLog.create({
      action,
      entityType,
      targetId: targetId ? String(targetId) : undefined,
      actorId,
      actorName,
      actorRole,
      details,
      ip,
      timestamp: new Date(),
    });
  } catch (err) {
    console.warn('[AuditLogger] Could not persist audit event:', err.message);
  }
};
