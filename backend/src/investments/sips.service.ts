import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import { CreateSIPInput, UpdateSIPInput } from "./investments.schemas";
import { calculateNextRecurringDate } from "../utils/dateHelpers";

export class SIPsService {
  async getSIPs(userId: string, isActive?: boolean) {
    const where: any = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return prisma.sIP.findMany({
      where,
      include: {
        investment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { nextDate: "asc" },
    });
  }

  async getSIPById(userId: string, sipId: string) {
    const sip = await prisma.sIP.findFirst({
      where: {
        id: sipId,
        userId,
      },
      include: {
        investment: true,
      },
    });

    if (!sip) {
      throw new Error("SIP not found");
    }

    return sip;
  }

  async createSIP(userId: string, input: CreateSIPInput) {
    // Verify investment if provided
    if (input.investmentId) {
      const investment = await prisma.investment.findFirst({
        where: {
          id: input.investmentId,
          userId,
        },
      });
      if (!investment) {
        throw new Error("Investment not found");
      }
    }

    const startDate =
      typeof input.startDate === "string"
        ? new Date(input.startDate)
        : input.startDate;

    const nextDate = calculateNextRecurringDate(
      startDate,
      input.frequency,
      undefined
    );

    // Always start with 0 totalInvested, regardless of input
    const sip = await prisma.sIP.create({
      data: {
        userId,
        investmentId: input.investmentId || null,
        name: input.name,
        amount: new Prisma.Decimal(input.amount),
        frequency: input.frequency,
        startDate,
        nextDate,
        totalInvested: new Prisma.Decimal(0), // Always start at 0
        isActive: true,
      },
      include: {
        investment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return sip;
  }

  async updateSIP(userId: string, sipId: string, input: UpdateSIPInput) {
    const sip = await prisma.sIP.findFirst({
      where: {
        id: sipId,
        userId,
      },
    });

    if (!sip) {
      throw new Error("SIP not found");
    }

    // Verify investment if being updated
    if (input.investmentId !== undefined && input.investmentId !== null) {
      const investment = await prisma.investment.findFirst({
        where: {
          id: input.investmentId,
          userId,
        },
      });
      if (!investment) {
        throw new Error("Investment not found");
      }
    }

    const updateData: any = { ...input };
    if (input.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(input.amount);
    }
    if (input.totalInvested !== undefined) {
      updateData.totalInvested = new Prisma.Decimal(input.totalInvested);
    }
    if (input.startDate !== undefined) {
      updateData.startDate =
        typeof input.startDate === "string"
          ? new Date(input.startDate)
          : input.startDate;
    }

    // Recalculate nextDate if frequency or startDate changed
    if (input.frequency || input.startDate) {
      const frequency = input.frequency || sip.frequency;
      const startDate = updateData.startDate || sip.startDate;
      updateData.nextDate = calculateNextRecurringDate(
        startDate,
        frequency,
        undefined
      );
    }

    return prisma.sIP.update({
      where: { id: sipId },
      data: updateData,
      include: {
        investment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async deleteSIP(userId: string, sipId: string) {
    const sip = await prisma.sIP.findFirst({
      where: {
        id: sipId,
        userId,
      },
    });

    if (!sip) {
      throw new Error("SIP not found");
    }

    await prisma.sIP.delete({
      where: { id: sipId },
    });
  }

  async getUpcomingSIPs(userId: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return prisma.sIP.findMany({
      where: {
        userId,
        isActive: true,
        nextDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: {
        investment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { nextDate: "asc" },
    });
  }
}

export const sipsService = new SIPsService();

