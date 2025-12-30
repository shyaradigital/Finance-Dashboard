import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";

export function useUserSetup() {
  const finance = useFinance();
  
  // Safely extract values with defaults to prevent undefined errors
  const bankAccounts = finance?.bankAccounts || [];
  const creditCards = finance?.creditCards || [];
  const debitCards = finance?.debitCards || [];
  const categories = finance?.categories || [];
  const transactions = finance?.transactions || [];
  const investments = finance?.investments || [];
  const budgetCategories = finance?.budgetCategories || [];

  // Check if user is new (has no data)
  const isNewUser = useMemo(() => {
    return (
      bankAccounts.length === 0 &&
      creditCards.length === 0 &&
      debitCards.length === 0 &&
      categories.length === 0 &&
      transactions.length === 0 &&
      investments.length === 0 &&
      budgetCategories.length === 0
    );
  }, [
    bankAccounts.length,
    creditCards.length,
    debitCards.length,
    categories.length,
    transactions.length,
    investments.length,
    budgetCategories.length,
  ]);

  // Check if user has basic setup (accounts or categories)
  const hasBasicSetup = useMemo(() => {
    return (
      bankAccounts.length > 0 ||
      categories.length > 0
    );
  }, [bankAccounts.length, categories.length]);

  return {
    isNewUser,
    hasBasicSetup,
    needsSetup: isNewUser || !hasBasicSetup,
  };
}

