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
import { UpcomingCommitment } from "@/hooks/useFinanceData";
import { toast } from "sonner";

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commitment: Omit<UpcomingCommitment, "id">) => void;
  onUpdate?: (id: string, commitment: Partial<UpcomingCommitment>) => void;
  onDelete?: (id: string) => void;
  commitment?: UpcomingCommitment | null;
}

const typeOptions = [
  { value: "bill", label: "Bill" },
  { value: "subscription", label: "Subscription" },
  { value: "loan", label: "Loan / EMI" },
];

export default function CommitmentModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  commitment,
}: CommitmentModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<"bill" | "subscription" | "loan">("bill");

  const isEditing = !!commitment;

  useEffect(() => {
    if (commitment) {
      setName(commitment.name);
      setAmount(commitment.amount.toString());
      setDueDate(commitment.dueDate);
      setType(commitment.type);
    } else {
      setName("");
      setAmount("");
      setDueDate("");
      setType("bill");
    }
  }, [commitment, isOpen]);

  const handleSave = () => {
    if (!name || !amount || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const commitmentData = {
      name,
      amount: parseFloat(amount),
      dueDate,
      type,
    };

    if (isEditing && onUpdate && commitment) {
      onUpdate(commitment.id, commitmentData);
      toast.success("Commitment updated successfully");
    } else {
      onSave(commitmentData);
      toast.success("Commitment added successfully");
    }
    onClose();
  };

  const handleDelete = () => {
    if (commitment && onDelete) {
      onDelete(commitment.id);
      toast.success("Commitment deleted");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Commitment" : "Add Upcoming Commitment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Rent, Netflix, Car Loan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "bill" | "subscription" | "loan")}>
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
                placeholder="5000"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              placeholder="e.g., Jan 5"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
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
