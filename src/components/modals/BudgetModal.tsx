import { useState, useEffect, useMemo } from "react";
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
import { useCategories } from "@/hooks/useFinanceQueries";
import { categoryIcons } from "@/hooks/useFinanceData";

export default function BudgetModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  budget,
}: BudgetModalProps) {
  const { categories: allCategories } = useCategories();
  
  // Filter only expense categories for budgets
  const expenseCategories = useMemo(() => {
    return allCategories.filter(cat => cat.type === "expense");
  }, [allCategories]);

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

    // Find the selected category to get its icon and color
    const selectedCategory = expenseCategories.find(c => c.name === name);
    const CategoryIcon = selectedCategory 
      ? (categoryIcons[selectedCategory.name.toLowerCase()] || categoryIcons.default)
      : categoryIcons.default;
    
    const budgetData = {
      name,
      budget: parseFloat(budgetAmount),
      spent: parseFloat(spent),
      icon: CategoryIcon,
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
            {expenseCategories.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  No expense categories found. Please create categories in Settings first.
                </p>
                <Input
                  placeholder="Enter category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            ) : (
              <Select value={name} onValueChange={setName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => {
                    const Icon = categoryIcons[cat.name.toLowerCase()] || categoryIcons.default;
                    return (
                      <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {cat.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
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
