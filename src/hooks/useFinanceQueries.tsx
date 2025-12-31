import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getAccessToken } from "@/services/api";
import { toast } from "sonner";
import { 
  Transaction, 
  BankAccount, 
  CreditCardType, 
  DebitCardType, 
  BudgetCategory, 
  UpcomingCommitment, 
  VaultItem, 
  Investment, 
  SIP, 
  Category,
  categoryIcons 
} from "./useFinanceData";
import { format, parseISO, isToday, isYesterday } from "date-fns";

// Helper to check if user is authenticated
const isAuthenticated = () => {
  return !!getAccessToken();
};

// Helper to create query options with rate limit and auth error handling
const createQueryOptions = (staleTime = 5 * 60 * 1000) => ({
  retry: (failureCount: number, error: any) => {
    // Don't retry rate limit errors - API service handles retries
    if (error?.message === 'RATE_LIMIT' || error?.message?.includes('Too many requests')) {
      return false;
    }
    // Don't retry on 401/auth errors - tokens will be cleared and user redirected
    if (error?.message?.includes('Session expired') || 
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('Please login')) {
      return false;
    }
    return failureCount < 1;
  },
  staleTime,
  enabled: isAuthenticated(),
});

// Query keys
export const queryKeys = {
  transactions: ['transactions'] as const,
  accounts: ['accounts'] as const,
  creditCards: ['creditCards'] as const,
  debitCards: ['debitCards'] as const,
  budgets: ['budgets'] as const,
  commitments: ['commitments'] as const,
  investments: ['investments'] as const,
  sips: ['sips'] as const,
  vault: ['vault'] as const,
  categories: ['categories'] as const,
  dashboard: ['analytics', 'dashboard'] as const,
  cashFlow: ['analytics', 'cashFlow'] as const,
  categorySpend: ['analytics', 'categorySpend'] as const,
  spendType: ['analytics', 'spendType'] as const,
  insights: ['analytics', 'insights'] as const,
};

// Transform backend transaction to frontend format
function transformTransaction(backendTx: any): Transaction {
  const date = backendTx.date ? parseISO(backendTx.date) : new Date();
  let dateStr: string;
  if (isToday(date)) {
    dateStr = "Today";
  } else if (isYesterday(date)) {
    dateStr = "Yesterday";
  } else {
    dateStr = format(date, "MMM d, yyyy");
  }

  const categoryName = backendTx.category?.name || "Uncategorized";
  const accountName = backendTx.account 
    ? `${backendTx.account.bank} ${backendTx.account.name}`
    : backendTx.creditCard
    ? `${backendTx.creditCard.bank} ${backendTx.creditCard.name}`
    : "Unknown";

  return {
    id: backendTx.id,
    type: backendTx.type as "income" | "expense",
    category: categoryName,
    description: backendTx.description,
    amount: Number(backendTx.amount),
    date: dateStr,
    isRecurring: false, // Will be handled separately if needed
    account: accountName,
    icon: categoryIcons[categoryName] || categoryIcons.default,
  };
}

// Transform backend account to frontend format
function transformAccount(backendAccount: any): BankAccount {
  return {
    id: backendAccount.id,
    name: backendAccount.name,
    bank: backendAccount.bank,
    type: backendAccount.type as "savings" | "current" | "fd",
    balance: Number(backendAccount.balance),
    accountNumber: backendAccount.accountNumber || "XXXX",
    color: backendAccount.color || "from-blue-500 to-blue-600",
  };
}

// Transform backend credit card to frontend format
function transformCreditCard(backendCard: any): CreditCardType {
  // Calculate used amount from transactions or use provided value
  const used = backendCard.used !== undefined 
    ? Number(backendCard.used) 
    : Number(backendCard.limit) * 0.3; // Default estimate

  // Backend stores dueDate as number (1-31), convert to formatted string for display
  const dueDateNum = backendCard.dueDate || 15; // Default to 15th if not provided
  const dueDateFormatted = format(new Date(2024, 0, dueDateNum), "MMM d");

  return {
    id: backendCard.id,
    name: backendCard.name,
    bank: backendCard.bank,
    lastFour: backendCard.lastFour,
    limit: Number(backendCard.limit),
    used: used,
    dueDate: dueDateFormatted, // Format as "Jan 15" for display
    dueDateDay: dueDateNum, // Store numeric day for calculations
    minDue: Number(backendCard.minDue || backendCard.limit * 0.05),
    color: backendCard.color || "from-purple-500 to-purple-600",
  };
}

