import { Router } from "express";
import { transactionsController } from "./transactions.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import {
  createTransactionSchema,
  updateTransactionSchema,
  createRecurringTransactionSchema,
  updateRecurringTransactionSchema,
} from "./transactions.schemas";

const router = Router();

router.use(authenticate);

// Regular Transactions
router.get(
  "/",
  transactionsController.getTransactions.bind(transactionsController)
);

router.get(
  "/:id",
  transactionsController.getTransactionById.bind(transactionsController)
);

router.post(
  "/",
  validate(createTransactionSchema),
  transactionsController.createTransaction.bind(transactionsController)
);

router.put(
  "/:id",
  validate(updateTransactionSchema),
  transactionsController.updateTransaction.bind(transactionsController)
);

router.delete(
  "/:id",
  transactionsController.deleteTransaction.bind(transactionsController)
);

// Recurring Transactions
router.get(
  "/recurring",
  transactionsController.getRecurringTransactions.bind(transactionsController)
);

router.get(
  "/recurring/:id",
  transactionsController.getRecurringTransactionById.bind(transactionsController)
);

router.post(
  "/recurring",
  validate(createRecurringTransactionSchema),
  transactionsController.createRecurringTransaction.bind(transactionsController)
);

router.put(
  "/recurring/:id",
  validate(updateRecurringTransactionSchema),
  transactionsController.updateRecurringTransaction.bind(transactionsController)
);

router.delete(
  "/recurring/:id",
  transactionsController.deleteRecurringTransaction.bind(transactionsController)
);

export default router;

