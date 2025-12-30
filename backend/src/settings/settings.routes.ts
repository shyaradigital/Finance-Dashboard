import { Router } from "express";
import { settingsController } from "./settings.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { updateSettingsSchema, userOptionsSchema } from "./settings.schemas";

const router = Router();

router.use(authenticate);

router.get("/", settingsController.getSettings.bind(settingsController));

router.put(
  "/",
  validate(updateSettingsSchema),
  settingsController.updateSettings.bind(settingsController)
);

router.get("/options", settingsController.getOptions.bind(settingsController));

router.put(
  "/options",
  validate(userOptionsSchema),
  settingsController.updateOptions.bind(settingsController)
);

export default router;

