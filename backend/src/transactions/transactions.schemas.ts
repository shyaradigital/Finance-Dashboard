import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Type must be 'income' or 'expense'" }),
  }),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  description: z.string().min(1, "Description is required").max(500),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().datetime().or(z.date()),
  accountId: z.string().uuid("Invalid account ID").optional(),
  creditCardId: z.string().uuid("Invalid credit card ID").optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => data.accountId || data.creditCardId,
  {
    message: "Either accountId or creditCardId must be provided",
    path: ["accountId"],
  }
);

export const updateTransactionSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(500).optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().or(z.date()).optional(),
  accountId: z.string().uuid().optional().nullable(),
  creditCardId: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional(),
});

export const createRecurringTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  categoryId: z.string().uuid().optional(),
  description: z.string().min(1, "Description is required").max(500),
  amount: z.number().positive("Amount must be positive"),
  frequency: z.enum(["monthly", "quarterly", "yearly", "custom"]),
  customDays: z.number().int().positive().optional(),
  startDate: z.string().datetime().or(z.date()),
  accountId: z.string().uuid().optional(),
  creditCardId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => data.frequency !== "custom" || data.customDays !== undefined,
  {
    message: "customDays is required when frequency is 'custom'",
    path: ["customDays"],
  }
).refine(
  (data) => data.accountId || data.creditCardId,
  {
    message: "Either accountId or creditCardId must be provided",
    path: ["accountId"],
  }
);

export const updateRecurringTransactionSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(500).optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(["monthly", "quarterly", "yearly", "custom"]).optional(),
  customDays: z.number().int().positive().optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  accountId: z.string().uuid().optional().nullable(),
  creditCardId: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionSchema>;
export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionSchema>;

