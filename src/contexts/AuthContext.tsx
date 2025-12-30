import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api, { setTokens, clearTokens, getAccessToken } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  memberSince: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyMasterPassword: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "financeflow_auth";
const MASTER_PASSWORD = "1234"; // Demo master password for vault actions

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get queryClient - must be called unconditionally at top level
  // QueryClientProvider wraps AuthProvider in App.tsx, so this should work
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for existing session - try to get user from API
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const response = await api.auth.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Only clear tokens if it's an auth error (401), not rate limit (429)
            // Rate limit errors will be handled by retry logic
            // If it's a rate limit, keep the token and preserve any existing user state
            // The API service will retry automatically
            const isRateLimit = response.error && 
              (response.error.includes('Too many requests') || 
               response.error.includes('rate limit'));
            
            if (!isRateLimit) {
              // Only clear tokens for non-rate-limit errors
              clearTokens();
              setUser(null);
            }
            // If rate limited, keep token and user state - let retry logic handle it
          }
        } catch (error) {
          // Only clear tokens on network errors, not rate limits
          // Rate limits are handled by retry logic in API service
          const isRateLimit = error instanceof Error && 
            (error.message.includes('Too many requests') || 
             error.message.includes('rate limit'));
          
          if (!isRateLimit) {
            clearTokens();
            setUser(null);
          }
          // If rate limited, keep token and user state - let retry logic handle it
        }
      } else {
        // No token, ensure user is null
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for custom event when tokens are cleared by API service
    const handleTokensCleared = () => {
      setUser(null);
    };

    window.addEventListener('tokensCleared', handleTokensCleared);

    return () => {
      window.removeEventListener('tokensCleared', handleTokensCleared);
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: "Please enter email and password" };
    }

    try {
      const response = await api.auth.login(email, password);
      
      if (response.success && response.data) {
        // Store tokens
        if (response.data.accessToken && response.data.refreshToken) {
          setTokens(response.data.accessToken, response.data.refreshToken);
        }
        
        // Set user
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        return { success: true };
      } else {
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Login failed. Please try again." 
      };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!name || !email || !password) {
      return { success: false, error: "Please fill in all fields" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    try {
      const response = await api.auth.signup(name, email, password);
      
      if (response.success && response.data) {
        // Store tokens
        if (response.data.accessToken && response.data.refreshToken) {
          setTokens(response.data.accessToken, response.data.refreshToken);
        }
        
        // Set user
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        return { success: true };
      } else {
        return { success: false, error: response.error || "Signup failed" };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Signup failed. Please try again." 
      };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearTokens();
      // Clear all localStorage data
      localStorage.removeItem('financeflow_setup_dismissed');
      // Clear React Query cache to remove all cached data
      queryClient.clear();
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      // Update locally immediately for better UX
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Sync with backend in background
      api.auth.updateProfile(updates).then((response) => {
        if (response.success && response.data) {
          setUser(response.data);
        }
      }).catch(() => {
        // Keep local update if API fails
      });
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentPassword || !newPassword) {
      return { success: false, error: "Please fill in all fields" };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters" };
    }

    try {
      const response = await api.auth.changePassword(currentPassword, newPassword);
      return { 
        success: response.success, 
        error: response.error 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to change password" 
      };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email) {
      return { success: false, error: "Please enter your email" };
    }

    try {
      const response = await api.auth.resetPassword(email);
      return { 
        success: response.success, 
        error: response.error 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to send reset email" 
      };
    }
  };

  const verifyMasterPassword = (password: string): boolean => {
    return password === MASTER_PASSWORD;
  };

  // Consider user authenticated if they have a token OR if user data is loaded
  // This prevents logout on rate-limited auth checks
  const isAuthenticated = !!user || (!!getAccessToken() && !isLoading);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        changePassword,
        resetPassword,
        verifyMasterPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
