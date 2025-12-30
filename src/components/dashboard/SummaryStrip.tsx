import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, getAccessToken } from "@/services/api";
import { queryKeys } from "@/hooks/useFinanceQueries";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  variant?: "default" | "income" | "expense" | "savings";
  delay?: number;
}

function SummaryCard({ icon: Icon, label, value, trend, trendType = "neutral", variant = "default", delay = 0 }: SummaryCardProps) {
  const variantStyles = {
    default: "from-primary/5 to-accent/5 border-primary/10",
    income: "from-success/5 to-success/10 border-success/20",
    expense: "from-destructive/5 to-destructive/10 border-destructive/20",
    savings: "from-accent/5 to-primary/5 border-accent/20",
  };

  const iconStyles = {
    default: "from-primary to-accent",
    income: "from-success to-success",
    expense: "from-destructive to-destructive",
    savings: "from-accent to-primary",
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:shadow-md opacity-0 animate-fade-in",
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              "mt-1 text-xs font-medium",
              trendType === "positive" && "text-success",
              trendType === "negative" && "text-destructive",
              trendType === "neutral" && "text-muted-foreground"
            )}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
          iconStyles[variant]
        )}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}

export default function SummaryStrip() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      try {
        const response = await api.analytics.getDashboard();
        if (!response.success || !response.data) {
          // If rate limited, throw error to let React Query handle retry
          if (response.error?.includes('Too many requests')) {
            throw new Error('RATE_LIMIT');
          }
          // For other errors, return zeros
          return {
            netBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            savings: 0,
            savingsRate: 0,
            incomeChange: 0,
            balanceChange: 0,
          };
        }
        return response.data as {
          netBalance: number;
          monthlyIncome: number;
          monthlyExpenses: number;
          savings: number;
          savingsRate: number;
          incomeChange: number;
          balanceChange: number;
        };
      } catch (err) {
        // Re-throw rate limit errors
        if (err instanceof Error && err.message === 'RATE_LIMIT') {
          throw err;
        }
        // For other errors, return zeros
        return {
          netBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          savings: 0,
          savingsRate: 0,
          incomeChange: 0,
          balanceChange: 0,
        };
      }
    },
    enabled: !!getAccessToken(),
    retry: (failureCount, error: any) => {
      if (error?.message === 'RATE_LIMIT') {
        return false; // API service handles retries
      }
      return failureCount < 1;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const formatTrend = (change: number, isPositive: boolean) => {
    if (change === 0) return undefined;
    const sign = change > 0 ? "+" : "";
    const percent = Math.abs(change).toFixed(1);
    return `${sign}${percent}% vs last month`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl border bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const data = dashboardData || {
    netBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
    savingsRate: 0,
    incomeChange: 0,
    balanceChange: 0,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        icon={Wallet}
        label="Net Balance"
        value={formatCurrency(data.netBalance)}
        trend={formatTrend(data.balanceChange, data.balanceChange >= 0)}
        trendType={data.balanceChange >= 0 ? "positive" : "negative"}
        variant="default"
        delay={0}
      />
      <SummaryCard
        icon={TrendingUp}
        label="This Month Income"
        value={formatCurrency(data.monthlyIncome)}
        trend={formatTrend(data.incomeChange, true)}
        trendType={data.incomeChange >= 0 ? "positive" : "negative"}
        variant="income"
        delay={100}
      />
      <SummaryCard
        icon={TrendingDown}
        label="This Month Expenses"
        value={formatCurrency(data.monthlyExpenses)}
        variant="expense"
        delay={200}
      />
      <SummaryCard
        icon={PiggyBank}
        label="Savings This Month"
        value={formatCurrency(data.savings)}
        trend={data.savingsRate > 0 ? `${data.savingsRate.toFixed(1)}% savings rate` : undefined}
        trendType={data.savings >= 0 ? "positive" : "negative"}
        variant="savings"
        delay={300}
      />
    </div>
  );
}
