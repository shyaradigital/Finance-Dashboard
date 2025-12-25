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
import { BankAccount } from "@/hooks/useFinanceData";
import { toast } from "sonner";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<BankAccount, "id">) => void;
  onUpdate?: (id: string, account: Partial<BankAccount>) => void;
  onDelete?: (id: string) => void;
  account?: BankAccount | null;
}

const bankOptions = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra", "Yes Bank"];
const typeOptions = [
  { value: "savings", label: "Savings Account" },
  { value: "current", label: "Current Account" },
  { value: "fd", label: "Fixed Deposit" },
];
const colorOptions = [
  { value: "from-blue-500 to-blue-600", label: "Blue" },
  { value: "from-orange-500 to-orange-600", label: "Orange" },
  { value: "from-green-500 to-green-600", label: "Green" },
  { value: "from-purple-500 to-purple-600", label: "Purple" },
  { value: "from-pink-500 to-pink-600", label: "Pink" },
];

export default function AccountModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  account,
}: AccountModalProps) {
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [type, setType] = useState<"savings" | "current" | "fd">("savings");
  const [balance, setBalance] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [color, setColor] = useState("from-blue-500 to-blue-600");

  const isEditing = !!account;

  useEffect(() => {
    if (account) {
      setName(account.name);
      setBank(account.bank);
      setType(account.type);
      setBalance(account.balance.toString());
      setAccountNumber(account.accountNumber);
      setColor(account.color);
    } else {
      setName("");
      setBank("");
      setType("savings");
      setBalance("");
      setAccountNumber("");
      setColor("from-blue-500 to-blue-600");
    }
  }, [account, isOpen]);

  const handleSave = () => {
    if (!name || !bank || !balance) {
      toast.error("Please fill in all required fields");
      return;
    }

    const accountData = {
      name,
      bank,
      type,
      balance: parseFloat(balance),
      accountNumber: accountNumber || `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
      color,
    };

    if (isEditing && onUpdate && account) {
      onUpdate(account.id, accountData);
      toast.success("Account updated successfully");
    } else {
      onSave(accountData);
      toast.success("Account added successfully");
    }
    onClose();
  };

  const handleDelete = () => {
    if (account && onDelete) {
      onDelete(account.id);
      toast.success("Account deleted");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Account" : "Add Bank Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., Primary Savings"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Bank */}
          <div className="space-y-2">
            <Label>Bank</Label>
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {bankOptions.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "savings" | "current" | "fd")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="balance"
                type="number"
                placeholder="0"
                className="pl-8"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number (last 4 digits)</Label>
            <Input
              id="accountNumber"
              placeholder="XXXX1234"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Card Color</Label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`h-8 w-8 rounded-full bg-gradient-to-r ${c.value} ${
                    color === c.value ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                  onClick={() => setColor(c.value)}
                />
              ))}
            </div>
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
