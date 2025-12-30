import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { settingsService } from "./settings.service";

export class SettingsController {
  async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await settingsService.getSettings(req.userId!);
      sendSuccess(res, settings);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await settingsService.updateSettings(
        req.userId!,
        req.body
      );
      sendSuccess(res, settings, "Settings updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getOptions(req: AuthRequest, res: Response) {
    try {
      const options = await settingsService.getUserOptions(req.userId!);
      sendSuccess(res, options);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateOptions(req: AuthRequest, res: Response) {
    try {
      const options = await settingsService.updateUserOptions(
        req.userId!,
        req.body
      );
      sendSuccess(res, options.preferences, "Options updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const settingsController = new SettingsController();

