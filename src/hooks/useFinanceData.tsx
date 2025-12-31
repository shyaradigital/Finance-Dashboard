import { useState, useCallback } from "react";
import { 
  ShoppingBag, 
  Utensils, 
  Home, 
  Car, 
  Gamepad2, 
  Receipt,
  Wifi,
  Heart,
  GraduationCap
} from "lucide-react";

// ============ Types ============
export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  isRecurring?: boolean;
  account: string;
  icon: React.ElementType;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  budget: number;
  spent: number;
  color: string;
}

export interface UpcomingCommitment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: "bill" | "subscription" | "loan";
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  type: "savings" | "current" | "fd";
  balance: number;
  accountNumber: string;
  color: string;
}

export interface CreditCardType {
  id: string;
  name: string;
  bank: string;
  lastFour: string;
  limit: number;
  used: number;
  dueDate: string; // Formatted display string (e.g., "Jan 15")
  dueDateDay?: number; // Numeric day of month (1-31) for calculations
  minDue: number;
  color: string;
}

export interface DebitCardType {
  id: string;
  name: string;
  bank: string;
  lastFour: string;
  linkedAccount: string;
  cardNetwork: "Visa" | "Mastercard" | "RuPay";
  expiryDate: string;
  isActive: boolean;
  color: string;
}

export interface VaultItem {
  id: string;
  title: string;
  category: string;
  value: string;
  type: "text" | "document";
  documentUrl?: string;
  documentName?: string;
  lastUpdated: string;
}

export interface Investment {
  id: string;
  name: string;
  type: "mutual_fund" | "stock" | "sip" | "ppf" | "nps";
  invested: number;
  current: number;
  returns: number;
  color: string;
}