// Transform backend debit card to frontend format
function transformDebitCard(backendCard: any, accounts: BankAccount[]): DebitCardType {
  const linkedAccount = accounts.find(a => a.id === backendCard.linkedAccountId);
  
  return {
    id: backendCard.id,
    name: backendCard.name,
    bank: backendCard.bank,
    lastFour: backendCard.lastFour,
    linkedAccount: linkedAccount?.name || "Unknown Account",
    cardNetwork: backendCard.cardNetwork as "Visa" | "Mastercard" | "RuPay",
    expiryDate: backendCard.expiryDate || "12/27",
    isActive: backendCard.isActive ?? true,
    color: backendCard.color || "from-blue-500 to-blue-600",
  };
}

// Transform backend budget to frontend format
function transformBudget(backendBudget: any): BudgetCategory {
  return {
    id: backendBudget.id,
    name: backendBudget.category?.name || "Uncategorized",
    icon: categoryIcons[backendBudget.category?.name || "default"] || categoryIcons.default,
    budget: Number(backendBudget.amount),
    spent: Number(backendBudget.spent || 0),
    color: backendBudget.category?.color || "#3b82f6",
  };
}

// Transform backend commitment to frontend format
function transformCommitment(backendCommitment: any): UpcomingCommitment {
  return {
    id: backendCommitment.id,
    name: backendCommitment.name,
    amount: Number(backendCommitment.amount),
    dueDate: format(parseISO(backendCommitment.dueDate), "MMM d, yyyy"),
    type: backendCommitment.type as "bill" | "subscription" | "loan",
  };
}

// Transform backend vault item to frontend format
function transformVaultItem(backendItem: any): VaultItem {
  return {
    id: backendItem.id,
    title: backendItem.title,
    category: backendItem.category,
    value: backendItem.value || "••••••••",
    type: backendItem.type as "text" | "document",
    documentUrl: backendItem.documentUrl,
    documentName: backendItem.documentName,
    lastUpdated: format(parseISO(backendItem.updatedAt || backendItem.createdAt), "MMM d, yyyy"),
  };
}

// Transform backend investment to frontend format
function transformInvestment(backendInvestment: any): Investment {
  const invested = Number(backendInvestment.invested);
  const current = Number(backendInvestment.currentValue);
  const returns = current - invested;

  return {
    id: backendInvestment.id,
    name: backendInvestment.name,
    type: backendInvestment.type as "mutual_fund" | "stock" | "sip" | "ppf" | "nps",
    invested: invested,
    current: current,
    returns: returns,
    color: backendInvestment.color || "#3b82f6",
  };
}

// Transform backend SIP to frontend format
function transformSIP(backendSIP: any): SIP {
  return {
    id: backendSIP.id,
    name: backendSIP.name,
    amount: Number(backendSIP.amount),
    frequency: backendSIP.frequency,
    nextDate: format(parseISO(backendSIP.nextDate), "MMM d, yyyy"),
    totalInvested: Number(backendSIP.totalInvested || 0),
  };
}

// Transform backend category to frontend format
function transformCategory(backendCategory: any): Category {
  return {
    id: backendCategory.id,
    name: backendCategory.name,
    type: backendCategory.type as "income" | "expense",
    count: 0, // Will be calculated from transactions
    color: backendCategory.color || "#3b82f6",
  };
}

