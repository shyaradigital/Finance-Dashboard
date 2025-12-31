import { Request, Response, NextFunction } from "express";
import env from "../config/env";

/**
 * Custom CORS middleware with strict origin validation
 * Supports multiple allowed origins from FRONTEND_URL environment variable
 */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const origin = req.headers.origin;
  
  // Get allowed origins (always an array after transform)
  const allowedOrigins = env.FRONTEND_URL;

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    if (origin && isOriginAllowed(origin, allowedOrigins)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Secret");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
      res.status(204).end();
      return;
    } else {
      res.status(403).json({
        success: false,
        error: "Origin not allowed",
      });
      return;
    }
  }

  // Handle actual requests
  if (origin) {
    // Origin provided - validate it
    if (isOriginAllowed(origin, allowedOrigins)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Expose-Headers", "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset");
    } else {
      // Origin provided but not allowed
      res.status(403).json({
        success: false,
        error: "Origin not allowed",
      });
      return;
    }
  }
  // If no origin header (same-origin request or server-to-server), allow it
  // This is correct behavior - CORS only applies to cross-origin requests

  next();
}

/**
 * Validate if origin is in the allowed list
 */
function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  // Normalize origins (remove trailing slashes)
  const normalizedOrigin = origin.replace(/\/$/, "");
  
  return allowedOrigins.some((allowed) => {
    const normalizedAllowed = allowed.replace(/\/$/, "");
    return normalizedOrigin === normalizedAllowed;
  });
}

