import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import {
  CreateInvestmentInput,
  UpdateInvestmentInput,
} from "./investments.schemas";

export class InvestmentsService {
  async getInvestments(userId: string) {
    const investments = await prisma.investment.findMany({
      where: { userId },
      include: {
        sips: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return investments.map((investment) => {
      const invested = Number(investment.invested);
      const current = Number(investment.currentValue);
      const returns = invested > 0 ? ((current - invested) / invested) * 100 : 0;

      return {
        ...investment,
        returns: Number(returns.toFixed(2)),
      };
    });
  }

  async getInvestmentById(userId: string, investmentId: string) {
    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        userId,
      },
      include: {
        sips: true,
      },
    });

    if (!investment) {
      throw new Error("Investment not found");
    }

    const invested = Number(investment.invested);
    const current = Number(investment.currentValue);
    const returns = invested > 0 ? ((current - invested) / invested) * 100 : 0;

    return {
      ...investment,
      returns: Number(returns.toFixed(2)),
    };
  }

  async createInvestment(userId: string, input: CreateInvestmentInput) {
    const investment = await prisma.investment.create({
      data: {
        userId,
        ...input,
        invested: new Prisma.Decimal(input.invested),
        currentValue: new Prisma.Decimal(input.currentValue),
        ...(input.purchaseDate && {
          purchaseDate:
            typeof input.purchaseDate === "string"
              ? new Date(input.purchaseDate)
              : input.purchaseDate,
        }),
      },
    });

    const invested = Number(investment.invested);
    const current = Number(investment.currentValue);
    const returns = invested > 0 ? ((current - invested) / invested) * 100 : 0;

    return {
      ...investment,
      returns: Number(returns.toFixed(2)),
    };
  }

  async updateInvestment(
    userId: string,
    investmentId: string,
    input: UpdateInvestmentInput
  ) {
    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        userId,
      },
    });

    if (!investment) {
      throw new Error("Investment not found");
    }

    const updateData: any = { ...input };
    if (input.invested !== undefined) {
      updateData.invested = new Prisma.Decimal(input.invested);
    }
    if (input.currentValue !== undefined) {
      updateData.currentValue = new Prisma.Decimal(input.currentValue);
    }
    if (input.purchaseDate !== undefined) {
      updateData.purchaseDate = input.purchaseDate
        ? typeof input.purchaseDate === "string"
          ? new Date(input.purchaseDate)
          : input.purchaseDate
        : null;
    }

    const updated = await prisma.investment.update({
      where: { id: investmentId },
      data: updateData,
    });

    const invested = Number(updated.invested);
    const current = Number(updated.currentValue);
    const returns = invested > 0 ? ((current - invested) / invested) * 100 : 0;

    return {
      ...updated,
      returns: Number(returns.toFixed(2)),
    };
  }

  async deleteInvestment(userId: string, investmentId: string) {
    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        userId,
      },
    });

    if (!investment) {
      throw new Error("Investment not found");
    }

    // Check if investment has active SIPs
    const sipCount = await prisma.sIP.count({
      where: {
        investmentId,
        isActive: true,
      },
    });

    if (sipCount > 0) {
      throw new Error(
        "Cannot delete investment with active SIPs. Please deactivate or delete SIPs first."
      );
    }

    await prisma.investment.delete({
      where: { id: investmentId },
    });
  }

  async getInvestmentSummary(userId: string) {
    const investments = await prisma.investment.findMany({
      where: { userId },
    });

    let totalInvested = 0;
    let totalCurrent = 0;

    investments.forEach((investment) => {
      totalInvested += Number(investment.invested);
      totalCurrent += Number(investment.currentValue);
    });

    const totalReturns = totalCurrent - totalInvested;
    const returnsPercent =
      totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    return {
      totalInvested: Number(totalInvested.toFixed(2)),
      totalCurrent: Number(totalCurrent.toFixed(2)),
      totalReturns: Number(totalReturns.toFixed(2)),
      returnsPercent: Number(returnsPercent.toFixed(2)),
      count: investments.length,
    };
  }
}

export const investmentsService = new InvestmentsService();

