import { Router } from "express";
import { accountsController } from "./accounts.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter, deleteRateLimiter } from "../middleware/rateLimiter";
import { createAccountSchema, updateAccountSchema } from "./accounts.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  readRateLimiter,
  accountsController.getAccounts.bind(accountsController)
);

router.get(
  "/:id",
  readRateLimiter,
  accountsController.getAccountById.bind(accountsController)
);

router.post(
  "/",
  writeRateLimiter,
  validateApiSecret,
  validate(createAccountSchema),
  accountsController.createAccount.bind(accountsController)
);

router.put(
  "/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateAccountSchema),
  accountsController.updateAccount.bind(accountsController)
);

router.delete(
  "/:id",
  deleteRateLimiter,
  validateApiSecret,
  accountsController.deleteAccount.bind(accountsController)
);

router.get(
  "/:id/transactions",
  readRateLimiter,
  accountsController.getAccountTransactions.bind(accountsController)
);

export default router;

