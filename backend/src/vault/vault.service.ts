import prisma from "../config/database";
import { CreateVaultItemInput, UpdateVaultItemInput } from "./vault.schemas";
import { encrypt, decrypt, maskValue } from "../utils/encryption";

export class VaultService {
  async getVaultItems(userId: string) {
    const items = await prisma.vaultItem.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    // Return items with masked values
    return items.map((item) => ({
      ...item,
      value: maskValue(decrypt(item.value)),
    }));
  }

  async getVaultItemById(userId: string, itemId: string, includeValue: boolean = false) {
    const item = await prisma.vaultItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!item) {
      throw new Error("Vault item not found");
    }

    if (includeValue) {
      return {
        ...item,
        value: decrypt(item.value),
      };
    }

    return {
      ...item,
      value: maskValue(decrypt(item.value)),
    };
  }

  async createVaultItem(userId: string, input: CreateVaultItemInput) {
    // Encrypt the value
    const encryptedValue = encrypt(input.value);

    const item = await prisma.vaultItem.create({
      data: {
        userId,
        ...input,
        value: encryptedValue,
      },
    });

    return {
      ...item,
      value: maskValue(decrypt(item.value)),
    };
  }

  async updateVaultItem(
    userId: string,
    itemId: string,
    input: UpdateVaultItemInput
  ) {
    const item = await prisma.vaultItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!item) {
      throw new Error("Vault item not found");
    }

    const updateData: any = { ...input };
    
    // Encrypt value if being updated
    if (input.value !== undefined) {
      updateData.value = encrypt(input.value);
    }

    const updated = await prisma.vaultItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return {
      ...updated,
      value: maskValue(decrypt(updated.value)),
    };
  }

  async deleteVaultItem(userId: string, itemId: string) {
    const item = await prisma.vaultItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!item) {
      throw new Error("Vault item not found");
    }

    await prisma.vaultItem.delete({
      where: { id: itemId },
    });
  }
}

export const vaultService = new VaultService();

