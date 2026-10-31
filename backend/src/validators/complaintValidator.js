import { z } from 'zod';

export const createComplaintSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters long').max(255, 'Title cannot exceed 255 characters'),
  description: z.string().trim().min(15, 'Description must be at least 15 characters long'),
  category: z.string().trim().min(2, 'Category is required'),
  subcategory: z.string().trim().optional(),
  state: z.string().trim().default('Maharashtra'),
  district: z.string().trim().min(2, 'District is required'),
  area: z.string().trim().min(2, 'City / Area is required'),
  landmark: z.string().trim().optional(),
  location_address: z.string().trim().min(5, 'Full street / location address is required'),
  latitude: z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number)]).optional(),
  longitude: z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number)]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).default('MEDIUM'),
  preferred_contact_method: z.enum(['IN_APP', 'EMAIL', 'SMS']).default('IN_APP'),
  is_emergency: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(false),
  is_public: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true)
});

export const updateComplaintSchema = z.object({
  title: z.string().trim().min(5).max(255).optional(),
  description: z.string().trim().min(15).optional(),
  landmark: z.string().trim().optional(),
  preferred_contact_method: z.enum(['IN_APP', 'EMAIL', 'SMS']).optional()
});
