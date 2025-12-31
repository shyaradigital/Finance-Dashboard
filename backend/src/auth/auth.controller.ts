import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { authService } from "./auth.service";

export class AuthController {
  async signup(req: AuthRequest, res: Response) {
    try {
      const result = await authService.signup(req.body);
      sendSuccess(res, result, "User registered successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, "Login successful");
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async refresh(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, "Token refreshed");
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      // If refreshToken is provided in body, delete that specific token
      // Otherwise, delete all refresh tokens for the authenticated user
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      } else {
        await authService.logoutAll(req.userId!);
      }
      sendSuccess(res, null, "Logged out successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getCurrentUser(req.userId!);
      sendSuccess(res, user);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const user = await authService.updateProfile(req.userId!, req.body);
      sendSuccess(res, user, "Profile updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      await authService.changePassword(req.userId!, req.body);
      sendSuccess(res, null, "Password changed successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      await authService.deleteAccount(req.userId!);
      sendSuccess(res, null, "Account deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const authController = new AuthController();

