import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import {
  CreateCommitmentInput,
  UpdateCommitmentInput,
} from "./commitments.schemas";
import { isWithinDays, getDaysUntil } from "../utils/dateHelpers";

export class CommitmentsService {
  async getCommitments(
    userId: string,
    filters?: {
      type?: string;
      upcoming?: boolean;
      days?: number;
    }
  ) {
    const where: any = { userId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.upcoming) {
      const days = filters.days || 90;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      where.dueDate = {
        gte: new Date(),
        lte: futureDate,
      };
    }

    return prisma.commitment.findMany({
      where,
      orderBy: { dueDate: "asc" },
    });
  }

  async getCommitmentById(userId: string, commitmentId: string) {
    const commitment = await prisma.commitment.findFirst({
      where: {
        id: commitmentId,
        userId,
      },
    });

    if (!commitment) {
      throw new Error("Commitment not found");
    }

    return commitment;
  }

  async createCommitment(userId: string, input: CreateCommitmentInput) {
    const dueDate =
      typeof input.dueDate === "string" ? new Date(input.dueDate) : input.dueDate;

    const commitment = await prisma.commitment.create({
      data: {
        userId,
        ...input,
        dueDate,
        amount: new Prisma.Decimal(input.amount),
      },
    });

    return commitment;
  }

  async updateCommitment(
    userId: string,
    commitmentId: string,
    input: UpdateCommitmentInput
  ) {
    const commitment = await prisma.commitment.findFirst({
      where: {
        id: commitmentId,
        userId,
      },
    });

    if (!commitment) {
      throw new Error("Commitment not found");
    }

    const updateData: any = { ...input };
    if (input.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(input.amount);
    }
    if (input.dueDate !== undefined) {
      updateData.dueDate =
        typeof input.dueDate === "string"
          ? new Date(input.dueDate)
          : input.dueDate;
    }

    return prisma.commitment.update({
      where: { id: commitmentId },
      data: updateData,
    });
  }

  async deleteCommitment(userId: string, commitmentId: string) {
    const commitment = await prisma.commitment.findFirst({
      where: {
        id: commitmentId,
        userId,
      },
    });

    if (!commitment) {
      throw new Error("Commitment not found");
    }

    await prisma.commitment.delete({
      where: { id: commitmentId },
    });
  }

  async getUpcomingCommitments(
    userId: string,
    days: number = 90
  ) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const commitments = await prisma.commitment.findMany({
      where: {
        userId,
        dueDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return commitments.map((commitment) => {
      const daysUntil = getDaysUntil(commitment.dueDate);
      return {
        ...commitment,
        daysUntil,
        isDueSoon: daysUntil <= 7,
        isOverdue: daysUntil < 0,
      };
    });
  }
}

export const commitmentsService = new CommitmentsService();

