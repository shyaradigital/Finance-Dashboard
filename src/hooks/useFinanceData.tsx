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
  dueDate: string;
  minDue: number;
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
const initialTransactions: Transaction[] = [
  { id: "1", type: "expense", category: "Shopping", description: "Amazon - Electronics", amount: 12499, date: "Today", account: "HDFC Credit Card", icon: ShoppingBag },
  { id: "2", type: "expense", category: "Food", description: "Swiggy", amount: 856, date: "Today", account: "ICICI Debit", icon: Utensils },
  { id: "3", type: "income", category: "Salary", description: "Monthly Salary", amount: 125000, date: "Yesterday", isRecurring: true, account: "HDFC Savings", icon: Receipt },
  { id: "4", type: "expense", category: "Housing", description: "Rent Payment", amount: 25000, date: "Dec 20", isRecurring: true, account: "HDFC Savings", icon: Home },
  { id: "5", type: "expense", category: "Transport", description: "Uber Rides", amount: 1240, date: "Dec 19", account: "ICICI Debit", icon: Car },
  { id: "6", type: "expense", category: "Entertainment", description: "Netflix Subscription", amount: 649, date: "Dec 18", isRecurring: true, account: "HDFC Credit Card", icon: Gamepad2 },
  { id: "7", type: "expense", category: "Food", description: "Grocery - BigBasket", amount: 3420, date: "Dec 17", account: "HDFC Debit", icon: Utensils },
  { id: "8", type: "income", category: "Freelance", description: "Design Project", amount: 35000, date: "Dec 15", account: "HDFC Savings", icon: Receipt },
];

const initialBudgetCategories: BudgetCategory[] = [
  { id: "1", name: "Housing", icon: Home, budget: 30000, spent: 25000, color: "bg-primary" },
  { id: "2", name: "Food & Dining", icon: Utensils, budget: 15000, spent: 12450, color: "bg-accent" },
  { id: "3", name: "Shopping", icon: ShoppingBag, budget: 10000, spent: 12499, color: "bg-destructive" },
  { id: "4", name: "Transport", icon: Car, budget: 5000, spent: 3240, color: "bg-success" },
  { id: "5", name: "Entertainment", icon: Gamepad2, budget: 5000, spent: 2649, color: "bg-warning" },
  { id: "6", name: "Utilities", icon: Wifi, budget: 5000, spent: 4200, color: "bg-primary" },
  { id: "7", name: "Health", icon: Heart, budget: 3000, spent: 1500, color: "bg-success" },
  { id: "8", name: "Education", icon: GraduationCap, budget: 5000, spent: 3000, color: "bg-accent" },
];

const initialCommitments: UpcomingCommitment[] = [
  { id: "1", name: "Rent", amount: 25000, dueDate: "Dec 28", type: "bill" },
  { id: "2", name: "Electricity Bill", amount: 2500, dueDate: "Dec 29", type: "bill" },
  { id: "3", name: "Netflix", amount: 649, dueDate: "Jan 1", type: "subscription" },
  { id: "4", name: "Car Loan EMI", amount: 15000, dueDate: "Jan 5", type: "loan" },
  { id: "5", name: "Spotify", amount: 119, dueDate: "Jan 7", type: "subscription" },
];

const initialBankAccounts: BankAccount[] = [
  { id: "1", name: "Primary Savings", bank: "HDFC Bank", type: "savings", balance: 245890, accountNumber: "XXXX4521", color: "from-blue-500 to-blue-600" },
  { id: "2", name: "Salary Account", bank: "ICICI Bank", type: "savings", balance: 78560, accountNumber: "XXXX8934", color: "from-orange-500 to-orange-600" },
  { id: "3", name: "Fixed Deposit", bank: "SBI", type: "fd", balance: 500000, accountNumber: "XXXX2156", color: "from-green-500 to-green-600" },
];

