import prisma from "../config/database";
import {
  CreateDebitCardInput,
  UpdateDebitCardInput,
} from "./cards.schemas";

export class DebitCardsService {
  async getDebitCards(userId: string) {
    return prisma.debitCard.findMany({
      where: { userId },
      include: {
        linkedAccount: {
          select: {
            id: true,
            name: true,
            bank: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getDebitCardById(userId: string, cardId: string) {
    const card = await prisma.debitCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
      include: {
        linkedAccount: {
          select: {
            id: true,
            name: true,
            bank: true,
            balance: true,
          },
        },
      },
    });

    if (!card) {
      throw new Error("Debit card not found");
    }

    return card;
  }

  async createDebitCard(userId: string, input: CreateDebitCardInput) {
    let linkedAccountId = input.linkedAccountId;
    
    // If linkedAccount name is provided instead of ID, find the account
    if (!linkedAccountId && input.linkedAccount) {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          OR: [
            { name: { contains: input.linkedAccount, mode: 'insensitive' } },
            { 
              AND: [
                { bank: { contains: input.linkedAccount.split(' ')[0] || '', mode: 'insensitive' } },
                { name: { contains: input.linkedAccount.split(' ').slice(1).join(' ') || '', mode: 'insensitive' } }
              ]
            }
          ]
        },
      });
      
      if (account) {
        linkedAccountId = account.id;
      }
    }
    
    // Verify linked account exists and belongs to user
    if (linkedAccountId) {
      const account = await prisma.account.findFirst({
        where: {
          id: linkedAccountId,
          userId,
        },
      });

      if (!account) {
        throw new Error("Linked account not found");
      }
    } else {
      // If no account found, use the first account or throw error
      const firstAccount = await prisma.account.findFirst({
        where: { userId },
      });
      
      if (!firstAccount) {
        throw new Error("No account found. Please create an account first.");
      }
      
      linkedAccountId = firstAccount.id;
    }

    const { linkedAccount, ...cardData } = input;
    
    const card = await prisma.debitCard.create({
      data: {
        userId,
        name: cardData.name,
        bank: cardData.bank,
        lastFour: cardData.lastFour,
        cardNetwork: cardData.cardNetwork,
        expiryDate: cardData.expiryDate || null,
        isActive: cardData.isActive ?? true,
        color: cardData.color || null,
        linkedAccountId,
      },
      include: {
        linkedAccount: {
          select: {
            id: true,
            name: true,
            bank: true,
          },
        },
      },
    });

    return card;
  }

  async updateDebitCard(
    userId: string,
    cardId: string,
    input: UpdateDebitCardInput
  ) {
    // Check if card exists and belongs to user
    const card = await prisma.debitCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error("Debit card not found");
    }

    // If linked account is being updated, verify it exists
    if (input.linkedAccountId) {
      const account = await prisma.account.findFirst({
        where: {
          id: input.linkedAccountId,
          userId,
        },
      });

      if (!account) {
        throw new Error("Linked account not found");
      }
    }

    const { linkedAccount, ...updateData } = input;
    
    // Build update data, excluding undefined values and linkedAccount
    const data: any = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.bank !== undefined) data.bank = updateData.bank;
    if (updateData.lastFour !== undefined) data.lastFour = updateData.lastFour;
    if (updateData.cardNetwork !== undefined) data.cardNetwork = updateData.cardNetwork;
    if (updateData.expiryDate !== undefined) data.expiryDate = updateData.expiryDate || null;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
    if (updateData.color !== undefined) data.color = updateData.color || null;
    if (updateData.linkedAccountId !== undefined) data.linkedAccountId = updateData.linkedAccountId;
    
    return prisma.debitCard.update({
      where: { id: cardId },
      data,
      include: {
        linkedAccount: {
          select: {
            id: true,
            name: true,
            bank: true,
          },
        },
      },
    });
  }

  async deleteDebitCard(userId: string, cardId: string) {
    // Check if card exists and belongs to user
    const card = await prisma.debitCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error("Debit card not found");
    }

    await prisma.debitCard.delete({
      where: { id: cardId },
    });
  }
}

export const debitCardsService = new DebitCardsService();

