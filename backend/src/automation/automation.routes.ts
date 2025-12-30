import { Router } from "express";
import { automationController } from "./automation.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import {
  createAutomationRuleSchema,
  updateAutomationRuleSchema,
} from "./automation.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/rules",
  automationController.getAutomationRules.bind(automationController)
);

router.get(
  "/rules/:id",
  automationController.getAutomationRuleById.bind(automationController)
);

router.post(
  "/rules",
  validate(createAutomationRuleSchema),
  automationController.createAutomationRule.bind(automationController)
);

router.put(
  "/rules/:id",
  validate(updateAutomationRuleSchema),
  automationController.updateAutomationRule.bind(automationController)
);

router.put(
  "/rules/:id/toggle",
  automationController.toggleAutomationRule.bind(automationController)
);

router.delete(
  "/rules/:id",
  automationController.deleteAutomationRule.bind(automationController)
);

export default router;

