import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PiggyBank, 
  Receipt,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  variant: "income" | "expense" | "budget" | "invest" | "bills";
}

function QuickAction({ icon: Icon, label, description, variant }: QuickActionProps) {
  const variantStyles = {
    income: "from-success/10 to-success/5 border-success/20 hover:border-success/40",
    expense: "from-destructive/10 to-destructive/5 border-destructive/20 hover:border-destructive/40",
    budget: "from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40",
    invest: "from-accent/10 to-accent/5 border-accent/20 hover:border-accent/40",
    bills: "from-warning/10 to-warning/5 border-warning/20 hover:border-warning/40",
  };

  const iconStyles = {
    income: "bg-success text-success-foreground",
    expense: "bg-destructive text-destructive-foreground",
    budget: "bg-primary text-primary-foreground",
    invest: "bg-accent text-accent-foreground",
    bills: "bg-warning text-warning-foreground",
  };

  return (
    <button
      className={cn(
        "flex items-center gap-4 w-full rounded-xl bg-gradient-to-r border p-4 transition-all duration-200 hover:shadow-md group text-left",
        variantStyles[variant]
      )}
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm", iconStyles[variant])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}

export default function QuickActions() {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <QuickAction
          icon={TrendingUp}
          label="Add Income"
          description="Record salary, freelance, or other income"
          variant="income"
        />
        <QuickAction
          icon={TrendingDown}
          label="Add Expense"
          description="Log a purchase or payment"
          variant="expense"
        />
        <QuickAction
          icon={Target}
          label="View Budget"
          description="Check your spending against limits"
          variant="budget"
        />
        <QuickAction
          icon={PiggyBank}
          label="Add Investment"
          description="Track mutual funds, stocks, or SIPs"
          variant="invest"
        />
        <QuickAction
          icon={Receipt}
          label="Upcoming Bills"
          description="View and manage recurring payments"
          variant="bills"
        />
      </CardContent>
    </Card>
  );
}
