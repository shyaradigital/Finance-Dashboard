import { z } from "zod";

export const updateSettingsSchema = z.object({
  preferences: z.record(z.any()).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// User options schema
export const userOptionsSchema = z.object({
  investmentTypes: z.array(z.string()).optional(),
  accountTypes: z.array(z.string()).optional(),
  commitmentTypes: z.array(z.string()).optional(),
  sipFrequencies: z.array(z.string()).optional(),
  cardNetworks: z.array(z.string()).optional(),
  vaultCategories: z.array(z.string()).optional(),
});

export type UserOptionsInput = z.infer<typeof userOptionsSchema>;

