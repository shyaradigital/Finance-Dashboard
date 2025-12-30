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
import { BankAccount } from "@/hooks/useFinanceData";
import { toast } from "sonner";
import { useSettingsOptions } from "@/hooks/useSettingsOptions";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<BankAccount, "id">) => void;
  onUpdate?: (id: string, account: Partial<BankAccount>) => void;
  onDelete?: (id: string) => void;
  account?: BankAccount | null;
}
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
  const { options } = useSettingsOptions();
  
  // Create type options from user preferences or allow free-form
  const typeOptions = useMemo(() => {
    if (options.accountTypes.length > 0) {
      return options.accountTypes.map(type => ({
        value: type.toLowerCase().replace(/\s+/g, '_'),
        label: type,
      }));
    }
    return [];
  }, [options.accountTypes]);

  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [type, setType] = useState<string>("");
  const [customType, setCustomType] = useState("");
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
      setCustomType("");
    } else {
      setName("");
      setBank("");
      setType("");
      setCustomType("");
      setBalance("");
      setAccountNumber("");
      setColor("");
    }
  }, [account, isOpen]);

  const handleSave = () => {
    if (!name || !bank || !balance) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Use custom type if provided, otherwise use selected type
    const finalType = customType.trim() || type;
    if (!finalType) {
      toast.error("Please select or enter an account type");
      return;
    }

    const accountData = {
      name,
      bank,
      type: finalType, // Send as string, no type assertion
      balance: parseFloat(balance),
      accountNumber: accountNumber || `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
      color: color || "from-blue-500 to-blue-600",
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
            <Label htmlFor="bank">Bank</Label>
            <Input
              id="bank"
              placeholder="e.g., Your Bank Name"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label>Account Type</Label>
            {typeOptions.length > 0 ? (
              <Select value={type} onValueChange={(v) => {
                setType(v);
                setCustomType("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ Add Custom Type</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="e.g., Savings Account, Current Account"
                value={customType || type}
                onChange={(e) => {
                  setCustomType(e.target.value);
                  setType(e.target.value);
                }}
              />
            )}
            {type === "__custom__" && (
              <Input
                placeholder="Enter account type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
              />
            )}
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