const initialCreditCards: CreditCardType[] = [
  { id: "1", name: "Regalia", bank: "HDFC", lastFour: "4521", limit: 300000, used: 78500, dueDate: "Jan 5", minDue: 7850, color: "from-purple-500 to-purple-600" },
  { id: "2", name: "Amazon Pay", bank: "ICICI", lastFour: "8934", limit: 150000, used: 23400, dueDate: "Jan 10", minDue: 2340, color: "from-yellow-500 to-orange-500" },
];

const initialVaultItems: VaultItem[] = [
  { id: "1", title: "PAN Card", category: "Identity", value: "ABCDE1234F", type: "text", lastUpdated: "Dec 15, 2024" },
  { id: "2", title: "Aadhaar Card", category: "Identity", value: "XXXX XXXX 1234", type: "text", lastUpdated: "Dec 15, 2024" },
  { id: "3", title: "Passport", category: "Travel", value: "A1234567", type: "text", lastUpdated: "Nov 20, 2024" },
  { id: "4", title: "Insurance Policy", category: "Documents", value: "POL-12345678", type: "document", documentName: "insurance_policy.pdf", lastUpdated: "Oct 5, 2024" },
];

const initialInvestments: Investment[] = [
  { id: "1", name: "Axis Bluechip Fund", type: "mutual_fund", invested: 200000, current: 245000, returns: 22.5, color: "hsl(270, 60%, 55%)" },
  { id: "2", name: "HDFC Mid-Cap Fund", type: "mutual_fund", invested: 150000, current: 172500, returns: 15, color: "hsl(280, 70%, 60%)" },
  { id: "3", name: "Reliance Industries", type: "stock", invested: 100000, current: 118000, returns: 18, color: "hsl(160, 60%, 45%)" },
  { id: "4", name: "TCS", type: "stock", invested: 75000, current: 82500, returns: 10, color: "hsl(35, 90%, 55%)" },
  { id: "5", name: "PPF Account", type: "ppf", invested: 500000, current: 580000, returns: 7.1, color: "hsl(200, 70%, 50%)" },
  { id: "6", name: "NPS Tier 1", type: "nps", invested: 300000, current: 345000, returns: 15, color: "hsl(270, 40%, 70%)" },
];

const initialSIPs: SIP[] = [
  { id: "1", name: "Axis Bluechip Fund", amount: 10000, frequency: "Monthly", nextDate: "Jan 5", totalInvested: 120000 },
  { id: "2", name: "HDFC Mid-Cap Fund", amount: 5000, frequency: "Monthly", nextDate: "Jan 10", totalInvested: 60000 },
  { id: "3", name: "PPF Contribution", amount: 12500, frequency: "Monthly", nextDate: "Jan 1", totalInvested: 150000 },
];

const initialCategories: Category[] = [
  { id: "1", name: "Salary", type: "income", count: 12, color: "bg-success" },
  { id: "2", name: "Freelance", type: "income", count: 8, color: "bg-accent" },
  { id: "3", name: "Housing", type: "expense", count: 12, color: "bg-primary" },
  { id: "4", name: "Food & Dining", type: "expense", count: 45, color: "bg-warning" },
  { id: "5", name: "Shopping", type: "expense", count: 23, color: "bg-destructive" },
  { id: "6", name: "Transport", type: "expense", count: 34, color: "bg-muted-foreground" },
  { id: "7", name: "Entertainment", type: "expense", count: 18, color: "bg-accent" },
  { id: "8", name: "Utilities", type: "expense", count: 12, color: "bg-primary" },
];

const initialAutomationRules: AutomationRule[] = [
  { id: "1", name: "Auto-categorize Amazon", description: "Categorize Amazon transactions as Shopping", enabled: true },
  { id: "2", name: "Salary Detection", description: "Auto-tag monthly salary credits", enabled: true },
  { id: "3", name: "Recurring Bill Alert", description: "Notify 3 days before due date", enabled: true },
  { id: "4", name: "Budget Warning", description: "Alert when 80% budget consumed", enabled: false },
];

// ============ Hook ============
export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(initialBudgetCategories);
  const [commitments, setCommitments] = useState<UpcomingCommitment[]>(initialCommitments);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>(initialCreditCards);
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
