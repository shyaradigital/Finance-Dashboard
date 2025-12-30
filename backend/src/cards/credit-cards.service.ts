import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import {
  CreateCreditCardInput,
  UpdateCreditCardInput,
} from "./cards.schemas";

export class CreditCardsService {
  async getCreditCards(userId: string) {
    return prisma.creditCard.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCreditCardById(userId: string, cardId: string) {
    const card = await prisma.creditCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error("Credit card not found");
    }

    return card;
  }

  async createCreditCard(userId: string, input: CreateCreditCardInput) {
    // Always start with 0 used amount, regardless of input
    const card = await prisma.creditCard.create({
      data: {
        userId,
        name: input.name,
        bank: input.bank,
        lastFour: input.lastFour,
        limit: new Prisma.Decimal(input.limit),
        used: new Prisma.Decimal(0), // Always start at 0
        dueDate: input.dueDate,
        minDue: input.minDue ? new Prisma.Decimal(input.minDue) : null,
        billingCycleStart: input.billingCycleStart || null,
        color: input.color,
      },
    });

    return card;
  }

  async updateCreditCard(
    userId: string,
    cardId: string,
    input: UpdateCreditCardInput
  ) {
    // Check if card exists and belongs to user
    const card = await prisma.creditCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error("Credit card not found");
    }

    const updateData: any = { ...input };
    if (input.limit !== undefined) {
      updateData.limit = new Prisma.Decimal(input.limit);
    }
    if (input.used !== undefined) {
      updateData.used = new Prisma.Decimal(input.used);
    }
    if (input.minDue !== undefined) {
      updateData.minDue = input.minDue
        ? new Prisma.Decimal(input.minDue)
        : null;
    }

    return prisma.creditCard.update({
      where: { id: cardId },
      data: updateData,
    });
  }

  async deleteCreditCard(userId: string, cardId: string) {
    // Check if card exists and belongs to user
    const card = await prisma.creditCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error("Credit card not found");
    }

    // Check if card has transactions
    const transactionCount = await prisma.transaction.count({
      where: { creditCardId: cardId },
    });

    if (transactionCount > 0) {
      throw new Error(
        "Cannot delete credit card with existing transactions. Please delete or reassign transactions first."
      );
    }

    await prisma.creditCard.delete({
      where: { id: cardId },
    });
  }

  async getCardTransactions(userId: string, cardId: string) {
    // Verify card belongs to user
    const card = await prisma.creditCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error("Credit card not found");
    }

    return prisma.transaction.findMany({
      where: {
        creditCardId: cardId,
        userId,
      },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    });
  }

  async getCardUtilization(userId: string, cardId: string) {
    const card = await this.getCreditCardById(userId, cardId);

    const limit = Number(card.limit);
    const used = Number(card.used);
    const available = limit - used;
    const utilizationPercent = limit > 0 ? (used / limit) * 100 : 0;

    return {
      limit,
      used,
      available,
      utilizationPercent: Number(utilizationPercent.toFixed(2)),
    };
  }
}

export const creditCardsService = new CreditCardsService();

