import { Router } from "express";
import { vaultController } from "./vault.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter, deleteRateLimiter } from "../middleware/rateLimiter";
import {
  createVaultItemSchema,
  updateVaultItemSchema,
} from "./vault.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  readRateLimiter,
  vaultController.getVaultItems.bind(vaultController)
);

router.get(
  "/:id",
  readRateLimiter,
  vaultController.getVaultItemById.bind(vaultController)
);

router.post(
  "/",
  writeRateLimiter,
  validateApiSecret,
  validate(createVaultItemSchema),
  vaultController.createVaultItem.bind(vaultController)
);

router.put(
  "/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateVaultItemSchema),
  vaultController.updateVaultItem.bind(vaultController)
);

router.delete(
  "/:id",
  deleteRateLimiter,
  validateApiSecret,
  vaultController.deleteVaultItem.bind(vaultController)
);

export default router;

