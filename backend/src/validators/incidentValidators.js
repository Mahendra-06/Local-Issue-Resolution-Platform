import { z } from 'zod';

export const createIncidentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  address: z.string().min(3, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  photoUrl: z.string().nullable().optional(),
});

export const updateIncidentStatusSchema = z.object({
  status: z.enum([
    'reported',
    'under_review',
    'assigned',
    'in_progress',
    'pending_verification',
    'resolved',
    'rejected',
    'reopened',
    'overdue',
  ]),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});
