import { Router } from "express";
import { settingsController } from "./settings.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter } from "../middleware/rateLimiter";
import { updateSettingsSchema, userOptionsSchema } from "./settings.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  readRateLimiter,
  settingsController.getSettings.bind(settingsController)
);

router.put(
  "/",
  writeRateLimiter,
  validateApiSecret,
  validate(updateSettingsSchema),
  settingsController.updateSettings.bind(settingsController)
);

router.get(
  "/options",
  readRateLimiter,
  settingsController.getOptions.bind(settingsController)
);

router.put(
  "/options",
  writeRateLimiter,
  validateApiSecret,
  validate(userOptionsSchema),
  settingsController.updateOptions.bind(settingsController)
);

export default router;

