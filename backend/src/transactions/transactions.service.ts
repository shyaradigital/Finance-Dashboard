import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from "./transactions.schemas";
import { calculateNextRecurringDate } from "../utils/dateHelpers";

export class TransactionsService {
  async getTransactions(
    userId: string,
    filters?: {
      type?: string;
      categoryId?: string;
      accountId?: string;
      creditCardId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: any = { userId };

    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.accountId) {
      where.accountId = filters.accountId;
    }
    if (filters?.creditCardId) {
      where.creditCardId = filters.creditCardId;
    }
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    return prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: {
          select: {
            id: true,
            name: true,
            bank: true,
          },
        },
        creditCard: {
          select: {
            id: true,
            name: true,
            bank: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        category: true,
        account: true,
        creditCard: true,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return transaction;
  }

  async createTransaction(userId: string, input: CreateTransactionInput) {
    // Verify category if provided
    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: input.categoryId,
          userId,
        },
      });
      if (!category) {
        throw new Error("Category not found");
      }
    }

    // Verify account or credit card
    if (input.accountId) {
      const account = await prisma.account.findFirst({
        where: {
          id: input.accountId,
          userId,
        },
      });
      if (!account) {
        throw new Error("Account not found");
      }
    }

    if (input.creditCardId) {
      const card = await prisma.creditCard.findFirst({
        where: {
          id: input.creditCardId,
          userId,
        },
      });
      if (!card) {
        throw new Error("Credit card not found");
      }
    }

    const date = typeof input.date === "string" ? new Date(input.date) : input.date;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        ...input,
        date,
        amount: new Prisma.Decimal(input.amount),
      },
      include: {
        category: true,
        account: true,
        creditCard: true,
      },
    });

    // Update account balance or credit card used amount
    await this.updateAccountOrCardBalance(transaction, "create");

    return transaction;
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    input: UpdateTransactionInput
  ) {
    // Get existing transaction
    const existing = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    // Revert old balance change
    await this.updateAccountOrCardBalance(existing, "delete");

    // Verify new category if provided
    if (input.categoryId !== undefined && input.categoryId !== null) {
      const category = await prisma.category.findFirst({
        where: {
          id: input.categoryId,
          userId,
        },
      });
      if (!category) {
        throw new Error("Category not found");
      }
    }

    // Verify new account or credit card
    if (input.accountId !== undefined) {
      if (input.accountId) {
        const account = await prisma.account.findFirst({
          where: {
            id: input.accountId,
            userId,
          },
        });
        if (!account) {
          throw new Error("Account not found");
        }
      }
      // If setting to null, ensure creditCardId is provided
      if (!input.accountId && !input.creditCardId && !existing.creditCardId) {
        throw new Error("Either accountId or creditCardId must be provided");
      }
    }

    if (input.creditCardId !== undefined) {
      if (input.creditCardId) {
        const card = await prisma.creditCard.findFirst({
          where: {
            id: input.creditCardId,
            userId,
          },
        });
        if (!card) {
          throw new Error("Credit card not found");
        }
      }
      // If setting to null, ensure accountId is provided
      if (!input.creditCardId && !input.accountId && !existing.accountId) {
        throw new Error("Either accountId or creditCardId must be provided");
      }
    }

    const updateData: any = { ...input };
    if (input.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(input.amount);
    }
    if (input.date !== undefined) {
      updateData.date = typeof input.date === "string" ? new Date(input.date) : input.date;
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        category: true,
        account: true,
        creditCard: true,
      },
    });

    // Apply new balance change
    await this.updateAccountOrCardBalance(transaction, "create");

    return transaction;
  }

  async deleteTransaction(userId: string, transactionId: string) {
    // Get transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    // Revert balance change
    await this.updateAccountOrCardBalance(transaction, "delete");
  }

  private async updateAccountOrCardBalance(
    transaction: any,
    operation: "create" | "delete"
  ) {
    const amount = Number(transaction.amount);
    const isIncome = transaction.type === "income";
    const multiplier = operation === "create" ? 1 : -1;
    const adjustment = isIncome ? amount * multiplier : -amount * multiplier;

    if (transaction.accountId) {
      // Update account balance
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: {
            increment: new Prisma.Decimal(adjustment),
          },
        },
      });
    } else if (transaction.creditCardId) {
      // Update credit card used amount (expenses increase used, income decreases it)
      if (!isIncome) {
        // Expense increases used amount
        await prisma.creditCard.update({
          where: { id: transaction.creditCardId },
          data: {
            used: {
              increment: new Prisma.Decimal(amount * multiplier),
            },
          },
        });
      }
      // Income doesn't affect credit card used amount
    }
  }

  // Recurring Transactions
  async getRecurringTransactions(userId: string, isActive?: boolean) {
    const where: any = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return prisma.recurringTransaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { nextDate: "asc" },
    });
  }

  async getRecurringTransactionById(userId: string, recurringId: string) {
    const recurring = await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringId,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!recurring) {
      throw new Error("Recurring transaction not found");
    }

    return recurring;
  }

  async createRecurringTransaction(
    userId: string,
    input: CreateRecurringTransactionInput
  ) {
    // Verify category if provided
    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: input.categoryId,
          userId,
        },
      });
      if (!category) {
        throw new Error("Category not found");
      }
    }

    // Verify account or credit card
    if (input.accountId) {
      const account = await prisma.account.findFirst({
        where: {
          id: input.accountId,
          userId,
        },
      });
      if (!account) {
        throw new Error("Account not found");
      }
    }

    if (input.creditCardId) {
      const card = await prisma.creditCard.findFirst({
        where: {
          id: input.creditCardId,
          userId,
        },
      });
      if (!card) {
        throw new Error("Credit card not found");
      }
    }

    const startDate =
      typeof input.startDate === "string"
        ? new Date(input.startDate)
        : input.startDate;

    const nextDate = calculateNextRecurringDate(
      startDate,
      input.frequency,
      input.customDays
    );

    const recurring = await prisma.recurringTransaction.create({
      data: {
        userId,
        ...input,
        startDate,
        nextDate,
        amount: new Prisma.Decimal(input.amount),
      },
      include: {
        category: true,
      },
    });

    return recurring;
  }

  async updateRecurringTransaction(
    userId: string,
    recurringId: string,
    input: UpdateRecurringTransactionInput
  ) {
    // Get existing
    const existing = await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringId,
        userId,
      },
    });

    if (!existing) {
      throw new Error("Recurring transaction not found");
    }

    const updateData: any = { ...input };
    if (input.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(input.amount);
    }
    if (input.startDate !== undefined) {
      updateData.startDate =
        typeof input.startDate === "string"
          ? new Date(input.startDate)
          : input.startDate;
    }

    // Recalculate nextDate if frequency or startDate changed
    if (input.frequency || input.startDate || input.customDays !== undefined) {
      const frequency = input.frequency || existing.frequency;
      const startDate = updateData.startDate || existing.startDate;
      const customDays = input.customDays !== undefined ? input.customDays : existing.customDays;
      updateData.nextDate = calculateNextRecurringDate(
        startDate,
        frequency,
        customDays || undefined
      );
    }

    return prisma.recurringTransaction.update({
      where: { id: recurringId },
      data: updateData,
      include: {
        category: true,
      },
    });
  }

  async deleteRecurringTransaction(userId: string, recurringId: string) {
    const recurring = await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringId,
        userId,
      },
    });

    if (!recurring) {
      throw new Error("Recurring transaction not found");
    }

    await prisma.recurringTransaction.delete({
      where: { id: recurringId },
    });
  }
}

export const transactionsService = new TransactionsService();

