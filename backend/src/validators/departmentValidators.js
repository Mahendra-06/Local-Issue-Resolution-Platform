import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(150),
  code: z.string().optional(),
  description: z.string().optional(),
  serviceArea: z.string().optional(),
  contactEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
});
