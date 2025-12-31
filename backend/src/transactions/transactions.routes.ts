import { Router } from "express";
import { transactionsController } from "./transactions.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter, deleteRateLimiter } from "../middleware/rateLimiter";
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
  readRateLimiter,
  transactionsController.getTransactions.bind(transactionsController)
);

router.get(
  "/:id",
  readRateLimiter,
  transactionsController.getTransactionById.bind(transactionsController)
);

router.post(
  "/",
  writeRateLimiter,
  validateApiSecret,
  validate(createTransactionSchema),
  transactionsController.createTransaction.bind(transactionsController)
);

router.put(
  "/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateTransactionSchema),
  transactionsController.updateTransaction.bind(transactionsController)
);

router.delete(
  "/:id",
  deleteRateLimiter,
  validateApiSecret,
  transactionsController.deleteTransaction.bind(transactionsController)
);

// Recurring Transactions
router.get(
  "/recurring",
  readRateLimiter,
  transactionsController.getRecurringTransactions.bind(transactionsController)
);

router.get(
  "/recurring/:id",
  readRateLimiter,
  transactionsController.getRecurringTransactionById.bind(transactionsController)
);

router.post(
  "/recurring",
  writeRateLimiter,
  validateApiSecret,
  validate(createRecurringTransactionSchema),
  transactionsController.createRecurringTransaction.bind(transactionsController)
);

router.put(
  "/recurring/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateRecurringTransactionSchema),
  transactionsController.updateRecurringTransaction.bind(transactionsController)
);

router.delete(
  "/recurring/:id",
  deleteRateLimiter,
  validateApiSecret,
  transactionsController.deleteRecurringTransaction.bind(transactionsController)
);

export default router;

