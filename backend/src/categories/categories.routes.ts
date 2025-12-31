import { Router } from "express";
import { categoriesController } from "./categories.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter, deleteRateLimiter } from "../middleware/rateLimiter";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  readRateLimiter,
  categoriesController.getCategories.bind(categoriesController)
);

router.get(
  "/:id",
  readRateLimiter,
  categoriesController.getCategoryById.bind(categoriesController)
);

router.post(
  "/",
  writeRateLimiter,
  validateApiSecret,
  validate(createCategorySchema),
  categoriesController.createCategory.bind(categoriesController)
);

router.put(
  "/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateCategorySchema),
  categoriesController.updateCategory.bind(categoriesController)
);

router.delete(
  "/:id",
  deleteRateLimiter,
  validateApiSecret,
  categoriesController.deleteCategory.bind(categoriesController)
);

export default router;

