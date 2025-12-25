import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PiggyBank, 
  Receipt,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/FinanceContext";
import { TransactionModal, InvestmentModal, CommitmentModal } from "@/components/modals";
import { Transaction, Investment, UpcomingCommitment } from "@/hooks/useFinanceData";

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  variant: "income" | "expense" | "budget" | "invest" | "bills";
  onClick: () => void;
}

function QuickAction({ icon: Icon, label, description, variant, onClick }: QuickActionProps) {
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
      onClick={onClick}
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
  const navigate = useNavigate();
  const { addTransaction, addInvestment, addCommitment } = useFinance();
  
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [billsModalOpen, setBillsModalOpen] = useState(false);

  const handleSaveTransaction = (transaction: Omit<Transaction, "id">) => {
    addTransaction(transaction);
  };

  const handleSaveInvestment = (investment: Omit<Investment, "id">) => {
    addInvestment(investment);
  };

  const handleSaveCommitment = (commitment: Omit<UpcomingCommitment, "id">) => {
    addCommitment(commitment);
  };

  return (
    <>
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
            onClick={() => setIncomeModalOpen(true)}
          />
          <QuickAction
            icon={TrendingDown}
            label="Add Expense"
            description="Log a purchase or payment"
            variant="expense"
            onClick={() => setExpenseModalOpen(true)}
          />
          <QuickAction
            icon={Target}
            label="View Budget"
            description="Check your spending against limits"
            variant="budget"
            onClick={() => navigate("/budget")}
          />
          <QuickAction
            icon={PiggyBank}
            label="Add Investment"
            description="Track mutual funds, stocks, or SIPs"
            variant="invest"
            onClick={() => setInvestmentModalOpen(true)}
          />
          <QuickAction
            icon={Receipt}
            label="Upcoming Bills"
            description="View and manage recurring payments"
            variant="bills"
            onClick={() => setBillsModalOpen(true)}
          />
        </CardContent>
      </Card>

      {/* Income Modal */}
      <TransactionModal
        isOpen={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSave={handleSaveTransaction}
        defaultType="income"
      />

      {/* Expense Modal */}
      <TransactionModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSave={handleSaveTransaction}
        defaultType="expense"
      />

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={investmentModalOpen}
        onClose={() => setInvestmentModalOpen(false)}
        onSave={handleSaveInvestment}
      />

      {/* Bills/Commitment Modal */}
      <CommitmentModal
        isOpen={billsModalOpen}
        onClose={() => setBillsModalOpen(false)}
        onSave={handleSaveCommitment}
      />
    </>
  );
}
