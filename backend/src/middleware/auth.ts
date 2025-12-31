import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/response";
import env from "../config/env";

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "No token provided", 401);
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.userId = payload.userId;
    req.userEmail = payload.email;

    next();
  } catch (error) {
    sendError(res, "Invalid or expired token", 401);
  }
}

/**
 * Middleware to validate API secret token for sensitive operations
 * Requires X-API-Secret header to match API_SECRET environment variable
 */
export function validateApiSecret(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // API_SECRET is optional - if not set, skip validation
    if (!env.API_SECRET) {
      next();
      return;
    }

    // Express normalizes headers to lowercase
    const apiSecret = req.headers["x-api-secret"] as string;

    if (!apiSecret) {
      sendError(res, "API secret token required", 401);
      return;
    }

    if (apiSecret !== env.API_SECRET) {
      sendError(res, "Invalid API secret token", 401);
      return;
    }

    next();
  } catch (error) {
    sendError(res, "API secret validation failed", 401);
  }
}

