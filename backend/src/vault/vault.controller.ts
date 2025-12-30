import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { vaultService } from "./vault.service";

export class VaultController {
  async getVaultItems(req: AuthRequest, res: Response) {
    try {
      const items = await vaultService.getVaultItems(req.userId!);
      sendSuccess(res, items);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getVaultItemById(req: AuthRequest, res: Response) {
    try {
      const includeValue = req.query.includeValue === "true";
      const item = await vaultService.getVaultItemById(
        req.userId!,
        req.params.id,
        includeValue
      );
      sendSuccess(res, item);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createVaultItem(req: AuthRequest, res: Response) {
    try {
      const item = await vaultService.createVaultItem(req.userId!, req.body);
      sendSuccess(res, item, "Vault item created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateVaultItem(req: AuthRequest, res: Response) {
    try {
      const item = await vaultService.updateVaultItem(
        req.userId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, item, "Vault item updated successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteVaultItem(req: AuthRequest, res: Response) {
    try {
      await vaultService.deleteVaultItem(req.userId!, req.params.id);
      sendSuccess(res, null, "Vault item deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const vaultController = new VaultController();

