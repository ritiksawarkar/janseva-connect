import { z } from "zod";

export const getSchemesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  state: z.string().trim().optional(),
  beneficiary_group: z.string().trim().optional(),
  is_verified: z
    .enum(["true", "false", "all"])
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  sort: z.enum(["name_asc", "name_desc", "latest", "featured"]).default("latest"),
});

export const schemeIdParamSchema = z.object({
  id: z.string().min(1),
});
