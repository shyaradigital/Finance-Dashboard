import { Router } from "express";
import { vaultController } from "./vault.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import {
  createVaultItemSchema,
  updateVaultItemSchema,
} from "./vault.schemas";

const router = Router();

router.use(authenticate);

router.get("/", vaultController.getVaultItems.bind(vaultController));

router.get(
  "/:id",
  vaultController.getVaultItemById.bind(vaultController)
);

router.post(
  "/",
  validate(createVaultItemSchema),
  vaultController.createVaultItem.bind(vaultController)
);

router.put(
  "/:id",
  validate(updateVaultItemSchema),
  vaultController.updateVaultItem.bind(vaultController)
);

router.delete(
  "/:id",
  vaultController.deleteVaultItem.bind(vaultController)
);

export default router;

