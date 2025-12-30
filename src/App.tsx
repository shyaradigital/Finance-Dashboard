import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Accounts from "./pages/Accounts";
import Investments from "./pages/Investments";
import SettingsPage from "./pages/Settings";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 429 errors - they're handled by API service retry logic
        if (error?.response?.status === 429 || error?.message?.includes('Too many requests')) {
          return false;
        }
        // Don't retry on 401/auth errors - tokens will be cleared and user redirected
        if (error?.response?.status === 401 || 
            error?.message?.includes('Session expired') || 
            error?.message?.includes('Unauthorized') ||
            error?.message?.includes('Please login')) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - keep data in cache longer
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// Layout wrapper for authenticated routes
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <AppLayout>{children}</AppLayout>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <FinanceProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout><Dashboard /></AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/transactions" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout><Transactions /></AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/budget" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout><Budget /></AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/accounts" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout><Accounts /></AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/investments" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout><Investments /></AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout><SettingsPage /></AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout><Profile /></AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="*" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout><NotFound /></AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </BrowserRouter>
          </FinanceProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
