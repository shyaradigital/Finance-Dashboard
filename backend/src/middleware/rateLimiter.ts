import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Helper to send JSON error response
const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: "Too many requests, please try again later.",
    retryAfter: res.getHeader("Retry-After") || "60",
  });
};

// Auth rate limiter - strict for login/signup
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Read operations rate limiter (GET requests)
export const readRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 read requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    return req.path === '/health';
  },
});

// Write operations rate limiter (POST, PUT, PATCH)
export const writeRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 write requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    return req.path === '/health';
  },
});

// Delete operations rate limiter (DELETE requests)
export const deleteRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 delete requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    return req.path === '/health';
  },
});

// General rate limiter (fallback for routes without specific limiter)
export const generalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Reduced from 200 to be more conservative
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    return req.path === '/health';
  },
});