// Hook for transactions
export function useTransactions(filters?: { type?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...queryKeys.transactions, filters],
    queryFn: async () => {
      const response = await api.transactions.getAll(filters);
      if (!response.success || !response.data) {
        // Don't throw for rate limit errors - let React Query handle it
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch transactions");
      }
      return (response.data as any[]).map(transformTransaction);
    },
    ...createQueryOptions(2 * 60 * 1000), // 2 minutes - transactions change frequently
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Transaction, "id">) => {
      // Find category ID from name
      const categories = queryClient.getQueryData<Category[]>(queryKeys.categories) || [];
      const category = categories.find(c => c.name === data.category);
      
      // Find account ID from name - check both bank accounts and credit cards
      const accounts = queryClient.getQueryData<BankAccount[]>(queryKeys.accounts) || [];
      const creditCards = queryClient.getQueryData<CreditCardType[]>(queryKeys.creditCards) || [];
      
      // Try to match bank account first
      const account = accounts.find(a => 
        data.account.includes(a.bank) && data.account.includes(a.name)
      );
      
      // If not found, try to match credit card (format: "{bank} {name} (Credit Card)")
      const creditCard = !account ? creditCards.find(c => 
        data.account.includes(c.bank) && data.account.includes(c.name)
      ) : null;

      // Handle date - convert "Today", "Yesterday", or date string to ISO
      let transactionDate: Date;
      if (data.date === "Today") {
        transactionDate = new Date();
      } else if (data.date === "Yesterday") {
        transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - 1);
      } else {
        // Try to parse the date string
        transactionDate = new Date(data.date);
        if (isNaN(transactionDate.getTime())) {
          transactionDate = new Date(); // Fallback to today
        }
      }

      const payload: any = {
        type: data.type,
        description: data.description,
        amount: data.amount,
        date: transactionDate.toISOString(),
      };

      if (category) payload.categoryId = category.id;
      if (account) payload.accountId = account.id;
      else if (creditCard) payload.creditCardId = creditCard.id;

      const response = await api.transactions.create(payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create transaction");
      }
      return transformTransaction(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashFlow });
      queryClient.invalidateQueries({ queryKey: queryKeys.categorySpend });
      queryClient.invalidateQueries({ queryKey: queryKeys.spendType });
      queryClient.invalidateQueries({ queryKey: queryKeys.insights });
      toast.success("Transaction added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Transaction> }) => {
      const payload: any = {};
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.type !== undefined) payload.type = updates.type;

      const response = await api.transactions.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update transaction");
      }
      return transformTransaction(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashFlow });
      queryClient.invalidateQueries({ queryKey: queryKeys.categorySpend });
      queryClient.invalidateQueries({ queryKey: queryKeys.spendType });
      queryClient.invalidateQueries({ queryKey: queryKeys.insights });
      toast.success("Transaction updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.transactions.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete transaction");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashFlow });
      queryClient.invalidateQueries({ queryKey: queryKeys.categorySpend });
      queryClient.invalidateQueries({ queryKey: queryKeys.spendType });
      queryClient.invalidateQueries({ queryKey: queryKeys.insights });
      toast.success("Transaction deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete transaction");
    },
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addTransaction: createMutation.mutate,
    updateTransaction: (id: string, updates: Partial<Transaction>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteTransaction: deleteMutation.mutate,
  };
}

// Hook for accounts
export function useAccounts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () => {
      const response = await api.accounts.getAll();
      if (!response.success || !response.data) {
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch accounts");
      }
      return (response.data as any[]).map(transformAccount);
    },
    ...createQueryOptions(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<BankAccount, "id">) => {
      const response = await api.accounts.create({
        name: data.name,
        bank: data.bank,
        type: data.type as string, // Send as string
        balance: data.balance,
        accountNumber: data.accountNumber,
        color: data.color,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create account");
      }
      return transformAccount(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Account added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BankAccount> }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.bank !== undefined) payload.bank = updates.bank;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.balance !== undefined) payload.balance = updates.balance;
      if (updates.accountNumber !== undefined) payload.accountNumber = updates.accountNumber;

      const response = await api.accounts.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update account");
      }
      return transformAccount(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Account updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update account");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.accounts.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete account");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Account deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });

  return {
    bankAccounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addBankAccount: createMutation.mutate,
    updateBankAccount: (id: string, updates: Partial<BankAccount>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteBankAccount: deleteMutation.mutate,
  };
}

