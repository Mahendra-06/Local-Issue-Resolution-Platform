import { z } from 'zod';

export const assignTaskSchema = z.object({
  incidentId: z.string().min(1, 'Incident ID is required'),
  staffId: z.string().min(1, 'Staff member ID is required'),
  instructions: z.string().min(3, 'Instructions are required'),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export const reassignTaskSchema = z.object({
  staffId: z.string().min(1, 'Staff member ID is required'),
  instructions: z.string().optional(),
  dueDate: z.string().optional(),
  reason: z.string().optional(),
});

export const updateProgressSchema = z.object({
  status: z.enum(['in_progress', 'assigned']),
  notes: z.string().optional(),
});

export const submitVerificationSchema = z.object({
  notes: z.string().min(3, 'Verification notes describing completed work are required'),
  evidenceUrls: z.array(z.string()).optional().default([]),
  completionTime: z.string().optional(),
});

export const verifyResolutionSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional(),
  reopenReason: z.string().optional(),
  newDueDate: z.string().optional(),
});
