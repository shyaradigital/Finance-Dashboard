import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Accounts from "./pages/Accounts";
import Investments from "./pages/Investments";
import SettingsPage from "./pages/Settings";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                <Route path="/" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
                <Route path="/transactions" element={<AuthenticatedLayout><Transactions /></AuthenticatedLayout>} />
                <Route path="/budget" element={<AuthenticatedLayout><Budget /></AuthenticatedLayout>} />
                <Route path="/accounts" element={<AuthenticatedLayout><Accounts /></AuthenticatedLayout>} />
                <Route path="/investments" element={<AuthenticatedLayout><Investments /></AuthenticatedLayout>} />
                <Route path="/settings" element={<AuthenticatedLayout><SettingsPage /></AuthenticatedLayout>} />
                <Route path="/profile" element={<AuthenticatedLayout><Profile /></AuthenticatedLayout>} />
                <Route path="*" element={<AuthenticatedLayout><NotFound /></AuthenticatedLayout>} />
              </Routes>
            </BrowserRouter>
          </FinanceProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
