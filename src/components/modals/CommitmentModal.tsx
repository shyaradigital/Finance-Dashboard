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
import { UpcomingCommitment } from "@/hooks/useFinanceData";
import { toast } from "sonner";
import { useSettingsOptions } from "@/hooks/useSettingsOptions";

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commitment: Omit<UpcomingCommitment, "id">) => void;
  onUpdate?: (id: string, commitment: Partial<UpcomingCommitment>) => void;
  onDelete?: (id: string) => void;
  commitment?: UpcomingCommitment | null;
}

export default function CommitmentModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  commitment,
}: CommitmentModalProps) {
  const { options } = useSettingsOptions();
  
  // Create type options from user preferences or allow free-form
  const typeOptions = useMemo(() => {
    if (options.commitmentTypes.length > 0) {
      return options.commitmentTypes.map(type => ({
        value: type.toLowerCase().replace(/\s+/g, '_'),
        label: type,
      }));
    }
    return [];
  }, [options.commitmentTypes]);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<string>("");
  const [customType, setCustomType] = useState("");

  const isEditing = !!commitment;

  useEffect(() => {
    if (commitment) {
      setName(commitment.name);
      setAmount(commitment.amount.toString());
      setDueDate(commitment.dueDate);
      setType(commitment.type);
      setCustomType("");
    } else {
      setName("");
      setAmount("");
      setDueDate("");
      setType("");
      setCustomType("");
    }
  }, [commitment, isOpen]);

  const handleSave = () => {
    if (!name || !amount || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Use custom type if provided, otherwise use selected type
    const finalType = customType.trim() || type;
    if (!finalType) {
      toast.error("Please select or enter a commitment type");
      return;
    }

    const commitmentData = {
      name,
      amount: parseFloat(amount),
      dueDate,
      type: finalType as "bill" | "subscription" | "loan",
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
                placeholder="e.g., Bill, Subscription, Loan"
                value={customType || type}
                onChange={(e) => {
                  setCustomType(e.target.value);
                  setType(e.target.value);
                }}
              />
            )}
            {type === "__custom__" && (
              <Input
                placeholder="Enter commitment type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
              />
            )}
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
