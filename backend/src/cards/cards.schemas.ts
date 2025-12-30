import { z } from "zod";

// Credit Card Schemas
export const createCreditCardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bank: z.string().min(1, "Bank name is required").max(100),
  lastFour: z.string().length(4, "Last four digits must be 4 characters"),
  limit: z.number().min(0, "Limit must be positive"),
  dueDate: z.number().int().min(1).max(31, "Due date must be between 1-31"),
  minDue: z.number().min(0).optional(),
  billingCycleStart: z.number().int().min(1).max(31).optional(),
  color: z.string().optional(),
}).passthrough(); // Allow used in input but ignore it

export const updateCreditCardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bank: z.string().min(1).max(100).optional(),
  lastFour: z.string().length(4).optional(),
  limit: z.number().min(0).optional(),
  used: z.number().min(0).optional(),
  dueDate: z.number().int().min(1).max(31).optional(),
  minDue: z.number().min(0).optional(),
  billingCycleStart: z.number().int().min(1).max(31).optional(),
  color: z.string().optional(),
});

// Debit Card Schemas
export const createDebitCardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bank: z.string().min(1, "Bank name is required").max(100),
  lastFour: z.string().length(4, "Last four digits must be 4 characters"),
  linkedAccountId: z.string().uuid("Invalid account ID").optional(), // Make optional, can be resolved from name
  linkedAccount: z.string().optional(), // Allow account name for lookup
  cardNetwork: z.string().min(1, "Card network is required").max(50), // Allow any string network
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry date must be in MM/YY format").optional(),
  isActive: z.boolean().default(true),
  color: z.string().optional(),
});

export const updateDebitCardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bank: z.string().min(1).max(100).optional(),
  lastFour: z.string().length(4).optional(),
  linkedAccountId: z.string().uuid().optional(),
  linkedAccount: z.string().optional(),
  cardNetwork: z.string().min(1).max(50).optional(), // Allow any string network
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/).optional(),
  isActive: z.boolean().optional(),
  color: z.string().optional(),
});

export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;
export type UpdateCreditCardInput = z.infer<typeof updateCreditCardSchema>;
export type CreateDebitCardInput = z.infer<typeof createDebitCardSchema>;
export type UpdateDebitCardInput = z.infer<typeof updateDebitCardSchema>;

