import prisma from "../config/database";
import {
  CreateAutomationRuleInput,
  UpdateAutomationRuleInput,
} from "./automation.schemas";

export class AutomationService {
  async getAutomationRules(userId: string) {
    return prisma.automationRule.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAutomationRuleById(userId: string, ruleId: string) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
    });

    if (!rule) {
      throw new Error("Automation rule not found");
    }

    return {
      ...rule,
      ruleConfig: JSON.parse(rule.ruleConfig),
    };
  }

  async createAutomationRule(
    userId: string,
    input: CreateAutomationRuleInput
  ) {
    const rule = await prisma.automationRule.create({
      data: {
        userId,
        name: input.name,
        description: input.description || "",
        enabled: input.enabled ?? true,
        ruleConfig: input.ruleConfig
          ? JSON.stringify(input.ruleConfig)
          : "{}",
      },
    });

    return {
      ...rule,
      ruleConfig: JSON.parse(rule.ruleConfig),
    };
  }

  async updateAutomationRule(
    userId: string,
    ruleId: string,
    input: UpdateAutomationRuleInput
  ) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
    });

    if (!rule) {
      throw new Error("Automation rule not found");
    }

    const updateData: any = { ...input };
    if (input.ruleConfig !== undefined) {
      updateData.ruleConfig = JSON.stringify(input.ruleConfig);
    }

    const updated = await prisma.automationRule.update({
      where: { id: ruleId },
      data: updateData,
    });

    return {
      ...updated,
      ruleConfig: JSON.parse(updated.ruleConfig),
    };
  }

  async deleteAutomationRule(userId: string, ruleId: string) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
    });

    if (!rule) {
      throw new Error("Automation rule not found");
    }

    await prisma.automationRule.delete({
      where: { id: ruleId },
    });
  }

  async toggleAutomationRule(userId: string, ruleId: string) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
    });

    if (!rule) {
      throw new Error("Automation rule not found");
    }

    const updated = await prisma.automationRule.update({
      where: { id: ruleId },
      data: {
        enabled: !rule.enabled,
      },
    });

    return {
      ...updated,
      ruleConfig: JSON.parse(updated.ruleConfig),
    };
  }
}

export const automationService = new AutomationService();

