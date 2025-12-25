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
import { CreditCardType } from "@/hooks/useFinanceData";
import { toast } from "sonner";

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<CreditCardType, "id">) => void;
  onUpdate?: (id: string, card: Partial<CreditCardType>) => void;
  onDelete?: (id: string) => void;
  card?: CreditCardType | null;
}

const bankOptions = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Amex"];
const colorOptions = [
  { value: "from-purple-500 to-purple-600", label: "Purple" },
  { value: "from-yellow-500 to-orange-500", label: "Gold" },
  { value: "from-gray-700 to-gray-900", label: "Black" },
  { value: "from-blue-500 to-blue-600", label: "Blue" },
  { value: "from-green-500 to-green-600", label: "Green" },
];

export default function CreditCardModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  card,
}: CreditCardModalProps) {
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [limit, setLimit] = useState("");
  const [used, setUsed] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [color, setColor] = useState("from-purple-500 to-purple-600");

  const isEditing = !!card;

  useEffect(() => {
    if (card) {
      setName(card.name);
      setBank(card.bank);
      setLastFour(card.lastFour);
      setLimit(card.limit.toString());
      setUsed(card.used.toString());
      setDueDate(card.dueDate);
      setColor(card.color);
    } else {
      setName("");
      setBank("");
      setLastFour("");
      setLimit("");
      setUsed("0");
      setDueDate("");
      setColor("from-purple-500 to-purple-600");
    }
  }, [card, isOpen]);

  const handleSave = () => {
    if (!name || !bank || !limit) {
      toast.error("Please fill in all required fields");
      return;
    }

    const usedAmount = parseFloat(used) || 0;
    const limitAmount = parseFloat(limit);

    const cardData = {
      name,
      bank,
      lastFour: lastFour || Math.floor(1000 + Math.random() * 9000).toString(),
      limit: limitAmount,
      used: usedAmount,
      dueDate: dueDate || "Jan 15",
      minDue: Math.round(usedAmount * 0.1),
      color,
    };

    if (isEditing && onUpdate && card) {
      onUpdate(card.id, cardData);
      toast.success("Card updated successfully");
    } else {
      onSave(cardData);
      toast.success("Card added successfully");
    }
    onClose();
  };

  const handleDelete = () => {
    if (card && onDelete) {
      onDelete(card.id);
      toast.success("Card deleted");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Credit Card" : "Add Credit Card"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Card Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Card Name</Label>
            <Input
              id="name"
              placeholder="e.g., Regalia, Amazon Pay"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Bank */}
          <div className="space-y-2">
            <Label>Bank / Issuer</Label>
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

          {/* Last 4 Digits */}
          <div className="space-y-2">
            <Label htmlFor="lastFour">Last 4 Digits</Label>
            <Input
              id="lastFour"
              placeholder="1234"
              maxLength={4}
              value={lastFour}
              onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {/* Credit Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit">Credit Limit</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="limit"
                type="number"
                placeholder="300000"
                className="pl-8"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
          </div>

          {/* Current Outstanding */}
          <div className="space-y-2">
            <Label htmlFor="used">Current Outstanding</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="used"
                type="number"
                placeholder="0"
                className="pl-8"
                value={used}
                onChange={(e) => setUsed(e.target.value)}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Bill Due Date</Label>
            <Input
              id="dueDate"
              placeholder="e.g., Jan 15"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
