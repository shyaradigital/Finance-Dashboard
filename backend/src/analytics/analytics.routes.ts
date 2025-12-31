import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { authenticate } from "../middleware/auth";
import { readRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.use(authenticate);

router.get(
  "/dashboard",
  readRateLimiter,
  analyticsController.getDashboardSummary.bind(analyticsController)
);

router.get(
  "/cash-flow",
  readRateLimiter,
  analyticsController.getCashFlow.bind(analyticsController)
);

router.get(
  "/category-spend",
  readRateLimiter,
  analyticsController.getCategorySpend.bind(analyticsController)
);

router.get(
  "/spend-type",
  readRateLimiter,
  analyticsController.getSpendType.bind(analyticsController)
);

router.get(
  "/insights",
  readRateLimiter,
  analyticsController.getInsights.bind(analyticsController)
);

router.get(
  "/net-worth",
  readRateLimiter,
  analyticsController.getNetWorth.bind(analyticsController)
);

export default router;

