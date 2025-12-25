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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DebitCardType } from "@/hooks/useFinanceData";
import { toast } from "sonner";

interface DebitCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<DebitCardType, "id">) => void;
  onUpdate?: (id: string, card: Partial<DebitCardType>) => void;
  onDelete?: (id: string) => void;
  card?: DebitCardType | null;
  bankAccounts?: { name: string }[];
}

const bankOptions = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Yes Bank"];
const networkOptions: ("Visa" | "Mastercard" | "RuPay")[] = ["Visa", "Mastercard", "RuPay"];
const colorOptions = [
  { value: "from-blue-500 to-blue-600", label: "Blue" },
  { value: "from-orange-500 to-orange-600", label: "Orange" },
  { value: "from-green-500 to-green-600", label: "Green" },
  { value: "from-purple-500 to-purple-600", label: "Purple" },
  { value: "from-gray-700 to-gray-900", label: "Black" },
];

export default function DebitCardModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  card,
  bankAccounts = [],
}: DebitCardModalProps) {
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [linkedAccount, setLinkedAccount] = useState("");
  const [cardNetwork, setCardNetwork] = useState<"Visa" | "Mastercard" | "RuPay">("Visa");
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [color, setColor] = useState("from-blue-500 to-blue-600");

  const isEditing = !!card;

  useEffect(() => {
    if (card) {
      setName(card.name);
      setBank(card.bank);
      setLastFour(card.lastFour);
      setLinkedAccount(card.linkedAccount);
      setCardNetwork(card.cardNetwork);
      setExpiryDate(card.expiryDate);
      setIsActive(card.isActive);
      setColor(card.color);
    } else {
      setName("");
      setBank("");
      setLastFour("");
      setLinkedAccount("");
      setCardNetwork("Visa");
      setExpiryDate("");
      setIsActive(true);
      setColor("from-blue-500 to-blue-600");
    }
  }, [card, isOpen]);

  const handleSave = () => {
    if (!name || !bank) {
      toast.error("Please fill in all required fields");
      return;
    }

    const cardData: Omit<DebitCardType, "id"> = {
      name,
      bank,
      lastFour: lastFour || Math.floor(1000 + Math.random() * 9000).toString(),
      linkedAccount: linkedAccount || "Primary Account",
      cardNetwork,
      expiryDate: expiryDate || "12/27",
      isActive,
      color,
    };

    if (isEditing && onUpdate && card) {
      onUpdate(card.id, cardData);
      toast.success("Debit card updated successfully");
    } else {
      onSave(cardData);
      toast.success("Debit card added successfully");
    }
    onClose();
  };

  const handleDelete = () => {
    if (card && onDelete) {
      onDelete(card.id);
      toast.success("Debit card deleted");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Debit Card" : "Add Debit Card"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Card Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Card Name</Label>
            <Input
              id="name"
              placeholder="e.g., Platinum Debit, Classic"
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

          {/* Card Network */}
          <div className="space-y-2">
            <Label>Card Network</Label>
            <Select value={cardNetwork} onValueChange={(v) => setCardNetwork(v as typeof cardNetwork)}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {networkOptions.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Linked Account */}
          <div className="space-y-2">
            <Label htmlFor="linkedAccount">Linked Account</Label>
            {bankAccounts.length > 0 ? (
              <Select value={linkedAccount} onValueChange={setLinkedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((acc) => (
                    <SelectItem key={acc.name} value={acc.name}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="linkedAccount"
                placeholder="e.g., Primary Savings"
                value={linkedAccount}
                onChange={(e) => setLinkedAccount(e.target.value)}
              />
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              placeholder="MM/YY"
              maxLength={5}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div>
              <p className="font-medium text-foreground">Card Active</p>
              <p className="text-xs text-muted-foreground">Enable card for transactions</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
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
