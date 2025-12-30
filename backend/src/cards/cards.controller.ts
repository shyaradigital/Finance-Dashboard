import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { creditCardsService } from "./credit-cards.service";
import { debitCardsService } from "./debit-cards.service";

export class CardsController {
  // Credit Cards
  async getCreditCards(req: AuthRequest, res: Response) {
    try {
      const cards = await creditCardsService.getCreditCards(req.userId!);
      sendSuccess(res, cards);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCreditCardById(req: AuthRequest, res: Response) {
    try {
      const card = await creditCardsService.getCreditCardById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, card);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createCreditCard(req: AuthRequest, res: Response) {
    try {
      const card = await creditCardsService.createCreditCard(
        req.userId!,
        req.body
      );
      sendSuccess(res, card, "Credit card created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateCreditCard(req: AuthRequest, res: Response) {
    try {
      const card = await creditCardsService.updateCreditCard(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, card, "Credit card updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteCreditCard(req: AuthRequest, res: Response) {
    try {
      await creditCardsService.deleteCreditCard(req.userId!, req.params.id);
      sendSuccess(res, null, "Credit card deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCreditCardTransactions(req: AuthRequest, res: Response) {
    try {
      const transactions = await creditCardsService.getCardTransactions(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, transactions);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async getCreditCardUtilization(req: AuthRequest, res: Response) {
    try {
      const utilization = await creditCardsService.getCardUtilization(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, utilization);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  // Debit Cards
  async getDebitCards(req: AuthRequest, res: Response) {
    try {
      const cards = await debitCardsService.getDebitCards(req.userId!);
      sendSuccess(res, cards);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getDebitCardById(req: AuthRequest, res: Response) {
    try {
      const card = await debitCardsService.getDebitCardById(
        req.userId!,
        req.params.id
      );
      sendSuccess(res, card);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createDebitCard(req: AuthRequest, res: Response) {
    try {
      const card = await debitCardsService.createDebitCard(
        req.userId!,
        req.body
      );
      sendSuccess(res, card, "Debit card created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateDebitCard(req: AuthRequest, res: Response) {
    try {
      const card = await debitCardsService.updateDebitCard(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, card, "Debit card updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteDebitCard(req: AuthRequest, res: Response) {
    try {
      await debitCardsService.deleteDebitCard(req.userId!, req.params.id);
      sendSuccess(res, null, "Debit card deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const cardsController = new CardsController();

