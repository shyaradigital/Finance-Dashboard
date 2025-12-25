import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, RefreshCw, PiggyBank, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/FinanceContext";
import { TransactionModal } from "@/components/modals";
import { categoryIcons, Transaction } from "@/hooks/useFinanceData";

interface QuickActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

type ModalType = "income" | "expense" | "recurring" | "investment" | "bill" | null;

const actions = [
  { icon: TrendingUp, label: "Add Income", color: "bg-success", hoverColor: "hover:bg-success/90", modal: "income" as ModalType },
  { icon: TrendingDown, label: "Add Expense", color: "bg-destructive", hoverColor: "hover:bg-destructive/90", modal: "expense" as ModalType },
  { icon: RefreshCw, label: "Recurring", color: "bg-primary", hoverColor: "hover:bg-primary/90", modal: "recurring" as ModalType },
  { icon: PiggyBank, label: "Investment", color: "bg-accent", hoverColor: "hover:bg-accent/90", modal: "investment" as ModalType },
  { icon: CreditCard, label: "Pay Bill", color: "bg-warning", hoverColor: "hover:bg-warning/90", modal: "bill" as ModalType },
];

export default function QuickActionMenu({ isOpen, onToggle }: QuickActionMenuProps) {
  const { addTransaction, addInvestment, addCommitment } = useFinance();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleActionClick = (modal: ModalType) => {
    onToggle(); // Close the FAB menu
    setActiveModal(modal);
  };

  const handleSaveTransaction = (transaction: Omit<Transaction, "id">) => {
    addTransaction(transaction);
  };

  const handleSaveInvestment = () => {
    // This will be handled by the Investment page modal
    setActiveModal(null);
  };

  const handleSaveBill = () => {
    addCommitment({
      name: "New Bill",
      amount: 0,
      dueDate: "Pending",
      type: "bill",
    });
    setActiveModal(null);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Action Items */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3 pb-4 lg:bottom-24 lg:right-8">
        {actions.map((action, index) => (
          <div
            key={action.label}
            className={cn(
              "flex items-center gap-3 transition-all duration-300",
              isOpen 
                ? "translate-y-0 opacity-100" 
                : "pointer-events-none translate-y-4 opacity-0",
            )}
            style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
          >
            <span className="rounded-lg bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-md border border-border/50">
              {action.label}
            </span>
            <button
              onClick={() => handleActionClick(action.modal)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110",
                action.color,
                action.hoverColor
              )}
            >
              <action.icon className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        variant="fab"
        size="fab"
        className="fixed bottom-4 right-4 z-50 lg:bottom-8 lg:right-8"
        onClick={onToggle}
      >
        <Plus className={cn("h-6 w-6 transition-transform duration-300", isOpen && "rotate-45")} />
      </Button>

      {/* Transaction Modal for Income */}
      <TransactionModal
        isOpen={activeModal === "income"}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveTransaction}
        defaultType="income"
      />

      {/* Transaction Modal for Expense */}
      <TransactionModal
        isOpen={activeModal === "expense"}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveTransaction}
        defaultType="expense"
      />

      {/* Transaction Modal for Recurring */}
      <TransactionModal
        isOpen={activeModal === "recurring"}
        onClose={() => setActiveModal(null)}
        onSave={(t) => handleSaveTransaction({ ...t, isRecurring: true })}
        defaultType="expense"
      />

      {/* Investment Modal */}
      <TransactionModal
        isOpen={activeModal === "investment"}
        onClose={() => setActiveModal(null)}
        onSave={(t) => handleSaveTransaction({ ...t, category: "Investment", type: "expense" })}
        defaultType="expense"
      />

      {/* Pay Bill Modal */}
      <TransactionModal
        isOpen={activeModal === "bill"}
        onClose={() => setActiveModal(null)}
        onSave={(t) => handleSaveTransaction({ ...t, category: "Utilities", type: "expense" })}
        defaultType="expense"
      />
    </>
  );
}
