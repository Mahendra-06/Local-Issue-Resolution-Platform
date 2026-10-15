import { AuditLog } from '../models/AuditLog.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const auditController = {
  async getAuditLogs(req, res, next) {
    try {
      const { search, action, entityType, page = 1, limit = 20 } = req.query;
      const query = {};

      if (action) query.action = action;
      if (entityType) query.entityType = entityType;

      if (search) {
        const s = search.trim();
        query.$or = [
          { action: new RegExp(s, 'i') },
          { actorName: new RegExp(s, 'i') },
          { targetId: new RegExp(s, 'i') },
          { details: new RegExp(s, 'i') },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [logs, total] = await Promise.all([
        AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)),
        AuditLog.countDocuments(query),
      ]);

      return ApiResponse.paginated(res, {
        data: logs.map((l) => l.toJSON()),
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      next(error);
    }
  },

  async getAuditLogById(req, res, next) {
    try {
      const log = await AuditLog.findById(req.params.id);
      if (!log) {
        return ApiResponse.error(res, 'Audit log event not found', 404);
      }
      return ApiResponse.success(res, log.toJSON(), 'Audit log event retrieved', 200);
    } catch (error) {
      next(error);
    }
  },
};
