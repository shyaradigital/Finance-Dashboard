import { Router } from "express";
import { budgetsController } from "./budgets.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter, deleteRateLimiter } from "../middleware/rateLimiter";
import { createBudgetSchema, updateBudgetSchema } from "./budgets.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  readRateLimiter,
  budgetsController.getBudgets.bind(budgetsController)
);

router.get(
  "/summary",
  readRateLimiter,
  budgetsController.getBudgetSummary.bind(budgetsController)
);

router.get(
  "/:id",
  readRateLimiter,
  budgetsController.getBudgetById.bind(budgetsController)
);

router.post(
  "/",
  writeRateLimiter,
  validateApiSecret,
  validate(createBudgetSchema),
  budgetsController.createBudget.bind(budgetsController)
);

router.put(
  "/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateBudgetSchema),
  budgetsController.updateBudget.bind(budgetsController)
);

router.delete(
  "/:id",
  deleteRateLimiter,
  validateApiSecret,
  budgetsController.deleteBudget.bind(budgetsController)
);

export default router;

