import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  department: z.string().min(2, 'Department is required'),
  slaHours: z.number().min(1, 'SLA must be at least 1 hour').optional().default(24),
  description: z.string().optional(),
  icon: z.string().optional(),
});
