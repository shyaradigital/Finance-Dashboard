import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BudgetCategory } from "@/hooks/useFinanceData";
import { toast } from "sonner";
import { 
  Home, 
  Utensils, 
  ShoppingBag, 
  Car, 
  Gamepad2, 
  Wifi, 
  Heart, 
  GraduationCap 
} from "lucide-react";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<BudgetCategory, "id">) => void;
  onUpdate?: (id: string, budget: Partial<BudgetCategory>) => void;
  onDelete?: (id: string) => void;
  budget?: BudgetCategory | null;
}

const categoryOptions = [
  { name: "Housing", icon: Home, color: "bg-primary" },
  { name: "Food & Dining", icon: Utensils, color: "bg-accent" },
  { name: "Shopping", icon: ShoppingBag, color: "bg-destructive" },
  { name: "Transport", icon: Car, color: "bg-success" },
  { name: "Entertainment", icon: Gamepad2, color: "bg-warning" },
  { name: "Utilities", icon: Wifi, color: "bg-primary" },
  { name: "Health", icon: Heart, color: "bg-success" },
  { name: "Education", icon: GraduationCap, color: "bg-accent" },
];

export default function BudgetModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  budget,
}: BudgetModalProps) {
  const [name, setName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [spent, setSpent] = useState("0");

  const isEditing = !!budget;

  useEffect(() => {
    if (budget) {
      setName(budget.name);
      setBudgetAmount(budget.budget.toString());
      setSpent(budget.spent.toString());
    } else {
      setName("");
      setBudgetAmount("");
      setSpent("0");
    }
  }, [budget, isOpen]);

  const handleSave = () => {
    if (!name || !budgetAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedCategory = categoryOptions.find(c => c.name === name);
    
    const budgetData = {
      name,
      budget: parseFloat(budgetAmount),
      spent: parseFloat(spent),
      icon: selectedCategory?.icon || Home,
      color: selectedCategory?.color || "bg-primary",
    };

    if (isEditing && onUpdate && budget) {
      onUpdate(budget.id, budgetData);
      toast.success("Budget updated successfully");
    } else {
      onSave(budgetData);
      toast.success("Budget added successfully");
    }
    onClose();
  };

  const handleDelete = () => {
    if (budget && onDelete) {
      onDelete(budget.id);
      toast.success("Budget deleted");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Budget" : "Add Budget"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={name} onValueChange={setName}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Monthly Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Monthly Budget Limit</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="budget"
                type="number"
                placeholder="10000"
                className="pl-8"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Spent Amount (only for editing) */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="spent">Amount Spent</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="spent"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={spent}
                  onChange={(e) => setSpent(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isEditing && onDelete && (
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" className="flex-1" onClick={handleSave}>
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
