import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { commitmentsService } from "./commitments.service";

export class CommitmentsController {
  async getCommitments(req: AuthRequest, res: Response) {
    try {
      const filters: any = {};
      if (req.query.type) filters.type = req.query.type as string;
      if (req.query.upcoming === "true") {
        filters.upcoming = true;
        filters.days = req.query.days
          ? parseInt(req.query.days as string)
          : 90;
      }

      const commitments = await commitmentsService.getCommitments(
        req.userId!,
        filters
      );
      sendSuccess(res, commitments);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCommitmentById(req: AuthRequest, res: Response) {
    try {
      const commitment = await commitmentsService.getCommitmentById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, commitment);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createCommitment(req: AuthRequest, res: Response) {
    try {
      const commitment = await commitmentsService.createCommitment(
        req.userId!,
        req.body
      );
      sendSuccess(res, commitment, "Commitment created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateCommitment(req: AuthRequest, res: Response) {
    try {
      const commitment = await commitmentsService.updateCommitment(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, commitment, "Commitment updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteCommitment(req: AuthRequest, res: Response) {
    try {
      await commitmentsService.deleteCommitment(req.userId!, req.params.id);
      sendSuccess(res, null, "Commitment deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUpcomingCommitments(req: AuthRequest, res: Response) {
    try {
      const days = req.query.days
        ? parseInt(req.query.days as string)
        : 90;
      const commitments = await commitmentsService.getUpcomingCommitments(
        req.userId!,
        days
      );
      sendSuccess(res, commitments);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const commitmentsController = new CommitmentsController();

