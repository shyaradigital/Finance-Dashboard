import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { categoriesService } from "./categories.service";

export class CategoriesController {
  async getCategories(req: AuthRequest, res: Response) {
    try {
      const type = req.query.type as string | undefined;
      const categories = await categoriesService.getCategories(
        req.userId!,
        type
      );
      sendSuccess(res, categories);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCategoryById(req: AuthRequest, res: Response) {
    try {
      const category = await categoriesService.getCategoryById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, category);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createCategory(req: AuthRequest, res: Response) {
    try {
      const category = await categoriesService.createCategory(
        req.userId!,
        req.body
      );
      sendSuccess(res, category, "Category created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const category = await categoriesService.updateCategory(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, category, "Category updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      await categoriesService.deleteCategory(req.userId!, req.params.id);
      sendSuccess(res, null, "Category deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const categoriesController = new CategoriesController();

