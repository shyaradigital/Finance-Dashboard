import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("Error:", err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
    sendError(res, `Validation error: ${errors.join(", ")}`, 400);
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      sendError(res, "Duplicate entry. This record already exists.", 409);
      return;
    }
    if (err.code === "P2025") {
      sendError(res, "Record not found", 404);
      return;
    }
    sendError(res, "Database error", 500);
    return;
  }

  // JWT errors
  if (err.message.includes("token")) {
    sendError(res, err.message, 401);
    return;
  }

  // Default error
  sendError(
    res,
    process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    500
  );
}

