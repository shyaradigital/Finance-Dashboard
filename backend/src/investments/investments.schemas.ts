import { z } from "zod";

// Investment Schemas
export const createInvestmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.string().min(1, "Investment type is required").max(50), // Allow any string type
  invested: z.number().min(0, "Invested amount must be non-negative"),
  currentValue: z.number().min(0, "Current value must be non-negative"),
  purchaseDate: z.string().datetime().or(z.date()).optional(),
  color: z.string().optional(),
});

export const updateInvestmentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().min(1).max(50).optional(), // Allow any string type
  invested: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  purchaseDate: z.string().datetime().or(z.date()).optional().nullable(),
  color: z.string().optional(),
});

// SIP Schemas
export const createSIPSchema = z.object({
  investmentId: z.string().uuid("Invalid investment ID").optional(),
  name: z.string().min(1, "Name is required").max(200),
  amount: z.number().positive("Amount must be positive"),
  frequency: z.string().min(1, "Frequency is required").max(50), // Allow any string frequency
  startDate: z.string().datetime().or(z.date()),
}).passthrough(); // Allow totalInvested in input but ignore it

export const updateSIPSchema = z.object({
  investmentId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(200).optional(),
  amount: z.number().positive().optional(),
  frequency: z.string().min(1).max(50).optional(), // Allow any string frequency
  startDate: z.string().datetime().or(z.date()).optional(),
  totalInvested: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
export type CreateSIPInput = z.infer<typeof createSIPSchema>;
export type UpdateSIPInput = z.infer<typeof updateSIPSchema>;

