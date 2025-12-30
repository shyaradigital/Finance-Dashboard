import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { accountsService } from "./accounts.service";

export class AccountsController {
  async getAccounts(req: AuthRequest, res: Response) {
    try {
      const accounts = await accountsService.getAccounts(req.userId!);
      sendSuccess(res, accounts);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getAccountById(req: AuthRequest, res: Response) {
    try {
      const account = await accountsService.getAccountById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, account);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createAccount(req: AuthRequest, res: Response) {
    try {
      const account = await accountsService.createAccount(
        req.userId!,
        req.body
      );
      sendSuccess(res, account, "Account created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateAccount(req: AuthRequest, res: Response) {
    try {
      const account = await accountsService.updateAccount(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, account, "Account updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      await accountsService.deleteAccount(req.userId!, req.params.id);
      sendSuccess(res, null, "Account deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getAccountTransactions(req: AuthRequest, res: Response) {
    try {
      const transactions = await accountsService.getAccountTransactions(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, transactions);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }
}

export const accountsController = new AccountsController();

