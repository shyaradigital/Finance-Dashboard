import { Router } from "express";
import { investmentsController } from "./investments.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
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
  investmentsController.getSIPs.bind(investmentsController)
);

router.get(
  "/sips/upcoming",
  investmentsController.getUpcomingSIPs.bind(investmentsController)
);

router.get(
  "/sips/:id",
  investmentsController.getSIPById.bind(investmentsController)
);

router.post(
  "/sips",
  validate(createSIPSchema),
  investmentsController.createSIP.bind(investmentsController)
);

router.put(
  "/sips/:id",
  validate(updateSIPSchema),
  investmentsController.updateSIP.bind(investmentsController)
);

router.delete(
  "/sips/:id",
  investmentsController.deleteSIP.bind(investmentsController)
);

// Investments routes
router.get(
  "/",
  investmentsController.getInvestments.bind(investmentsController)
);

router.get(
  "/summary",
  investmentsController.getInvestmentSummary.bind(investmentsController)
);

router.get(
  "/:id",
  investmentsController.getInvestmentById.bind(investmentsController)
);

router.post(
  "/",
  validate(createInvestmentSchema),
  investmentsController.createInvestment.bind(investmentsController)
);

router.put(
  "/:id",
  validate(updateInvestmentSchema),
  investmentsController.updateInvestment.bind(investmentsController)
);

router.delete(
  "/:id",
  investmentsController.deleteInvestment.bind(investmentsController)
);

export default router;

