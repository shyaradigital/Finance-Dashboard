import { Router } from "express";
import { categoriesController } from "./categories.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schemas";

const router = Router();

router.use(authenticate);

router.get("/", categoriesController.getCategories.bind(categoriesController));

router.get(
  "/:id",
  categoriesController.getCategoryById.bind(categoriesController)
);

router.post(
  "/",
  validate(createCategorySchema),
  categoriesController.createCategory.bind(categoriesController)
);

router.put(
  "/:id",
  validate(updateCategorySchema),
  categoriesController.updateCategory.bind(categoriesController)
);

router.delete(
  "/:id",
  categoriesController.deleteCategory.bind(categoriesController)
);

export default router;

