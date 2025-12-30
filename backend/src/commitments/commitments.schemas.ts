import { z } from "zod";

export const createCommitmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string().datetime().or(z.date()),
  type: z.string().min(1, "Commitment type is required").max(50), // Allow any string type
  isRecurring: z.boolean().default(false),
  frequency: z.string().min(1).max(50).optional(), // Allow any string frequency
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => !data.isRecurring || data.frequency !== undefined,
  {
    message: "Frequency is required for recurring commitments",
    path: ["frequency"],
  }
);

export const updateCommitmentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().datetime().or(z.date()).optional(),
  type: z.string().min(1).max(50).optional(), // Allow any string type
  isRecurring: z.boolean().optional(),
  frequency: z.string().min(1).max(50).optional(), // Allow any string frequency
  notes: z.string().max(1000).optional(),
});

export type CreateCommitmentInput = z.infer<typeof createCommitmentSchema>;
export type UpdateCommitmentInput = z.infer<typeof updateCommitmentSchema>;

