import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  monthlyLimit: z.number().positive("Monthly limit must be positive"),
  alertThreshold: z.number().min(0).max(100).optional(), // Percentage
});

export const updateBudgetSchema = z.object({
  monthlyLimit: z.number().positive().optional(),
  alertThreshold: z.number().min(0).max(100).optional().nullable(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

