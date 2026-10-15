import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Assignment } from '../models/Assignment.js';

export const analyticsService = {
  async getPlatformOverview() {
    const [totalUsers, totalDepartments, totalIncidents, resolvedIncidents] = await Promise.all([
      User.countDocuments(),
      Department.countDocuments(),
      Incident.countDocuments(),
      Incident.countDocuments({ status: 'resolved' }),
    ]);

    const resolutionRate =
      totalIncidents > 0 ? `${Math.round((resolvedIncidents / totalIncidents) * 100)}%` : '0%';

    return {
      totalUsers,
      totalDepartments,
      totalIncidents,
      resolvedIncidents,
      resolutionRate,
    };
  },

  async getManagerMetrics(departmentId = null) {
    const query = {};
    if (departmentId) query.departmentId = departmentId;

    const [active, unassigned, inProgress, pendingVerification, resolved] = await Promise.all([
      Incident.countDocuments({ ...query, status: { $ne: 'resolved' } }),
      Incident.countDocuments({
        ...query,
        assignedStaffId: null,
        status: { $in: ['reported', 'under_review'] },
      }),
      Incident.countDocuments({ ...query, status: 'in_progress' }),
      Incident.countDocuments({ ...query, status: 'pending_verification' }),
      Incident.countDocuments({ ...query, status: 'resolved' }),
    ]);

    return {
      active,
      unassigned,
      inProgress,
      pendingVerification,
      resolved,
    };
  },

  async getResolutionTrends(timeframe = '30d') {
    const days = timeframe === '60d' ? 60 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [reportedGroup, resolvedGroup] = await Promise.all([
      Incident.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Incident.aggregate([
        { $match: { resolvedAt: { $gte: startDate }, status: 'resolved' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$resolvedAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const reportedMap = new Map(reportedGroup.map((r) => [r._id, r.count]));
    const resolvedMap = new Map(resolvedGroup.map((r) => [r._id, r.count]));

    const trends = [];
    // Generate dates in interval
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      trends.push({
        date: displayDate,
        dateKey,
        reported: reportedMap.get(dateKey) || 0,
        resolved: resolvedMap.get(dateKey) || 0,
      });
    }

    return trends;
  },

  async getCategoryDistribution() {
    const agg = await Incident.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$category', '$categoryId'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return agg.map((item) => ({
      name: item._id || 'Uncategorized',
      count: item.count,
    }));
  },

  async getDepartmentPerformance() {
    const departments = await Department.find({ isActive: true });

    if (departments.length === 0) {
      // Fallback aggregate from incidents directly
      const agg = await Incident.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$departmentName', 'General Works'] },
            active: {
              $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] },
            },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
            },
          },
        },
      ]);
      return agg.map((a) => ({
        name: a._id,
        active: a.active,
        resolved: a.resolved,
      }));
    }

    const performance = await Promise.all(
      departments.map(async (dept) => {
        const [active, resolved] = await Promise.all([
          Incident.countDocuments({
            $or: [{ departmentId: dept._id }, { departmentName: dept.name }],
            status: { $ne: 'resolved' },
          }),
          Incident.countDocuments({
            $or: [{ departmentId: dept._id }, { departmentName: dept.name }],
            status: 'resolved',
          }),
        ]);

        return {
          name: dept.name,
          active,
          resolved,
        };
      })
    );

    return performance;
  },
};
