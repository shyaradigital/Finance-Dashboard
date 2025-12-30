import prisma from "../config/database";
import { CreateCategoryInput, UpdateCategoryInput } from "./categories.schemas";

export class CategoriesService {
  async getCategories(userId: string, type?: string) {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Get transaction counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.transaction.count({
          where: { categoryId: category.id },
        });
        return {
          ...category,
          count,
        };
      })
    );

    return categoriesWithCounts;
  }

  async getCategoryById(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const count = await prisma.transaction.count({
      where: { categoryId: category.id },
    });

    return {
      ...category,
      count,
    };
  }

  async createCategory(userId: string, input: CreateCategoryInput) {
    // Check if category with same name and type already exists
    const existing = await prisma.category.findFirst({
      where: {
        userId,
        name: input.name,
        type: input.type,
      },
    });

    if (existing) {
      throw new Error("Category with this name and type already exists");
    }

    const category = await prisma.category.create({
      data: {
        userId,
        ...input,
      },
    });

    return {
      ...category,
      count: 0,
    };
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    input: UpdateCategoryInput
  ) {
    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Check for duplicate name if name is being updated
    if (input.name && input.name !== category.name) {
      const existing = await prisma.category.findFirst({
        where: {
          userId,
          name: input.name,
          type: input.type || category.type,
          NOT: { id: categoryId },
        },
      });

      if (existing) {
        throw new Error("Category with this name and type already exists");
      }
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: input,
    });

    const count = await prisma.transaction.count({
      where: { categoryId: updated.id },
    });

    return {
      ...updated,
      count,
    };
  }

  async deleteCategory(userId: string, categoryId: string) {
    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Check if category has transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId },
    });

    if (transactionCount > 0) {
      throw new Error(
        "Cannot delete category with existing transactions. Please reassign or delete transactions first."
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });
  }
}

export const categoriesService = new CategoriesService();

