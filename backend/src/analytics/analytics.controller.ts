import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { analyticsService } from "./analytics.service";

export class AnalyticsController {
  async getDashboardSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await analyticsService.getDashboardSummary(req.userId!);
      sendSuccess(res, summary);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCashFlow(req: AuthRequest, res: Response) {
    try {
      const period = (req.query.period as "month" | "quarter") || "month";
      const data = await analyticsService.getCashFlow(req.userId!, period);
      sendSuccess(res, data);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCategorySpend(req: AuthRequest, res: Response) {
    try {
      const data = await analyticsService.getCategorySpend(req.userId!);
      sendSuccess(res, data);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getSpendType(req: AuthRequest, res: Response) {
    try {
      const data = await analyticsService.getSpendType(req.userId!);
      sendSuccess(res, data);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getInsights(req: AuthRequest, res: Response) {
    try {
      const insights = await analyticsService.getInsights(req.userId!);
      sendSuccess(res, insights);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getNetWorth(req: AuthRequest, res: Response) {
    try {
      const netWorth = await analyticsService.getNetWorth(req.userId!);
      sendSuccess(res, netWorth);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const analyticsController = new AnalyticsController();

