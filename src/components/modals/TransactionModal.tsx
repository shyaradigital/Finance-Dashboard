import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Transaction, categoryIcons } from "@/hooks/useFinanceData";
import { toast } from "sonner";
import { useAccounts, useCreditCards } from "@/hooks/useFinanceQueries";
import { useCategories } from "@/hooks/useFinanceQueries";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, "id">) => void;
  onUpdate?: (id: string, transaction: Partial<Transaction>) => void;
  onDelete?: (id: string) => void;
  transaction?: Transaction | null;
  defaultType?: "income" | "expense";
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  transaction,
  defaultType = "expense",
}: TransactionModalProps) {
  const { bankAccounts } = useAccounts();
  const { creditCards } = useCreditCards();
  const { categories: allCategories } = useCategories();

  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);

  const isEditing = !!transaction;

  // Filter categories by type
  const categories = useMemo(() => {
    return allCategories.filter(cat => cat.type === type);
  }, [allCategories, type]);

  // Combine accounts and credit cards for dropdown
  const accountOptions = useMemo(() => {
    const accountList = bankAccounts.map(acc => ({
      value: `${acc.bank} ${acc.name}`,
      label: `${acc.bank} ${acc.name}`,
    }));
    const cardList = creditCards.map(card => ({
      value: `${card.bank} ${card.name} (Credit Card)`,
      label: `${card.bank} ${card.name} (Credit Card)`,
    }));
    return [...accountList, ...cardList];
  }, [bankAccounts, creditCards]);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setCategory(transaction.category);
      setAccount(transaction.account);
      setIsRecurring(transaction.isRecurring || false);
    } else {
      setType(defaultType);
      setAmount("");
      setDescription("");
      setCategory("");
      setAccount("");
      setDate(new Date().toISOString().split("T")[0]);
      setIsRecurring(false);
    }
  }, [transaction, defaultType, isOpen]);

  const handleSave = () => {
    if (!amount || !description || !category || !account) {
      toast.error("Please fill in all required fields");
      return;
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      category,
      account,
      date: date === new Date().toISOString().split("T")[0] ? "Today" : date,
      isRecurring,
      icon: categoryIcons[category] || categoryIcons.default,
    };

    if (isEditing && onUpdate && transaction) {
      onUpdate(transaction.id, transactionData);
      toast.success("Transaction updated successfully");
    } else {
      onSave(transactionData);
      toast.success("Transaction added successfully");
    }
    onClose();
  };

  const handleDelete = () => {
    if (transaction && onDelete) {
      onDelete(transaction.id);
      toast.success("Transaction deleted");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              className={cn(
                "flex-1 gap-2",
                type === "income" && "bg-success hover:bg-success/90"
              )}
              onClick={() => {
                setType("income");
                setCategory("");
              }}
            >
              <TrendingUp className="h-4 w-4" />
              Income
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              className={cn(
                "flex-1 gap-2",
                type === "expense" && "bg-destructive hover:bg-destructive/90"
              )}
              onClick={() => {
                setType("expense");
                setCategory("");
              }}
            >
              <TrendingDown className="h-4 w-4" />
              Expense
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            {categories.length > 0 ? (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground p-2 border rounded-md">
                No {type} categories found. Please create a category first.
              </div>
            )}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>Account</Label>
            {accountOptions.length > 0 ? (
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((acc) => (
                    <SelectItem key={acc.value} value={acc.value}>
                      {acc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground p-2 border rounded-md">
                No accounts found. Please create an account or credit card first.
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Recurring</p>
                <p className="text-xs text-muted-foreground">
                  This transaction repeats regularly
                </p>
              </div>
            </div>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>
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
