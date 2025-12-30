import { Router } from "express";
import { accountsController } from "./accounts.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { createAccountSchema, updateAccountSchema } from "./accounts.schemas";

const router = Router();

router.use(authenticate);

router.get("/", accountsController.getAccounts.bind(accountsController));

router.get(
  "/:id",
  accountsController.getAccountById.bind(accountsController)
);

router.post(
  "/",
  validate(createAccountSchema),
  accountsController.createAccount.bind(accountsController)
);

router.put(
  "/:id",
  validate(updateAccountSchema),
  accountsController.updateAccount.bind(accountsController)
);

router.delete(
  "/:id",
  accountsController.deleteAccount.bind(accountsController)
);

router.get(
  "/:id/transactions",
  accountsController.getAccountTransactions.bind(accountsController)
);

export default router;

