import { z } from "zod";

export const createVaultItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.string().min(1, "Category is required").max(100),
  value: z.string().min(1, "Value is required"),
  type: z.enum(["text", "document"], {
    errorMap: () => ({ message: "Type must be 'text' or 'document'" }),
  }),
  documentUrl: z.string().url().optional(),
  documentName: z.string().max(500).optional(),
});

export const updateVaultItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  value: z.string().min(1).optional(),
  type: z.enum(["text", "document"]).optional(),
  documentUrl: z.string().url().optional().nullable(),
  documentName: z.string().max(500).optional().nullable(),
});

export type CreateVaultItemInput = z.infer<typeof createVaultItemSchema>;
export type UpdateVaultItemInput = z.infer<typeof updateVaultItemSchema>;

