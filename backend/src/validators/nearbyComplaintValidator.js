import { z } from 'zod';

export const nearbySearchSchema = z.object({
  latitude: z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number)]),
  longitude: z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number)]),
  radius: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]).default(2),
  category: z.string().trim().optional(),
  keywords: z.string().trim().optional(),
  page: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).default(1),
  limit: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).default(10)
});
