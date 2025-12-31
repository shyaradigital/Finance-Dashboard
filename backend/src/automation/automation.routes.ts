import { Router } from "express";
import { automationController } from "./automation.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter, deleteRateLimiter } from "../middleware/rateLimiter";
import {
  createAutomationRuleSchema,
  updateAutomationRuleSchema,
} from "./automation.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/rules",
  readRateLimiter,
  automationController.getAutomationRules.bind(automationController)
);

router.get(
  "/rules/:id",
  readRateLimiter,
  automationController.getAutomationRuleById.bind(automationController)
);

router.post(
  "/rules",
  writeRateLimiter,
  validateApiSecret,
  validate(createAutomationRuleSchema),
  automationController.createAutomationRule.bind(automationController)
);

router.put(
  "/rules/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateAutomationRuleSchema),
  automationController.updateAutomationRule.bind(automationController)
);

router.put(
  "/rules/:id/toggle",
  writeRateLimiter,
  validateApiSecret,
  automationController.toggleAutomationRule.bind(automationController)
);

router.delete(
  "/rules/:id",
  deleteRateLimiter,
  validateApiSecret,
  automationController.deleteAutomationRule.bind(automationController)
);

export default router;

