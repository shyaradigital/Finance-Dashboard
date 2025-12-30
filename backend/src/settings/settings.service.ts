import prisma from "../config/database";
import { UpdateSettingsInput, UserOptionsInput } from "./settings.schemas";

export class SettingsService {
  async getSettings(userId: string) {
    let settings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.settings.create({
        data: {
          userId,
          preferences: "{}",
        },
      });
    }

    return {
      ...settings,
      preferences: JSON.parse(settings.preferences),
    };
  }

  async updateSettings(userId: string, input: UpdateSettingsInput) {
    let settings = await prisma.settings.findUnique({
      where: { userId },
    });

    const preferencesJson = input.preferences
      ? JSON.stringify(input.preferences)
      : settings?.preferences || "{}";

    if (settings) {
      settings = await prisma.settings.update({
        where: { userId },
        data: {
          preferences: preferencesJson,
        },
      });
    } else {
      settings = await prisma.settings.create({
        data: {
          userId,
          preferences: preferencesJson,
        },
      });
    }

    return {
      ...settings,
      preferences: JSON.parse(settings.preferences),
    };
  }

  async getUserOptions(userId: string) {
    const settings = await this.getSettings(userId);
    const preferences = settings.preferences as any;

    return {
      investmentTypes: preferences.investmentTypes || [],
      accountTypes: preferences.accountTypes || [],
      commitmentTypes: preferences.commitmentTypes || [],
      sipFrequencies: preferences.sipFrequencies || [],
      cardNetworks: preferences.cardNetworks || [],
      vaultCategories: preferences.vaultCategories || [],
    };
  }

  async updateUserOptions(userId: string, input: UserOptionsInput) {
    const settings = await this.getSettings(userId);
    const preferences = settings.preferences as any;

    // Merge new options with existing preferences
    const updatedPreferences = {
      ...preferences,
      ...(input.investmentTypes !== undefined && { investmentTypes: input.investmentTypes }),
      ...(input.accountTypes !== undefined && { accountTypes: input.accountTypes }),
      ...(input.commitmentTypes !== undefined && { commitmentTypes: input.commitmentTypes }),
      ...(input.sipFrequencies !== undefined && { sipFrequencies: input.sipFrequencies }),
      ...(input.cardNetworks !== undefined && { cardNetworks: input.cardNetworks }),
      ...(input.vaultCategories !== undefined && { vaultCategories: input.vaultCategories }),
    };

    return await this.updateSettings(userId, {
      preferences: updatedPreferences,
    });
  }
}

export const settingsService = new SettingsService();

