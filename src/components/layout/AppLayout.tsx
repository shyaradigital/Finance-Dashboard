import { ReactNode, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  Target, 
  Building2, 
  TrendingUp, 
  Settings,
  Plus,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import QuickActionMenu from "./QuickActionMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/FinanceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/transactions", icon: ArrowUpDown, label: "Transactions" },
  { path: "/budget", icon: Target, label: "Budget" },
  { path: "/accounts", icon: Building2, label: "Accounts" },
  { path: "/investments", icon: TrendingUp, label: "Investments" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { bankAccounts, investments } = useFinance();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Calculate Net Worth from accounts and investments
  const totalAccountBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.current, 0);
  const netWorth = totalAccountBalance + totalInvestmentValue;

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate("/auth");
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">FinanceFlow</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-border p-4">
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <p className="text-xs font-medium text-muted-foreground">Net Worth</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                ₹{netWorth.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">FinanceFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm">
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <nav 
            className="absolute right-0 top-16 w-64 bg-card border-l border-border h-[calc(100vh-4rem)] p-4 animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="min-h-screen pt-16 lg:pt-0">
          {/* Desktop Header */}
          <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-8 lg:flex">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {navItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0 bg-gradient-to-br from-primary to-accent text-primary-foreground font-medium hover:opacity-90">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium text-foreground">{user?.name || "Guest"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || "guest@example.com"}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("Help center coming soon")}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <QuickActionMenu 
        isOpen={isQuickActionOpen} 
        onToggle={() => setIsQuickActionOpen(!isQuickActionOpen)} 
      />
    </div>
  );
}
