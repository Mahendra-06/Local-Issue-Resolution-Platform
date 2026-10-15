import mongoose from 'mongoose';
import { Incident } from '../models/Incident.js';
import { Category } from '../models/Category.js';
import { Department } from '../models/Department.js';
import { generateReferenceId } from '../utils/referenceGenerator.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { notificationService } from './notificationService.js';

export const incidentService = {
  async createReport(user, data, req = null) {
    let categoryName = data.categoryId;
    let departmentName = 'Public Works & Roads';
    let departmentId = null;

    const categoryDoc = await Category.findOne({
      $or: [{ key: data.categoryId }, { name: new RegExp(`^${data.categoryId}$`, 'i') }],
    });

    if (categoryDoc) {
      categoryName = categoryDoc.name;
      if (categoryDoc.department) {
        departmentName = categoryDoc.department;
        const deptDoc = await Department.findOne({
          name: new RegExp(`^${categoryDoc.department}$`, 'i'),
        });
        if (deptDoc) departmentId = deptDoc._id;
      }
    }

    const referenceId = generateReferenceId('CP');
    const lat = Number(data.latitude);
    const lng = Number(data.longitude);

    const initialTimeline = [
      {
        status: 'reported',
        title: 'Problem Reported',
        timestamp: new Date(),
        actorName: user.name,
        actorRole: user.role,
        notes: 'Incident report submitted by citizen through CivicPulse portal.',
        evidenceUrls: data.photoUrl ? [data.photoUrl] : [],
      },
    ];

    const incident = await Incident.create({
      referenceId,
      title: data.title.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      category: categoryName,
      priority: 'medium',
      status: 'reported',
      address: data.address.trim(),
      latitude: lat,
      longitude: lng,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      photoUrl: data.photoUrl || null,
      photos: data.photoUrl ? [data.photoUrl] : [],
      reportedBy: user._id,
      reporterName: user.name,
      departmentId,
      departmentName,
      timeline: initialTimeline,
    });

    await logAuditEvent({
      action: 'INCIDENT_CREATED',
      entityType: 'incident',
      targetId: incident._id.toString(),
      actor: user,
      details: `Report #${referenceId} created: ${incident.title} (${incident.address})`,
      req,
    });

    await notificationService.createNotification({
      userId: user._id,
      title: 'Report Registered Successfully',
      message: `Your report #${referenceId} (${incident.title}) has been received and routed for review.`,
      type: 'status_change',
      incidentId: incident._id,
      referenceId,
    });

    return incident.toJSON();
  },

  async getMyReports(userId, { search, status, category, limit = 20, page = 1 } = {}) {
    const query = { reportedBy: userId };

    if (status) {
      const statuses = status.split(',').map((s) => s.trim().toLowerCase());
      query.status = { $in: statuses };
    }

    if (category) {
      query.$or = [{ categoryId: category }, { category: new RegExp(category, 'i') }];
    }

    if (search) {
      const s = search.trim();
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { referenceId: new RegExp(s, 'i') },
            { title: new RegExp(s, 'i') },
            { address: new RegExp(s, 'i') },
            { description: new RegExp(s, 'i') },
          ],
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [incidents, total] = await Promise.all([
      Incident.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Incident.countDocuments(query),
    ]);

    return {
      data: incidents.map((i) => i.toJSON()),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    };
  },

  async getIncidents({ search, status, priority, category, departmentId, page = 1, limit = 20 } = {}) {
    const query = {};

    if (status) {
      const statuses = status.split(',').map((s) => s.trim().toLowerCase());
      query.status = { $in: statuses };
    }

    if (priority) {
      const priorities = priority.split(',').map((p) => p.trim().toLowerCase());
      query.priority = { $in: priorities };
    }

    if (category) {
      query.$or = [{ categoryId: category }, { category: new RegExp(category, 'i') }];
    }

    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      query.departmentId = departmentId;
    }

    if (search) {
      const s = search.trim();
      query.$or = [
        { referenceId: new RegExp(s, 'i') },
        { title: new RegExp(s, 'i') },
        { address: new RegExp(s, 'i') },
        { description: new RegExp(s, 'i') },
        { assignedStaffName: new RegExp(s, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [incidents, total] = await Promise.all([
      Incident.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Incident.countDocuments(query),
    ]);

    return {
      data: incidents.map((i) => i.toJSON()),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    };
  },

  async getIncidentById(id, user = null) {
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { referenceId: id };
    }

    const incident = await Incident.findOne(query);
    if (!incident) {
      const error = new Error(`Incident with identifier ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    // Role-based scoping: Citizens can only inspect their own reports
    if (user && user.role === 'citizen') {
      if (incident.reportedBy.toString() !== user._id.toString()) {
        const error = new Error('You do not have permission to view this report.');
        error.statusCode = 403;
        throw error;
      }
    }

    return incident.toJSON();
  },

  async updateIncidentStatus(id, { status, notes, priority }, actor, req = null) {
    const incident = await Incident.findById(id);
    if (!incident) {
      const error = new Error(`Incident with identifier ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const prevStatus = incident.status;
    incident.status = status;

    if (priority) {
      incident.priority = priority;
    }

    if (status === 'resolved') {
      incident.resolvedAt = new Date();
    }

    const eventTitle = `Status updated to ${status.replace(/_/g, ' ').toUpperCase()}`;
    incident.timeline.push({
      status,
      title: eventTitle,
      timestamp: new Date(),
      actorName: actor.name || actor.email,
      actorRole: actor.role,
      notes: notes || `Status changed from ${prevStatus} to ${status}.`,
    });

    await incident.save();

    await logAuditEvent({
      action: 'INCIDENT_STATUS_UPDATED',
      entityType: 'incident',
      targetId: incident._id.toString(),
      actor,
      details: `Incident #${incident.referenceId} status changed: ${prevStatus} ➔ ${status}`,
      req,
    });

    // Notify the citizen reporter
    await notificationService.createNotification({
      userId: incident.reportedBy,
      title: `Report Status Update: #${incident.referenceId}`,
      message: `Your report "${incident.title}" has been updated to: ${status.replace(/_/g, ' ').toUpperCase()}.`,
      type: 'status_change',
      incidentId: incident._id,
      referenceId: incident.referenceId,
    });

    return incident.toJSON();
  },

  async getIncidentTimeline(id) {
    const incident = await Incident.findById(id);
    if (!incident) {
      const error = new Error(`Incident with identifier ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return incident.timeline || [];
  },
};