// Hook for credit cards
export function useCreditCards() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.creditCards,
    queryFn: async () => {
      const response = await api.creditCards.getAll();
      if (!response.success || !response.data) {
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch credit cards");
      }
      return (response.data as any[]).map(transformCreditCard);
    },
    ...createQueryOptions(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<CreditCardType, "id">) => {
      // Convert dueDate to number if it's a string (from modal)
      const dueDateNum = typeof data.dueDate === 'string' 
        ? parseInt(data.dueDate, 10) 
        : data.dueDate;
      
      const response = await api.creditCards.create({
        name: data.name,
        bank: data.bank,
        lastFour: data.lastFour,
        limit: data.limit,
        dueDate: dueDateNum, // Send as number (1-31)
        minDue: data.minDue,
        color: data.color, // Include color
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create credit card");
      }
      return transformCreditCard(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Credit card added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create credit card");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreditCardType> }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.bank !== undefined) payload.bank = updates.bank;
      if (updates.lastFour !== undefined) payload.lastFour = updates.lastFour;
      if (updates.limit !== undefined) payload.limit = updates.limit;
      if (updates.dueDate !== undefined) {
        // Convert dueDate to number if it's a string
        payload.dueDate = typeof updates.dueDate === 'string' 
          ? parseInt(updates.dueDate, 10) 
          : updates.dueDate;
      }
      if (updates.minDue !== undefined) payload.minDue = updates.minDue;
      if (updates.color !== undefined) payload.color = updates.color;

      const response = await api.creditCards.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update credit card");
      }
      return transformCreditCard(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Credit card updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update credit card");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.creditCards.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete credit card");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Credit card deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete credit card");
    },
  });

  return {
    creditCards: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addCreditCard: createMutation.mutate,
    updateCreditCard: (id: string, updates: Partial<CreditCardType>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteCreditCard: deleteMutation.mutate,
  };
}

// Hook for debit cards
export function useDebitCards() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.debitCards,
    queryFn: async () => {
      const response = await api.debitCards.getAll();
      if (!response.success || !response.data) {
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch debit cards");
      }
      // Get accounts from cache
      const bankAccounts = queryClient.getQueryData<BankAccount[]>(queryKeys.accounts) || [];
      return (response.data as any[]).map(card => transformDebitCard(card, bankAccounts));
    },
    ...createQueryOptions(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<DebitCardType, "id">) => {
      // Get accounts from cache
      const bankAccounts = queryClient.getQueryData<BankAccount[]>(queryKeys.accounts) || [];
      // Find linked account ID - match by name or by "bank name" format
      const account = bankAccounts.find(a => {
        const accountDisplayName = `${a.bank} ${a.name}`;
        return a.name === data.linkedAccount || accountDisplayName === data.linkedAccount;
      });
      
      if (!account && data.linkedAccount) {
        throw new Error(`Account "${data.linkedAccount}" not found. Please create the account first.`);
      }
      
      const response = await api.debitCards.create({
        name: data.name,
        bank: data.bank,
        lastFour: data.lastFour,
        linkedAccountId: account?.id,
        linkedAccount: data.linkedAccount, // Also send name for backend lookup fallback
        cardNetwork: data.cardNetwork,
        expiryDate: data.expiryDate,
        isActive: data.isActive,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create debit card");
      }
      return transformDebitCard(response.data, bankAccounts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debitCards });
      toast.success("Debit card added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create debit card");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DebitCardType> }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.bank !== undefined) payload.bank = updates.bank;
      if (updates.lastFour !== undefined) payload.lastFour = updates.lastFour;
      if (updates.cardNetwork !== undefined) payload.cardNetwork = updates.cardNetwork;
      if (updates.expiryDate !== undefined) payload.expiryDate = updates.expiryDate;
      if (updates.isActive !== undefined) payload.isActive = updates.isActive;
      if (updates.linkedAccount !== undefined) {
        const bankAccounts = queryClient.getQueryData<BankAccount[]>(queryKeys.accounts) || [];
        const account = bankAccounts.find(a => {
          const accountDisplayName = `${a.bank} ${a.name}`;
          return a.name === updates.linkedAccount || accountDisplayName === updates.linkedAccount;
        });
        if (account) {
          payload.linkedAccountId = account.id;
          payload.linkedAccount = updates.linkedAccount; // Also send name for backend lookup
        }
      }

      const response = await api.debitCards.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update debit card");
      }
      // Get accounts from cache
      const bankAccounts = queryClient.getQueryData<BankAccount[]>(queryKeys.accounts) || [];
      return transformDebitCard(response.data, bankAccounts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debitCards });
      toast.success("Debit card updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update debit card");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.debitCards.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete debit card");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debitCards });
      toast.success("Debit card deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete debit card");
    },
  });

  return {
    debitCards: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addDebitCard: createMutation.mutate,
    updateDebitCard: (id: string, updates: Partial<DebitCardType>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteDebitCard: deleteMutation.mutate,
  };
}

