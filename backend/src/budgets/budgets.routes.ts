import { Router } from "express";
import { budgetsController } from "./budgets.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { createBudgetSchema, updateBudgetSchema } from "./budgets.schemas";

const router = Router();

router.use(authenticate);

router.get("/", budgetsController.getBudgets.bind(budgetsController));

router.get(
  "/summary",
  budgetsController.getBudgetSummary.bind(budgetsController)
);

router.get(
  "/:id",
  budgetsController.getBudgetById.bind(budgetsController)
);

router.post(
  "/",
  validate(createBudgetSchema),
  budgetsController.createBudget.bind(budgetsController)
);

router.put(
  "/:id",
  validate(updateBudgetSchema),
  budgetsController.updateBudget.bind(budgetsController)
);

router.delete(
  "/:id",
  budgetsController.deleteBudget.bind(budgetsController)
);

export default router;

