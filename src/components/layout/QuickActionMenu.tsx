import { Plus, TrendingUp, TrendingDown, RefreshCw, PiggyBank, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const actions = [
  { icon: TrendingUp, label: "Add Income", color: "bg-success", hoverColor: "hover:bg-success/90" },
  { icon: TrendingDown, label: "Add Expense", color: "bg-destructive", hoverColor: "hover:bg-destructive/90" },
  { icon: RefreshCw, label: "Recurring", color: "bg-primary", hoverColor: "hover:bg-primary/90" },
  { icon: PiggyBank, label: "Investment", color: "bg-accent", hoverColor: "hover:bg-accent/90" },
  { icon: CreditCard, label: "Pay Bill", color: "bg-warning", hoverColor: "hover:bg-warning/90" },
];

export default function QuickActionMenu({ isOpen, onToggle }: QuickActionMenuProps) {
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
      <div className="fixed bottom-24 right-4 z-50 flex flex-col-reverse items-end gap-3 lg:bottom-8 lg:right-8">
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
            <span className="rounded-lg bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-md">
              {action.label}
            </span>
            <button
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
    </>
  );
}