// Hook for budgets
export function useBudgets() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.budgets,
    queryFn: async () => {
      const response = await api.budgets.getAll();
      if (!response.success || !response.data) {
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch budgets");
      }
      return (response.data as any[]).map(transformBudget);
    },
    ...createQueryOptions(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<BudgetCategory, "id">) => {
      // Find category ID from name
      const categories = queryClient.getQueryData<Category[]>(queryKeys.categories) || [];
      const category = categories.find(c => c.name === data.name && c.type === "expense");
      
      const response = await api.budgets.create({
        categoryId: category?.id || "",
        amount: data.budget,
        period: "monthly",
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create budget");
      }
      return transformBudget(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Budget added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create budget");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BudgetCategory> }) => {
      const payload: any = {};
      if (updates.budget !== undefined) payload.amount = updates.budget;

      const response = await api.budgets.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update budget");
      }
      return transformBudget(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Budget updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update budget");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.budgets.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete budget");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Budget deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete budget");
    },
  });

  return {
    budgetCategories: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addBudgetCategory: createMutation.mutate,
    updateBudgetCategory: (id: string, updates: Partial<BudgetCategory>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteBudgetCategory: deleteMutation.mutate,
  };
}

// Hook for commitments
export function useCommitments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.commitments,
    queryFn: async () => {
      const response = await api.commitments.getUpcoming();
      if (!response.success || !response.data) {
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch commitments");
      }
      return (response.data as any[]).map(transformCommitment);
    },
    ...createQueryOptions(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<UpcomingCommitment, "id">) => {
      const dueDate = new Date(data.dueDate);
      const response = await api.commitments.create({
        name: data.name,
        amount: data.amount,
        dueDate: dueDate.toISOString(),
        type: data.type,
        isRecurring: false,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create commitment");
      }
      return transformCommitment(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commitments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Commitment added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create commitment");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UpcomingCommitment> }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.dueDate !== undefined) {
        payload.dueDate = new Date(updates.dueDate).toISOString();
      }
      if (updates.type !== undefined) payload.type = updates.type;

      const response = await api.commitments.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update commitment");
      }
      return transformCommitment(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commitments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Commitment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update commitment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.commitments.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete commitment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commitments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Commitment deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete commitment");
    },
  });

  return {
    commitments: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addCommitment: createMutation.mutate,
    updateCommitment: (id: string, updates: Partial<UpcomingCommitment>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteCommitment: deleteMutation.mutate,
  };
}

