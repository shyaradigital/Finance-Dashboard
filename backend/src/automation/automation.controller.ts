import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { automationService } from "./automation.service";

export class AutomationController {
  async getAutomationRules(req: AuthRequest, res: Response) {
    try {
      const rules = await automationService.getAutomationRules(req.userId!);
      const rulesWithConfig = rules.map((rule) => ({
        ...rule,
        ruleConfig: JSON.parse(rule.ruleConfig),
      }));
      sendSuccess(res, rulesWithConfig);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getAutomationRuleById(req: AuthRequest, res: Response) {
    try {
      const rule = await automationService.getAutomationRuleById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, rule);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createAutomationRule(req: AuthRequest, res: Response) {
    try {
      const rule = await automationService.createAutomationRule(
        req.userId!,
        req.body
      );
      sendSuccess(res, rule, "Automation rule created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateAutomationRule(req: AuthRequest, res: Response) {
    try {
      const rule = await automationService.updateAutomationRule(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, rule, "Automation rule updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteAutomationRule(req: AuthRequest, res: Response) {
    try {
      await automationService.deleteAutomationRule(req.userId!, req.params.id);
      sendSuccess(res, null, "Automation rule deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async toggleAutomationRule(req: AuthRequest, res: Response) {
    try {
      const rule = await automationService.toggleAutomationRule(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, rule, "Automation rule toggled successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const automationController = new AutomationController();

