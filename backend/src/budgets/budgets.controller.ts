import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { budgetsService } from "./budgets.service";

export class BudgetsController {
  async getBudgets(req: AuthRequest, res: Response) {
    try {
      const budgets = await budgetsService.getBudgets(req.userId!);
      sendSuccess(res, budgets);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getBudgetById(req: AuthRequest, res: Response) {
    try {
      const budget = await budgetsService.getBudgetById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, budget);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createBudget(req: AuthRequest, res: Response) {
    try {
      const budget = await budgetsService.createBudget(req.userId!, req.body);
      sendSuccess(res, budget, "Budget created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateBudget(req: AuthRequest, res: Response) {
    try {
      const budget = await budgetsService.updateBudget(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, budget, "Budget updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteBudget(req: AuthRequest, res: Response) {
    try {
      await budgetsService.deleteBudget(req.userId!, req.params.id);
      sendSuccess(res, null, "Budget deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getBudgetSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await budgetsService.getBudgetSummary(req.userId!);
      sendSuccess(res, summary);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const budgetsController = new BudgetsController();

