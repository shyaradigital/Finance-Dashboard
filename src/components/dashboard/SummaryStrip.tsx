import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
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
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        icon={Wallet}
        label="Net Balance"
        value="₹3,45,890"
        trend="+₹45,230 from last month"
        trendType="positive"
        variant="default"
        delay={0}
      />
      <SummaryCard
        icon={TrendingUp}
        label="This Month Income"
        value="₹1,25,000"
        trend="↑ 8.5% from 3-month avg"
        trendType="positive"
        variant="income"
        delay={100}
      />
      <SummaryCard
        icon={TrendingDown}
        label="This Month Expenses"
        value="₹67,450"
        trend="12% under budget"
        trendType="positive"
        variant="expense"
        delay={200}
      />
      <SummaryCard
        icon={PiggyBank}
        label="Savings This Month"
        value="₹57,550"
        trend="46% savings rate"
        trendType="positive"
        variant="savings"
        delay={300}
      />
    </div>
  );
}