// Hook for vault
export function useVault() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.vault,
    queryFn: async () => {
      const response = await api.vault.getAll();
      if (!response.success || !response.data) {
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch vault items");
      }
      return (response.data as any[]).map(transformVaultItem);
    },
    ...createQueryOptions(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<VaultItem, "id">) => {
      const response = await api.vault.create({
        title: data.title,
        category: data.category,
        value: data.value,
        type: data.type,
        documentUrl: data.documentUrl,
        documentName: data.documentName,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create vault item");
      }
      return transformVaultItem(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault });
      toast.success("Item added to vault");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create vault item");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VaultItem> }) => {
      const payload: any = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.value !== undefined) payload.value = updates.value;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.documentUrl !== undefined) payload.documentUrl = updates.documentUrl;
      if (updates.documentName !== undefined) payload.documentName = updates.documentName;

      const response = await api.vault.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update vault item");
      }
      return transformVaultItem(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault });
      toast.success("Vault item updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vault item");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.vault.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete vault item");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vault });
      toast.success("Item removed from vault");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete vault item");
    },
  });

  return {
    vaultItems: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addVaultItem: createMutation.mutate,
    updateVaultItem: (id: string, updates: Partial<VaultItem>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteVaultItem: deleteMutation.mutate,
  };
}

// Hook for investments
export function useInvestments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.investments,
    queryFn: async () => {
      const response = await api.investments.getAll();
      if (!response.success || !response.data) {
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch investments");
      }
      return (response.data as any[]).map(transformInvestment);
    },
    ...createQueryOptions(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Investment, "id">) => {
      const response = await api.investments.create({
        name: data.name,
        type: data.type,
        invested: data.invested,
        currentValue: data.current,
        color: data.color,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create investment");
      }
      return transformInvestment(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Investment added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create investment");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Investment> }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.invested !== undefined) payload.invested = updates.invested;
      if (updates.current !== undefined) payload.currentValue = updates.current;
      if (updates.color !== undefined) payload.color = updates.color;

      const response = await api.investments.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update investment");
      }
      return transformInvestment(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Investment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update investment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.investments.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete investment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Investment deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete investment");
    },
  });

  return {
    investments: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addInvestment: createMutation.mutate,
    updateInvestment: (id: string, updates: Partial<Investment>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteInvestment: deleteMutation.mutate,
  };
}

// Hook for SIPs
export function useSIPs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.sips,
    queryFn: async () => {
      const response = await api.sips.getAll();
      if (!response.success || !response.data) {
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch SIPs");
      }
      return (response.data as any[]).map(transformSIP);
    },
    ...createQueryOptions(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<SIP, "id">) => {
      const nextDate = new Date(data.nextDate);
      const startDate = new Date(data.nextDate); // Use nextDate as startDate if not provided
      
      const response = await api.sips.create({
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        startDate: startDate.toISOString(),
        nextDate: nextDate.toISOString(),
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create SIP");
      }
      return transformSIP(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sips });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("SIP added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create SIP");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SIP> }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.frequency !== undefined) payload.frequency = updates.frequency;
      if (updates.nextDate !== undefined) {
        payload.nextDate = new Date(updates.nextDate).toISOString();
      }

      const response = await api.sips.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update SIP");
      }
      return transformSIP(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sips });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("SIP updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update SIP");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.sips.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete SIP");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sips });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("SIP deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete SIP");
    },
  });

  return {
    sips: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addSIP: createMutation.mutate,
    updateSIP: (id: string, updates: Partial<SIP>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteSIP: deleteMutation.mutate,
  };
}

// Hook for categories
export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const response = await api.categories.getAll();
      if (!response.success || !response.data) {
        if (response.error?.includes('Too many requests')) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(response.error || "Failed to fetch categories");
      }
      return (response.data as any[]).map(transformCategory);
    },
    ...createQueryOptions(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Category, "id">) => {
      const response = await api.categories.create({
        name: data.name,
        type: data.type,
        color: data.color,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create category");
      }
      return transformCategory(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success("Category added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.color !== undefined) payload.color = updates.color;

      const response = await api.categories.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update category");
      }
      return transformCategory(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.categories.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete category");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success("Category deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addCategory: createMutation.mutate,
    updateCategory: (id: string, updates: Partial<Category>) => {
      updateMutation.mutate({ id, updates });
    },
    deleteCategory: deleteMutation.mutate,
  };
}

