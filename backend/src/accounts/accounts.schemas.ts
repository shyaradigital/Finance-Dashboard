import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bank: z.string().min(1, "Bank name is required").max(100),
  type: z.string().min(1, "Account type is required").max(50), // Allow any string type
  balance: z.number().min(0).optional(), // Allow balance to be set during creation
  accountNumber: z.string().min(1, "Account number is required").max(50),
  color: z.string().optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bank: z.string().min(1).max(100).optional(),
  type: z.string().min(1).max(50).optional(), // Allow any string type
  balance: z.number().min(0).optional(),
  accountNumber: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

