import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment.js';
import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { notificationService } from './notificationService.js';

export const assignmentService = {
  async assignTask({ incidentId, staffId, instructions, dueDate, priority }, manager, req = null) {
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      const error = new Error(`Incident with identifier ${incidentId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const staffMember = await User.findById(staffId);
    if (!staffMember) {
      const error = new Error(`Staff member with identifier ${staffId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (staffMember.role !== 'staff') {
      const error = new Error(`Assigned user must have the 'staff' role. (Provided user has role: ${staffMember.role})`);
      error.statusCode = 400;
      throw error;
    }

    const assignedPriority = priority || incident.priority || 'medium';
    const parsedDueDate = dueDate ? new Date(dueDate) : null;

    // Create assignment record
    const assignment = await Assignment.create({
      referenceId: incident.referenceId,
      incidentId: incident._id,
      title: incident.title,
      incidentTitle: incident.title,
      address: incident.address,
      latitude: incident.latitude,
      longitude: incident.longitude,
      staffId: staffMember._id,
      staffName: staffMember.name,
      assignedBy: manager._id,
      assignedByName: manager.name,
      instructions: instructions.trim(),
      priority: assignedPriority,
      status: 'assigned',
      dueDate: parsedDueDate,
    });

    // Update incident status & assignment pointers
    incident.status = 'assigned';
    incident.priority = assignedPriority;
    incident.assignedStaffId = staffMember._id;
    incident.assignedStaffName = staffMember.name;
    incident.currentAssignmentId = assignment._id;
    if (parsedDueDate) incident.dueDate = parsedDueDate;

    incident.timeline.push({
      status: 'assigned',
      title: 'Work Assigned to Field Staff',
      timestamp: new Date(),
      actorName: manager.name,
      actorRole: manager.role,
      notes: `Assigned to ${staffMember.name}. Instructions: "${instructions.trim()}"`,
    });

    await incident.save();

    await logAuditEvent({
      action: 'TASK_ASSIGNED',
      entityType: 'assignment',
      targetId: assignment._id.toString(),
      actor: manager,
      details: `Incident #${incident.referenceId} assigned to ${staffMember.name} by ${manager.name}`,
      req,
    });

    // Notify field staff
    await notificationService.createNotification({
      userId: staffMember._id,
      title: 'New Remediation Task Assigned',
      message: `You have been assigned to repair Incident #${incident.referenceId} (${incident.title}). Instructions: "${instructions.trim()}"`,
      type: 'assignment',
      incidentId: incident._id,
      referenceId: incident.referenceId,
    });

    // Notify citizen reporter
    await notificationService.createNotification({
      userId: incident.reportedBy,
      title: `Staff Assigned to Report #${incident.referenceId}`,
      message: `Your report "${incident.title}" has been assigned to municipal field technician ${staffMember.name}.`,
      type: 'status_change',
      incidentId: incident._id,
      referenceId: incident.referenceId,
    });

    return assignment.toJSON();
  },

  async getStaffTasks(staffId, { search, status, priority, page = 1, limit = 20 } = {}) {
    const query = { staffId };

    if (status) {
      const statuses = status.split(',').map((s) => s.trim().toLowerCase());
      query.status = { $in: statuses };
    }

    if (priority) {
      const priorities = priority.split(',').map((p) => p.trim().toLowerCase());
      query.priority = { $in: priorities };
    }

    if (search) {
      const s = search.trim();
      query.$or = [
        { referenceId: new RegExp(s, 'i') },
        { title: new RegExp(s, 'i') },
        { incidentTitle: new RegExp(s, 'i') },
        { address: new RegExp(s, 'i') },
        { instructions: new RegExp(s, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [tasks, total] = await Promise.all([
      Assignment.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Assignment.countDocuments(query),
    ]);

    return {
      data: tasks.map((t) => t.toJSON()),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    };
  },

  async getTaskById(taskId) {
    const task = await Assignment.findById(taskId);
    if (!task) {
      const error = new Error(`Task assignment #${taskId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const taskJson = task.toJSON();

    // Populate incident timeline if exists
    const incident = await Incident.findById(task.incidentId);
    if (incident) {
      taskJson.timeline = incident.timeline || [];
      taskJson.photoUrl = incident.photoUrl;
      taskJson.description = incident.description;
    }

    return taskJson;
  },

  async updateProgress(assignmentId, { status, notes }, staffUser, req = null) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      const error = new Error(`Task with identifier ${assignmentId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    // Verify assignment belongs to this staff member
    if (assignment.staffId.toString() !== staffUser._id.toString()) {
      const error = new Error('You are not authorized to update progress on a task assigned to someone else.');
      error.statusCode = 403;
      throw error;
    }

    assignment.status = status;
    await assignment.save();

    // Update incident status
    const incident = await Incident.findById(assignment.incidentId);
    if (incident) {
      incident.status = status;
      incident.timeline.push({
        status,
        title: 'Work Commenced: In Progress',
        timestamp: new Date(),
        actorName: staffUser.name,
        actorRole: staffUser.role,
        notes: notes || 'Field technician commenced physical remediation work.',
      });
      await incident.save();

      // Notify citizen
      await notificationService.createNotification({
        userId: incident.reportedBy,
        title: `Work Commenced: #${incident.referenceId}`,
        message: `Field technician ${staffUser.name} has begun work on "${incident.title}".`,
        type: 'status_change',
        incidentId: incident._id,
        referenceId: incident.referenceId,
      });
    }

    await logAuditEvent({
      action: 'TASK_PROGRESS_UPDATED',
      entityType: 'assignment',
      targetId: assignment._id.toString(),
      actor: staffUser,
      details: `Staff ${staffUser.name} updated task #${assignment.referenceId} status to ${status}`,
      req,
    });

    return assignment.toJSON();
  },

  async submitForVerification(assignmentId, { notes, evidenceUrls = [], completionTime }, staffUser, req = null) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      const error = new Error(`Task with identifier ${assignmentId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (assignment.staffId.toString() !== staffUser._id.toString()) {
      const error = new Error('You are not authorized to submit verification for a task assigned to another technician.');
      error.statusCode = 403;
      throw error;
    }

    const cTime = completionTime ? new Date(completionTime) : new Date();

    assignment.status = 'pending_verification';
    assignment.completionNotes = notes;
    assignment.evidenceUrls = evidenceUrls;
    assignment.completionTime = cTime;
    await assignment.save();

    const incident = await Incident.findById(assignment.incidentId);
    if (incident) {
      incident.status = 'pending_verification';
      incident.timeline.push({
        status: 'pending_verification',
        title: 'Work Completed & Submitted for Verification',
        timestamp: cTime,
        actorName: staffUser.name,
        actorRole: staffUser.role,
        notes: `Work completed by ${staffUser.name}: "${notes}"`,
        evidenceUrls,
      });
      await incident.save();

      // Notify citizen
      await notificationService.createNotification({
        userId: incident.reportedBy,
        title: `Remediation Completed: #${incident.referenceId}`,
        message: `Field repairs for "${incident.title}" have been completed and submitted for manager quality verification.`,
        type: 'status_change',
        incidentId: incident._id,
        referenceId: incident.referenceId,
      });
    }

    await logAuditEvent({
      action: 'SUBMITTED_FOR_VERIFICATION',
      entityType: 'assignment',
      targetId: assignment._id.toString(),
      actor: staffUser,
      details: `Technician ${staffUser.name} submitted task #${assignment.referenceId} for manager verification with ${evidenceUrls.length} photo(s)`,
      req,
    });

    return assignment.toJSON();
  },

  async getVerificationQueue({ page = 1, limit = 20 } = {}) {
    const query = { status: 'pending_verification' };
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Assignment.find(query).sort({ completionTime: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Assignment.countDocuments(query),
    ]);

    return {
      data: items.map((i) => i.toJSON()),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    };
  },

  async verifyResolution(assignmentId, { approved, notes, reopenReason, newDueDate }, manager, req = null) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      const error = new Error(`Assignment #${assignmentId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const incident = await Incident.findById(assignment.incidentId);
    if (!incident) {
      const error = new Error(`Incident associated with assignment not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (approved) {
      // Resolution APPROVED
      assignment.status = 'resolved';
      assignment.verifiedBy = manager._id;
      assignment.verifiedByName = manager.name;
      assignment.verificationNotes = notes || 'Resolution approved and verified by department manager.';
      assignment.verificationTime = new Date();
      await assignment.save();

      incident.status = 'resolved';
      incident.resolvedAt = new Date();
      incident.timeline.push({
        status: 'resolved',
        title: 'Resolution Verified & Closed',
        timestamp: new Date(),
        actorName: manager.name,
        actorRole: manager.role,
        notes: notes || 'Department Manager verified field repairs and officially closed the incident.',
        evidenceUrls: assignment.evidenceUrls || [],
      });
      await incident.save();

      // Notify citizen
      await notificationService.createNotification({
        userId: incident.reportedBy,
        title: `Report Resolved & Closed: #${incident.referenceId}`,
        message: `Your report "${incident.title}" has been successfully resolved and quality verified. Thank you for helping improve our municipality!`,
        type: 'verification',
        incidentId: incident._id,
        referenceId: incident.referenceId,
      });

      // Notify staff
      await notificationService.createNotification({
        userId: assignment.staffId,
        title: `Task Approved: #${incident.referenceId}`,
        message: `Manager ${manager.name} verified and approved your remediation work for "${incident.title}".`,
        type: 'verification',
        incidentId: incident._id,
        referenceId: incident.referenceId,
      });

      await logAuditEvent({
        action: 'RESOLUTION_APPROVED',
        entityType: 'incident',
        targetId: incident._id.toString(),
        actor: manager,
        details: `Manager ${manager.name} approved resolution for #${incident.referenceId}`,
        req,
      });
    } else {
      // Resolution REJECTED (Reopened for staff rework)
      const reason = reopenReason || notes || 'Work deemed incomplete during quality inspection.';
      assignment.status = 'reopened';
      assignment.reopenReason = reason;
      if (newDueDate) assignment.dueDate = new Date(newDueDate);
      await assignment.save();

      incident.status = 'reopened';
      if (newDueDate) incident.dueDate = new Date(newDueDate);
      incident.timeline.push({
        status: 'reopened',
        title: 'Work Incomplete - Reopened for Remediation',
        timestamp: new Date(),
        actorName: manager.name,
        actorRole: manager.role,
        notes: `Manager rejected resolution: "${reason}". Reopened for rework.`,
      });
      await incident.save();

      // Notify staff
      await notificationService.createNotification({
        userId: assignment.staffId,
        title: `Task Reopened for Remediation: #${incident.referenceId}`,
        message: `Your submitted work for "${incident.title}" was not approved: "${reason}". Please remediate and resubmit.`,
        type: 'verification',
        incidentId: incident._id,
        referenceId: incident.referenceId,
      });

      // Notify citizen
      await notificationService.createNotification({
        userId: incident.reportedBy,
        title: `Report Update: #${incident.referenceId}`,
        message: `Department Manager inspected the repair on "${incident.title}" and ordered additional remediation for quality assurance.`,
        type: 'status_change',
        incidentId: incident._id,
        referenceId: incident.referenceId,
      });

      await logAuditEvent({
        action: 'RESOLUTION_REJECTED',
        entityType: 'incident',
        targetId: incident._id.toString(),
        actor: manager,
        details: `Manager ${manager.name} rejected work for #${incident.referenceId}: ${reason}`,
        req,
      });
    }

    return assignment.toJSON();
  },

  async reassignTask(assignmentId, { staffId, instructions, dueDate, reason }, manager, req = null) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      const error = new Error(`Assignment #${assignmentId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const newStaff = await User.findById(staffId);
    if (!newStaff || newStaff.role !== 'staff') {
      const error = new Error(`Valid staff member required for reassignment.`);
      error.statusCode = 400;
      throw error;
    }

    const previousStaffName = assignment.staffName;
    assignment.staffId = newStaff._id;
    assignment.staffName = newStaff.name;
    if (instructions) assignment.instructions = instructions.trim();
    if (dueDate) assignment.dueDate = new Date(dueDate);
    assignment.status = 'assigned';
    await assignment.save();

    const incident = await Incident.findById(assignment.incidentId);
    if (incident) {
      incident.assignedStaffId = newStaff._id;
      incident.assignedStaffName = newStaff.name;
      incident.status = 'assigned';
      if (dueDate) incident.dueDate = new Date(dueDate);

      incident.timeline.push({
        status: 'assigned',
        title: 'Work Reassigned',
        timestamp: new Date(),
        actorName: manager.name,
        actorRole: manager.role,
        notes: `Reassigned from ${previousStaffName} to ${newStaff.name}. Reason: ${reason || 'Operational adjustment'}`,
      });
      await incident.save();

      // Notify new staff
      await notificationService.createNotification({
        userId: newStaff._id,
        title: 'Task Reassigned to You',
        message: `Task #${incident.referenceId} (${incident.title}) has been assigned to you.`,
        type: 'assignment',
        incidentId: incident._id,
        referenceId: incident.referenceId,
      });
    }

    await logAuditEvent({
      action: 'TASK_REASSIGNED',
      entityType: 'assignment',
      targetId: assignment._id.toString(),
      actor: manager,
      details: `Task #${assignment.referenceId} reassigned to ${newStaff.name} (was: ${previousStaffName})`,
      req,
    });

    return assignment.toJSON();
  },
};
