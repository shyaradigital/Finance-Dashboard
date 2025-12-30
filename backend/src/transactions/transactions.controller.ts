import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { transactionsService } from "./transactions.service";
import { getStartOfMonth, getEndOfMonth } from "../utils/dateHelpers";

export class TransactionsController {
  async getTransactions(req: AuthRequest, res: Response) {
    try {
      const filters: any = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.categoryId) filters.categoryId = req.query.categoryId as string;
      if (req.query.accountId) filters.accountId = req.query.accountId as string;
      if (req.query.creditCardId) filters.creditCardId = req.query.creditCardId as string;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const transactions = await transactionsService.getTransactions(
        req.userId!,
        filters
      );
      sendSuccess(res, transactions);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getTransactionById(req: AuthRequest, res: Response) {
    try {
      const transaction = await transactionsService.getTransactionById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, transaction);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createTransaction(req: AuthRequest, res: Response) {
    try {
      const transaction = await transactionsService.createTransaction(
        req.userId!,
        req.body
      );
      sendSuccess(res, transaction, "Transaction created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateTransaction(req: AuthRequest, res: Response) {
    try {
      const transaction = await transactionsService.updateTransaction(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, transaction, "Transaction updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteTransaction(req: AuthRequest, res: Response) {
    try {
      await transactionsService.deleteTransaction(req.userId!, req.params.id);
      sendSuccess(res, null, "Transaction deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // Recurring Transactions
  async getRecurringTransactions(req: AuthRequest, res: Response) {
    try {
      const isActive =
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined;
      const recurring = await transactionsService.getRecurringTransactions(
        req.userId!,
        isActive
      );
      sendSuccess(res, recurring);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getRecurringTransactionById(req: AuthRequest, res: Response) {
    try {
      const recurring = await transactionsService.getRecurringTransactionById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, recurring);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createRecurringTransaction(req: AuthRequest, res: Response) {
    try {
      const recurring = await transactionsService.createRecurringTransaction(
        req.userId!,
        req.body
      );
      sendSuccess(res, recurring, "Recurring transaction created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateRecurringTransaction(req: AuthRequest, res: Response) {
    try {
      const recurring = await transactionsService.updateRecurringTransaction(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, recurring, "Recurring transaction updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteRecurringTransaction(req: AuthRequest, res: Response) {
    try {
      await transactionsService.deleteRecurringTransaction(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, null, "Recurring transaction deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const transactionsController = new TransactionsController();

