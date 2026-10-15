import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['citizen', 'staff', 'manager', 'admin']),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['citizen', 'staff', 'manager', 'admin']),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});