export interface SIP {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  nextDate: string;
  totalInvested: number;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  count: number;
  color: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// ============ Icon Map ============
export const categoryIcons: Record<string, React.ElementType> = {
  Shopping: ShoppingBag,
  Food: Utensils,
  Housing: Home,
  Transport: Car,
  Entertainment: Gamepad2,
  Utilities: Wifi,
  Health: Heart,
  Education: GraduationCap,
  Salary: Receipt,
  Freelance: Receipt,
  default: Receipt,
};

// ============ Initial Data ============
const initialTransactions: Transaction[] = [];

const initialBudgetCategories: BudgetCategory[] = [];

const initialCommitments: UpcomingCommitment[] = [];

const initialBankAccounts: BankAccount[] = [];

const initialCreditCards: CreditCardType[] = [];

const initialDebitCards: DebitCardType[] = [];

const initialVaultItems: VaultItem[] = [];

const initialInvestments: Investment[] = [];

const initialSIPs: SIP[] = [];

const initialCategories: Category[] = [];

const initialAutomationRules: AutomationRule[] = [];

// ============ Hook ============
export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(initialBudgetCategories);
  const [commitments, setCommitments] = useState<UpcomingCommitment[]>(initialCommitments);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>(initialCreditCards);
  const [debitCards, setDebitCards] = useState<DebitCardType[]>(initialDebitCards);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(initialVaultItems);
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments);
  const [sips, setSIPs] = useState<SIP[]>(initialSIPs);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(initialAutomationRules);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // ============ Transaction Operations ============
  const addTransaction = useCallback((transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: generateId() };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // ============ Budget Operations ============
  const addBudgetCategory = useCallback((budget: Omit<BudgetCategory, "id">) => {
    const newBudget = { ...budget, id: generateId() };
    setBudgetCategories(prev => [...prev, newBudget]);
    return newBudget;
  }, []);

  const updateBudgetCategory = useCallback((id: string, updates: Partial<BudgetCategory>) => {
    setBudgetCategories(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteBudgetCategory = useCallback((id: string) => {
    setBudgetCategories(prev => prev.filter(b => b.id !== id));
  }, []);

  // ============ Commitment Operations ============
  const addCommitment = useCallback((commitment: Omit<UpcomingCommitment, "id">) => {
    const newCommitment = { ...commitment, id: generateId() };
    setCommitments(prev => [...prev, newCommitment]);
    return newCommitment;
  }, []);

  const updateCommitment = useCallback((id: string, updates: Partial<UpcomingCommitment>) => {
    setCommitments(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCommitment = useCallback((id: string) => {
    setCommitments(prev => prev.filter(c => c.id !== id));
  }, []);

  // ============ Bank Account Operations ============
  const addBankAccount = useCallback((account: Omit<BankAccount, "id">) => {
    const newAccount = { ...account, id: generateId() };
    setBankAccounts(prev => [...prev, newAccount]);
    return newAccount;
  }, []);

  const updateBankAccount = useCallback((id: string, updates: Partial<BankAccount>) => {
    setBankAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteBankAccount = useCallback((id: string) => {
    setBankAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  // ============ Credit Card Operations ============
  const addCreditCard = useCallback((card: Omit<CreditCardType, "id">) => {
    const newCard = { ...card, id: generateId() };
    setCreditCards(prev => [...prev, newCard]);
    return newCard;
  }, []);

  const updateCreditCard = useCallback((id: string, updates: Partial<CreditCardType>) => {
    setCreditCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCreditCard = useCallback((id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
  }, []);

  // ============ Debit Card Operations ============
  const addDebitCard = useCallback((card: Omit<DebitCardType, "id">) => {
    const newCard = { ...card, id: generateId() };
    setDebitCards(prev => [...prev, newCard]);
    return newCard;
  }, []);

  const updateDebitCard = useCallback((id: string, updates: Partial<DebitCardType>) => {
    setDebitCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteDebitCard = useCallback((id: string) => {
    setDebitCards(prev => prev.filter(c => c.id !== id));
  }, []);
  // ============ Vault Operations ============
  const addVaultItem = useCallback((item: Omit<VaultItem, "id">) => {
    const newItem = { ...item, id: generateId() };
    setVaultItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const updateVaultItem = useCallback((id: string, updates: Partial<VaultItem>) => {
    setVaultItems(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  const deleteVaultItem = useCallback((id: string) => {
    setVaultItems(prev => prev.filter(v => v.id !== id));
  }, []);

  // ============ Investment Operations ============
  const addInvestment = useCallback((investment: Omit<Investment, "id">) => {
    const newInvestment = { ...investment, id: generateId() };
    setInvestments(prev => [...prev, newInvestment]);
    return newInvestment;
  }, []);

  const updateInvestment = useCallback((id: string, updates: Partial<Investment>) => {
    setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const deleteInvestment = useCallback((id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id));
  }, []);

  // ============ SIP Operations ============
  const addSIP = useCallback((sip: Omit<SIP, "id">) => {
    const newSIP = { ...sip, id: generateId() };
    setSIPs(prev => [...prev, newSIP]);
    return newSIP;
  }, []);

  const updateSIP = useCallback((id: string, updates: Partial<SIP>) => {
    setSIPs(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSIP = useCallback((id: string) => {
    setSIPs(prev => prev.filter(s => s.id !== id));
  }, []);

  // ============ Category Operations ============
  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const newCategory = { ...category, id: generateId() };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // ============ Automation Rule Operations ============
  const toggleAutomationRule = useCallback((id: string) => {
    setAutomationRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const addAutomationRule = useCallback((rule: Omit<AutomationRule, "id">) => {
    const newRule = { ...rule, id: generateId() };
    setAutomationRules(prev => [...prev, newRule]);
    return newRule;
  }, []);

  const updateAutomationRule = useCallback((id: string, updates: Partial<AutomationRule>) => {
    setAutomationRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteAutomationRule = useCallback((id: string) => {
    setAutomationRules(prev => prev.filter(r => r.id !== id));
  }, []);

  return {
    // Data
    transactions,
    budgetCategories,
    commitments,
    bankAccounts,
    creditCards,
    debitCards,
    vaultItems,
    investments,
    sips,
    categories,
    automationRules,
    
    // Transaction Operations
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Budget Operations
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    
    // Commitment Operations
    addCommitment,
    updateCommitment,
    deleteCommitment,
    
    // Bank Account Operations
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    
    // Credit Card Operations
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    
    // Debit Card Operations
    addDebitCard,
    updateDebitCard,
    deleteDebitCard,
    
    // Vault Operations
    addVaultItem,
    updateVaultItem,
    deleteVaultItem,
    
    // Investment Operations
    addInvestment,
    updateInvestment,
    deleteInvestment,
    
    // SIP Operations
    addSIP,
    updateSIP,
    deleteSIP,
    
    // Category Operations
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Automation Rule Operations
    toggleAutomationRule,
    addAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
  };
}

export type FinanceData = ReturnType<typeof useFinanceData>;
