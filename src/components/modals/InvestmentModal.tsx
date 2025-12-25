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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Investment } from "@/hooks/useFinanceData";
import { toast } from "sonner";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investment: Omit<Investment, "id">) => void;
  onUpdate?: (id: string, investment: Partial<Investment>) => void;
  onDelete?: (id: string) => void;
  investment?: Investment | null;
}

const typeOptions = [
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "stock", label: "Stock" },
  { value: "sip", label: "SIP" },
  { value: "ppf", label: "PPF" },
  { value: "nps", label: "NPS" },
];

const colorOptions = [
  "hsl(270, 60%, 55%)",
  "hsl(280, 70%, 60%)",
  "hsl(160, 60%, 45%)",
  "hsl(35, 90%, 55%)",
  "hsl(200, 70%, 50%)",
];

export default function InvestmentModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  investment,
}: InvestmentModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Investment["type"]>("mutual_fund");
  const [invested, setInvested] = useState("");
  const [current, setCurrent] = useState("");

  const isEditing = !!investment;

  useEffect(() => {
    if (investment) {
      setName(investment.name);
      setType(investment.type);
      setInvested(investment.invested.toString());
      setCurrent(investment.current.toString());
    } else {
      setName("");
      setType("mutual_fund");
      setInvested("");
      setCurrent("");
    }
  }, [investment, isOpen]);

  const handleSave = () => {
    if (!name || !invested) {
      toast.error("Please fill in all required fields");
      return;
    }

    const investedAmount = parseFloat(invested);
    const currentAmount = parseFloat(current) || investedAmount;
    const returns = ((currentAmount - investedAmount) / investedAmount) * 100;

    const investmentData = {
      name,
      type,
      invested: investedAmount,
      current: currentAmount,
      returns: Math.round(returns * 10) / 10,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
    };

    if (isEditing && onUpdate && investment) {
      onUpdate(investment.id, investmentData);
      toast.success("Investment updated successfully");
    } else {
      onSave(investmentData);
      toast.success("Investment added successfully");
    }
    onClose();
  };

  const handleDelete = () => {
    if (investment && onDelete) {
      onDelete(investment.id);
      toast.success("Investment deleted");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Investment" : "Add Investment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Investment Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Investment Name</Label>
            <Input
              id="name"
              placeholder="e.g., Axis Bluechip Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Investment Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as Investment["type"])}>
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

          {/* Amount Invested */}
          <div className="space-y-2">
            <Label htmlFor="invested">Amount Invested</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="invested"
                type="number"
                placeholder="100000"
                className="pl-8"
                value={invested}
                onChange={(e) => setInvested(e.target.value)}
              />
            </div>
          </div>

          {/* Current Value */}
          <div className="space-y-2">
            <Label htmlFor="current">Current Value</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="current"
                type="number"
                placeholder="115000"
                className="pl-8"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave blank to set same as invested amount
            </p>
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
