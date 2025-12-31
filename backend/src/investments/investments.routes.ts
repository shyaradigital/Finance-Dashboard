import { Router } from "express";
import { investmentsController } from "./investments.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter, deleteRateLimiter } from "../middleware/rateLimiter";
import {
  createInvestmentSchema,
  updateInvestmentSchema,
  createSIPSchema,
  updateSIPSchema,
} from "./investments.schemas";

const router = Router();

router.use(authenticate);

// SIPs routes must come BEFORE /:id route to avoid route conflicts
router.get(
  "/sips",
  readRateLimiter,
  investmentsController.getSIPs.bind(investmentsController)
);

router.get(
  "/sips/upcoming",
  readRateLimiter,
  investmentsController.getUpcomingSIPs.bind(investmentsController)
);

router.get(
  "/sips/:id",
  readRateLimiter,
  investmentsController.getSIPById.bind(investmentsController)
);

router.post(
  "/sips",
  writeRateLimiter,
  validateApiSecret,
  validate(createSIPSchema),
  investmentsController.createSIP.bind(investmentsController)
);

router.put(
  "/sips/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateSIPSchema),
  investmentsController.updateSIP.bind(investmentsController)
);

router.delete(
  "/sips/:id",
  deleteRateLimiter,
  validateApiSecret,
  investmentsController.deleteSIP.bind(investmentsController)
);

// Investments routes
router.get(
  "/",
  readRateLimiter,
  investmentsController.getInvestments.bind(investmentsController)
);

router.get(
  "/summary",
  readRateLimiter,
  investmentsController.getInvestmentSummary.bind(investmentsController)
);

router.get(
  "/:id",
  readRateLimiter,
  investmentsController.getInvestmentById.bind(investmentsController)
);

router.post(
  "/",
  writeRateLimiter,
  validateApiSecret,
  validate(createInvestmentSchema),
  investmentsController.createInvestment.bind(investmentsController)
);

router.put(
  "/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateInvestmentSchema),
  investmentsController.updateInvestment.bind(investmentsController)
);

router.delete(
  "/:id",
  deleteRateLimiter,
  validateApiSecret,
  investmentsController.deleteInvestment.bind(investmentsController)
);

export default router;

