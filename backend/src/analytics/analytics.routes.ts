import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get(
  "/dashboard",
  analyticsController.getDashboardSummary.bind(analyticsController)
);

router.get(
  "/cash-flow",
  analyticsController.getCashFlow.bind(analyticsController)
);

router.get(
  "/category-spend",
  analyticsController.getCategorySpend.bind(analyticsController)
);

router.get(
  "/spend-type",
  analyticsController.getSpendType.bind(analyticsController)
);

router.get(
  "/insights",
  analyticsController.getInsights.bind(analyticsController)
);

router.get(
  "/net-worth",
  analyticsController.getNetWorth.bind(analyticsController)
);

export default router;

