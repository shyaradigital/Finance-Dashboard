import { z } from "zod";

export const createAutomationRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  enabled: z.boolean().default(true),
  ruleConfig: z.record(z.any()).optional(),
});

export const updateAutomationRuleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  enabled: z.boolean().optional(),
  ruleConfig: z.record(z.any()).optional(),
});

export type CreateAutomationRuleInput = z.infer<typeof createAutomationRuleSchema>;
export type UpdateAutomationRuleInput = z.infer<typeof updateAutomationRuleSchema>;

