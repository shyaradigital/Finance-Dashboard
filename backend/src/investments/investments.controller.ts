import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { investmentsService } from "./investments.service";
import { sipsService } from "./sips.service";

export class InvestmentsController {
  // Investments
  async getInvestments(req: AuthRequest, res: Response) {
    try {
      const investments = await investmentsService.getInvestments(req.userId!);
      sendSuccess(res, investments);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getInvestmentById(req: AuthRequest, res: Response) {
    try {
      const investment = await investmentsService.getInvestmentById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, investment);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createInvestment(req: AuthRequest, res: Response) {
    try {
      const investment = await investmentsService.createInvestment(
        req.userId!,
        req.body
      );
      sendSuccess(res, investment, "Investment created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateInvestment(req: AuthRequest, res: Response) {
    try {
      const investment = await investmentsService.updateInvestment(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, investment, "Investment updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteInvestment(req: AuthRequest, res: Response) {
    try {
      await investmentsService.deleteInvestment(req.userId!, req.params.id);
      sendSuccess(res, null, "Investment deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getInvestmentSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await investmentsService.getInvestmentSummary(req.userId!);
      sendSuccess(res, summary);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // SIPs
  async getSIPs(req: AuthRequest, res: Response) {
    try {
      const isActive =
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined;
      const sips = await sipsService.getSIPs(req.userId!, isActive);
      sendSuccess(res, sips);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getSIPById(req: AuthRequest, res: Response) {
    try {
      const sip = await sipsService.getSIPById(req.userId!, req.params.id);
      sendSuccess(res, sip);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createSIP(req: AuthRequest, res: Response) {
    try {
      const sip = await sipsService.createSIP(req.userId!, req.body);
      sendSuccess(res, sip, "SIP created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateSIP(req: AuthRequest, res: Response) {
    try {
      const sip = await sipsService.updateSIP(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, sip, "SIP updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteSIP(req: AuthRequest, res: Response) {
    try {
      await sipsService.deleteSIP(req.userId!, req.params.id);
      sendSuccess(res, null, "SIP deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUpcomingSIPs(req: AuthRequest, res: Response) {
    try {
      const days = req.query.days
        ? parseInt(req.query.days as string)
        : 30;
      const sips = await sipsService.getUpcomingSIPs(req.userId!, days);
      sendSuccess(res, sips);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const investmentsController = new InvestmentsController();

