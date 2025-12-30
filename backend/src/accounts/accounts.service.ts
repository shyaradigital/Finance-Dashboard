import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import { CreateAccountInput, UpdateAccountInput } from "./accounts.schemas";

export class AccountsService {
  async getAccounts(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAccountById(userId: string, accountId: string) {
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    return account;
  }

  async createAccount(userId: string, input: CreateAccountInput) {
    const account = await prisma.account.create({
      data: {
        userId,
        name: input.name,
        bank: input.bank,
        type: input.type,
        accountNumber: input.accountNumber,
        color: input.color,
        balance: input.balance !== undefined 
          ? new Prisma.Decimal(input.balance) 
          : new Prisma.Decimal(0), // Use provided balance or default to 0
      },
    });

    return account;
  }

  async updateAccount(
    userId: string,
    accountId: string,
    input: UpdateAccountInput
  ) {
    // Check if account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const updateData: any = { ...input };
    if (input.balance !== undefined) {
      updateData.balance = new Prisma.Decimal(input.balance);
    }

    return prisma.account.update({
      where: { id: accountId },
      data: updateData,
    });
  }

  async deleteAccount(userId: string, accountId: string) {
    // Check if account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: { accountId },
    });

    if (transactionCount > 0) {
      throw new Error(
        "Cannot delete account with existing transactions. Please delete or reassign transactions first."
      );
    }

    // Check if account has linked debit cards
    const debitCardCount = await prisma.debitCard.count({
      where: { linkedAccountId: accountId },
    });

    if (debitCardCount > 0) {
      throw new Error(
        "Cannot delete account with linked debit cards. Please delete debit cards first."
      );
    }

    await prisma.account.delete({
      where: { id: accountId },
    });
  }

  async getAccountTransactions(userId: string, accountId: string) {
    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    return prisma.transaction.findMany({
      where: {
        accountId,
        userId,
      },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    });
  }
}

export const accountsService = new AccountsService();

