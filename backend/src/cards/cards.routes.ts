import { Router } from "express";
import { cardsController } from "./cards.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter, deleteRateLimiter } from "../middleware/rateLimiter";
import {
  createCreditCardSchema,
  updateCreditCardSchema,
  createDebitCardSchema,
  updateDebitCardSchema,
} from "./cards.schemas";

const router = Router();

router.use(authenticate);

// Credit Cards
router.get(
  "/credit",
  readRateLimiter,
  cardsController.getCreditCards.bind(cardsController)
);

router.get(
  "/credit/:id",
  readRateLimiter,
  cardsController.getCreditCardById.bind(cardsController)
);

router.post(
  "/credit",
  writeRateLimiter,
  validateApiSecret,
  validate(createCreditCardSchema),
  cardsController.createCreditCard.bind(cardsController)
);

router.put(
  "/credit/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateCreditCardSchema),
  cardsController.updateCreditCard.bind(cardsController)
);

router.delete(
  "/credit/:id",
  deleteRateLimiter,
  validateApiSecret,
  cardsController.deleteCreditCard.bind(cardsController)
);

router.get(
  "/credit/:id/transactions",
  readRateLimiter,
  cardsController.getCreditCardTransactions.bind(cardsController)
);

router.get(
  "/credit/:id/utilization",
  readRateLimiter,
  cardsController.getCreditCardUtilization.bind(cardsController)
);

// Debit Cards
router.get(
  "/debit",
  readRateLimiter,
  cardsController.getDebitCards.bind(cardsController)
);

router.get(
  "/debit/:id",
  readRateLimiter,
  cardsController.getDebitCardById.bind(cardsController)
);

router.post(
  "/debit",
  writeRateLimiter,
  validateApiSecret,
  validate(createDebitCardSchema),
  cardsController.createDebitCard.bind(cardsController)
);

router.put(
  "/debit/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateDebitCardSchema),
  cardsController.updateDebitCard.bind(cardsController)
);

router.delete(
  "/debit/:id",
  deleteRateLimiter,
  validateApiSecret,
  cardsController.deleteDebitCard.bind(cardsController)
);

export default router;

