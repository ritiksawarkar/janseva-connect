import { z } from "zod";

export const getServicesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  department_id: z.coerce.number().int().positive().optional(),
  department: z.string().trim().optional(),
  is_verified: z
    .enum(["true", "false", "all"])
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  sort: z.enum(["name_asc", "name_desc", "latest", "popular"]).default("latest"),
});

export const serviceIdParamSchema = z.object({
  id: z.string().min(1),
});
