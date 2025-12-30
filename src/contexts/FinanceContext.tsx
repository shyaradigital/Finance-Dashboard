import { createContext, useContext, ReactNode, useMemo } from "react";
import { 
  useTransactions, 
  useAccounts, 
  useCreditCards, 
  useDebitCards,
  useBudgets,
  useCommitments,
  useVault,
  useInvestments,
  useSIPs,
  useCategories
} from "@/hooks/useFinanceQueries";
import { AutomationRule } from "@/hooks/useFinanceData";

// Stub for automation rules (not yet implemented in backend)
const useAutomationRules = (): {
  automationRules: AutomationRule[];
  toggleAutomationRule: (id: string) => void;
  addAutomationRule: (rule: Omit<AutomationRule, "id">) => AutomationRule;
  updateAutomationRule: (id: string, updates: Partial<AutomationRule>) => void;
  deleteAutomationRule: (id: string) => void;
} => {
  return {
    automationRules: [] as AutomationRule[],
    toggleAutomationRule: (_id: string) => {},
    addAutomationRule: (_rule: Omit<AutomationRule, "id">) => ({ id: "", name: "", description: "", enabled: false, conditions: [], actions: [] } as AutomationRule),
    updateAutomationRule: (_id: string, _updates: Partial<AutomationRule>) => {},
    deleteAutomationRule: (_id: string) => {},
  };
};

type FinanceData = ReturnType<typeof useFinanceData>;

function useFinanceData() {
  const transactions = useTransactions();
  const accounts = useAccounts();
  const creditCards = useCreditCards();
  const debitCards = useDebitCards();
  const budgets = useBudgets();
  const commitments = useCommitments();
  const vault = useVault();
  const investments = useInvestments();
  const sips = useSIPs();
  const categories = useCategories();
  const automationRules = useAutomationRules();

  return useMemo(() => ({
    // Data
    transactions: transactions.transactions,
    budgetCategories: budgets.budgetCategories,
    commitments: commitments.commitments,
    bankAccounts: accounts.bankAccounts,
    creditCards: creditCards.creditCards,
    debitCards: debitCards.debitCards,
    vaultItems: vault.vaultItems,
    investments: investments.investments,
    sips: sips.sips,
    categories: categories.categories,
    automationRules: automationRules.automationRules,
    
    // Transaction Operations
    addTransaction: transactions.addTransaction,
    updateTransaction: transactions.updateTransaction,
    deleteTransaction: transactions.deleteTransaction,
    
    // Budget Operations
    addBudgetCategory: budgets.addBudgetCategory,
    updateBudgetCategory: budgets.updateBudgetCategory,
    deleteBudgetCategory: budgets.deleteBudgetCategory,
    
    // Commitment Operations
    addCommitment: commitments.addCommitment,
    updateCommitment: commitments.updateCommitment,
    deleteCommitment: commitments.deleteCommitment,
    
    // Bank Account Operations
    addBankAccount: accounts.addBankAccount,
    updateBankAccount: accounts.updateBankAccount,
    deleteBankAccount: accounts.deleteBankAccount,
    
    // Credit Card Operations
    addCreditCard: creditCards.addCreditCard,
    updateCreditCard: creditCards.updateCreditCard,
    deleteCreditCard: creditCards.deleteCreditCard,
    
    // Debit Card Operations
    addDebitCard: debitCards.addDebitCard,
    updateDebitCard: debitCards.updateDebitCard,
    deleteDebitCard: debitCards.deleteDebitCard,
    
    // Vault Operations
    addVaultItem: vault.addVaultItem,
    updateVaultItem: vault.updateVaultItem,
    deleteVaultItem: vault.deleteVaultItem,
    
    // Investment Operations
    addInvestment: investments.addInvestment,
    updateInvestment: investments.updateInvestment,
    deleteInvestment: investments.deleteInvestment,
    
    // SIP Operations
    addSIP: sips.addSIP,
    updateSIP: sips.updateSIP,
    deleteSIP: sips.deleteSIP,
    
    // Category Operations
    addCategory: categories.addCategory,
    updateCategory: categories.updateCategory,
    deleteCategory: categories.deleteCategory,
    
    // Automation Rule Operations
    toggleAutomationRule: automationRules.toggleAutomationRule,
    addAutomationRule: automationRules.addAutomationRule,
    updateAutomationRule: automationRules.updateAutomationRule,
    deleteAutomationRule: automationRules.deleteAutomationRule,
  }), [
    transactions, accounts, creditCards, debitCards, budgets, 
    commitments, vault, investments, sips, categories, automationRules
  ]);
}

const FinanceContext = createContext<FinanceData | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const financeData = useFinanceData();
  
  return (
    <FinanceContext.Provider value={financeData}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
