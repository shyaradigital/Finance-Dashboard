// API Client Service
// Handles all API communication with the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'financeflow_access_token';
const REFRESH_TOKEN_KEY = 'financeflow_refresh_token';

// Get stored tokens
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Store tokens
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Clear tokens
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Dispatch custom event to notify AuthContext
  window.dispatchEvent(new CustomEvent('tokensCleared'));
};

// API Response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Request options
interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Make API request with retry logic for rate limits
async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {},
  retryCount = 0
): Promise<ApiResponse<T>> {
  const { requireAuth = true, ...fetchOptions } = options;
  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 1000; // 1 second
  
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add authorization header if required
  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 429 Too Many Requests - retry with exponential backoff
    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const retryAfter = response.headers.get('Retry-After');
      const delayMs = retryAfter 
        ? parseInt(retryAfter) * 1000 
        : INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      
      await delay(delayMs);
      return request<T>(endpoint, options, retryCount + 1);
    }

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requireAuth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        const newToken = getAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers,
          });
          return handleResponse<T>(retryResponse);
        }
      }
      // If refresh failed, clear tokens and throw error
      clearTokens();
      throw new Error('Session expired. Please login again.');
    }

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

// Handle API response
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    // Special handling for 429 - don't treat as fatal error
    if (response.status === 429) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (isJson) {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } else {
      errorMessage = response.statusText || errorMessage;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }

  if (isJson) {
    const data = await response.json();
    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  }

  return {
    success: true,
  };
}

