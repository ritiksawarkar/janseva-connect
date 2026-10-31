import { z } from "zod";

export const eligibilityCheckSchema = z.object({
  age: z
    .coerce.number()
    .int("Age must be an integer")
    .min(0, "Age cannot be negative")
    .max(120, "Please provide a valid age"),
  state: z
    .string()
    .trim()
    .min(2, "State name must be at least 2 characters"),
  district: z.string().trim().optional().default(""),
  annualIncome: z
    .coerce.number()
    .min(0, "Annual family income cannot be negative"),
  education: z.string().trim().optional().default(""),
  occupation: z.string().trim().optional().default(""),
  gender: z
    .enum(["Male", "Female", "Other", "Prefer not to say", ""])
    .optional()
    .default(""),
  category: z.string().trim().optional().default(""), // Caste/Social category e.g. SC, ST, OBC, General
  hasPuccaHouse: z.boolean().optional(),
  isRationCardHolder: z.boolean().optional(),
  ownsLand: z.boolean().optional(),
});
