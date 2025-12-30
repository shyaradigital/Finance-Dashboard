import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import { CreateBudgetInput, UpdateBudgetInput } from "./budgets.schemas";
import { getStartOfMonth, getEndOfMonth } from "../utils/dateHelpers";

export class BudgetsService {
  async getBudgets(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate spent amount for current month for each budget
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: "expense",
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spentAmount = spent._sum.amount || new Prisma.Decimal(0);
        const limit = Number(budget.monthlyLimit);
        const spentNum = Number(spentAmount);
        const percentage = limit > 0 ? (spentNum / limit) * 100 : 0;

        return {
          ...budget,
          spent: spentNum,
          percentage: Number(percentage.toFixed(2)),
          remaining: limit - spentNum,
          isOverBudget: spentNum > limit,
          isNearLimit:
            budget.alertThreshold !== null &&
            percentage >= Number(budget.alertThreshold || 80),
        };
      })
    );

    return budgetsWithSpent;
  }

  async getBudgetById(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      throw new Error("Budget not found");
    }

    // Calculate spent amount
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    const spent = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: budget.categoryId,
        type: "expense",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const spentAmount = spent._sum.amount || new Prisma.Decimal(0);
    const limit = Number(budget.monthlyLimit);
    const spentNum = Number(spentAmount);
    const percentage = limit > 0 ? (spentNum / limit) * 100 : 0;

    return {
      ...budget,
      spent: spentNum,
      percentage: Number(percentage.toFixed(2)),
      remaining: limit - spentNum,
      isOverBudget: spentNum > limit,
      isNearLimit:
        budget.alertThreshold !== null &&
        percentage >= Number(budget.alertThreshold || 80),
    };
  }

  async createBudget(userId: string, input: CreateBudgetInput) {
    // Verify category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: input.categoryId,
        userId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Check if budget already exists for this category
    const existing = await prisma.budget.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId: input.categoryId,
        },
      },
    });

    if (existing) {
      throw new Error("Budget already exists for this category");
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        ...input,
        monthlyLimit: new Prisma.Decimal(input.monthlyLimit),
        ...(input.alertThreshold !== undefined && {
          alertThreshold: new Prisma.Decimal(input.alertThreshold),
        }),
      },
      include: {
        category: true,
      },
    });

    return {
      ...budget,
      spent: 0,
      percentage: 0,
      remaining: Number(budget.monthlyLimit),
      isOverBudget: false,
      isNearLimit: false,
    };
  }

  async updateBudget(userId: string, budgetId: string, input: UpdateBudgetInput) {
    // Check if budget exists and belongs to user
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!budget) {
      throw new Error("Budget not found");
    }

    const updateData: any = {};
    if (input.monthlyLimit !== undefined) {
      updateData.monthlyLimit = new Prisma.Decimal(input.monthlyLimit);
    }
    if (input.alertThreshold !== undefined) {
      updateData.alertThreshold = input.alertThreshold
        ? new Prisma.Decimal(input.alertThreshold)
        : null;
    }

    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data: updateData,
      include: {
        category: true,
      },
    });

    // Calculate spent amount
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    const spent = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: updated.categoryId,
        type: "expense",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const spentAmount = spent._sum.amount || new Prisma.Decimal(0);
    const limit = Number(updated.monthlyLimit);
    const spentNum = Number(spentAmount);
    const percentage = limit > 0 ? (spentNum / limit) * 100 : 0;

    return {
      ...updated,
      spent: spentNum,
      percentage: Number(percentage.toFixed(2)),
      remaining: limit - spentNum,
      isOverBudget: spentNum > limit,
      isNearLimit:
        updated.alertThreshold !== null &&
        percentage >= Number(updated.alertThreshold || 80),
    };
  }

  async deleteBudget(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!budget) {
      throw new Error("Budget not found");
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });
  }

  async getBudgetSummary(userId: string) {
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
    });

    const summary = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: "expense",
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spentAmount = spent._sum.amount || new Prisma.Decimal(0);
        const limit = Number(budget.monthlyLimit);
        const spentNum = Number(spentAmount);

        return {
          categoryId: budget.categoryId,
          categoryName: budget.category.name,
          limit,
          spent: spentNum,
          remaining: limit - spentNum,
          percentage: limit > 0 ? (spentNum / limit) * 100 : 0,
        };
      })
    );

    const totalLimit = summary.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = summary.reduce((sum, b) => sum + b.spent, 0);

    return {
      budgets: summary,
      totals: {
        limit: totalLimit,
        spent: totalSpent,
        remaining: totalLimit - totalSpent,
        percentage: totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0,
      },
    };
  }
}

export const budgetsService = new BudgetsService();