// Refresh access token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data?.accessToken) {
        setTokens(data.data.accessToken, refreshToken);
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// API Methods
export const api = {
  // Auth endpoints
  auth: {
    signup: async (name: string, email: string, password: string) => {
      return request('/auth/signup', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify({ name, email, password }),
      });
    },

    login: async (email: string, password: string) => {
      return request('/auth/login', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify({ email, password }),
      });
    },

    logout: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
      clearTokens();
    },

    getMe: async () => {
      return request('/auth/me');
    },

    updateProfile: async (updates: { name?: string; avatar?: string }) => {
      return request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      return request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    resetPassword: async (email: string) => {
      return request('/auth/reset-password', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify({ email }),
      });
    },

    deleteAccount: async (password: string) => {
      return request('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
    },
  },

  // Transactions
  transactions: {
    getAll: async (filters?: { type?: string; categoryId?: string; accountId?: string; startDate?: string; endDate?: string }) => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.accountId) params.append('accountId', filters.accountId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      const query = params.toString();
      return request(`/transactions${query ? `?${query}` : ''}`);
    },

    getById: async (id: string) => {
      return request(`/transactions/${id}`);
    },

    create: async (data: { type: string; categoryId?: string; description: string; amount: number; date: string | Date; accountId?: string; creditCardId?: string; notes?: string }) => {
      return request('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ type: string; categoryId?: string; description: string; amount: number; date: string | Date; accountId?: string; creditCardId?: string; notes?: string }>) => {
      return request(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/transactions/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Accounts
  accounts: {
    getAll: async () => {
      return request('/accounts');
    },

    getById: async (id: string) => {
      return request(`/accounts/${id}`);
    },

    create: async (data: { name: string; bank: string; type: string; balance: number; accountNumber?: string }) => {
      return request('/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ name: string; bank: string; type: string; balance: number; accountNumber?: string }>) => {
      return request(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/accounts/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Credit Cards
  creditCards: {
    getAll: async () => {
      return request('/cards/credit');
    },

    getById: async (id: string) => {
      return request(`/cards/credit/${id}`);
    },

    create: async (data: { name: string; bank: string; lastFour: string; limit: number; dueDate: number; minDue: number; color?: string }) => {
      return request('/cards/credit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ name: string; bank: string; lastFour: string; limit: number; dueDate: number; minDue: number; color?: string }>) => {
      return request(`/cards/credit/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/cards/credit/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Debit Cards
  debitCards: {
    getAll: async () => {
      return request('/cards/debit');
    },

    getById: async (id: string) => {
      return request(`/cards/debit/${id}`);
    },

    create: async (data: { name: string; bank: string; lastFour: string; linkedAccountId: string; cardNetwork: string; expiryDate: string; isActive?: boolean }) => {
      return request('/cards/debit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ name: string; bank: string; lastFour: string; linkedAccountId: string; cardNetwork: string; expiryDate: string; isActive?: boolean }>) => {
      return request(`/cards/debit/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/cards/debit/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Budgets
  budgets: {
    getAll: async () => {
      return request('/budgets');
    },

    getById: async (id: string) => {
      return request(`/budgets/${id}`);
    },

    getSummary: async () => {
      return request('/budgets/summary');
    },

    create: async (data: { categoryId: string; amount: number; period: string }) => {
      return request('/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ categoryId: string; amount: number; period: string }>) => {
      return request(`/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/budgets/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Commitments
  commitments: {
    getAll: async () => {
      return request('/commitments');
    },

    getUpcoming: async () => {
      return request('/commitments/upcoming');
    },

    getById: async (id: string) => {
      return request(`/commitments/${id}`);
    },

    create: async (data: { name: string; amount: number; dueDate: string; type: string; isRecurring?: boolean; frequency?: string; notes?: string }) => {
      return request('/commitments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ name: string; amount: number; dueDate: string; type: string; isRecurring?: boolean; frequency?: string; notes?: string }>) => {
      return request(`/commitments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/commitments/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Investments
  investments: {
    getAll: async () => {
      return request('/investments');
    },

    getSummary: async () => {
      return request('/investments/summary');
    },

    getById: async (id: string) => {
      return request(`/investments/${id}`);
    },

    create: async (data: { name: string; type: string; invested: number; currentValue: number; purchaseDate?: string; color?: string }) => {
      return request('/investments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ name: string; type: string; invested: number; currentValue: number; purchaseDate?: string; color?: string }>) => {
      return request(`/investments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/investments/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // SIPs
  sips: {
    getAll: async () => {
      return request('/investments/sips');
    },

    getUpcoming: async () => {
      return request('/investments/sips/upcoming');
    },

    getById: async (id: string) => {
      return request(`/investments/sips/${id}`);
    },

    create: async (data: { name: string; amount: number; frequency: string; startDate: string; nextDate: string; investmentId?: string }) => {
      return request('/investments/sips', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ name: string; amount: number; frequency: string; startDate: string; nextDate: string; investmentId?: string; isActive?: boolean }>) => {
      return request(`/investments/sips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/investments/sips/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Vault
  vault: {
    getAll: async () => {
      return request('/vault');
    },

    getById: async (id: string) => {
      return request(`/vault/${id}`);
    },

    create: async (data: { title: string; category: string; value: string; type: string; documentUrl?: string; documentName?: string }) => {
      return request('/vault', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ title: string; category: string; value: string; type: string; documentUrl?: string; documentName?: string }>) => {
      return request(`/vault/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/vault/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Categories
  categories: {
    getAll: async () => {
      return request('/categories');
    },

    getById: async (id: string) => {
      return request(`/categories/${id}`);
    },

    create: async (data: { name: string; type: string; color?: string }) => {
      return request('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<{ name: string; type: string; color?: string }>) => {
      return request(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request(`/categories/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Analytics
  analytics: {
    getDashboard: async () => {
      return request('/analytics/dashboard');
    },

    getCashFlow: async (period: 'month' | 'quarter' = 'month') => {
      return request(`/analytics/cash-flow?period=${period}`);
    },

    getCategorySpend: async () => {
      return request('/analytics/category-spend');
    },

    getSpendType: async () => {
      return request('/analytics/spend-type');
    },

    getInsights: async () => {
      return request('/analytics/insights');
    },

    getNetWorth: async () => {
      return request('/analytics/net-worth');
    },
  },

  // Settings endpoints
  settings: {
    getSettings: async () => {
      return request('/settings');
    },

    updateSettings: async (preferences: Record<string, any>) => {
      return request('/settings', {
        method: 'PUT',
        body: JSON.stringify({ preferences }),
      });
    },

    getOptions: async () => {
      return request('/settings/options');
    },

    updateOptions: async (options: {
      investmentTypes?: string[];
      accountTypes?: string[];
      commitmentTypes?: string[];
      sipFrequencies?: string[];
      cardNetworks?: string[];
      vaultCategories?: string[];
    }) => {
      return request('/settings/options', {
        method: 'PUT',
        body: JSON.stringify(options),
      });
    },
  },
};

export default api;

