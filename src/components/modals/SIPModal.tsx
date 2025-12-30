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
import { SIP } from "@/hooks/useFinanceData";
import { toast } from "sonner";
import { useSettingsOptions } from "@/hooks/useSettingsOptions";

interface SIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sip: Omit<SIP, "id">) => void;
  onUpdate?: (id: string, sip: Partial<SIP>) => void;
  onDelete?: (id: string) => void;
  sip?: SIP | null;
}

export default function SIPModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  sip,
}: SIPModalProps) {
  const { options } = useSettingsOptions();
  
  // Create frequency options from user preferences or use defaults
  const frequencyOptions = useMemo(() => {
    if (options.sipFrequencies.length > 0) {
      return options.sipFrequencies;
    }
    // If no user preferences, allow free-form input
    return [];
  }, [options.sipFrequencies]);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("");
  const [customFrequency, setCustomFrequency] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [totalInvested, setTotalInvested] = useState("");

  const isEditing = !!sip;

  useEffect(() => {
    if (sip) {
      setName(sip.name);
      setAmount(sip.amount.toString());
      setFrequency(sip.frequency);
      setNextDate(sip.nextDate);
      setTotalInvested(sip.totalInvested.toString());
      setCustomFrequency("");
    } else {
      setName("");
      setAmount("");
      setFrequency("");
      setCustomFrequency("");
      setNextDate("");
      setTotalInvested("0");
    }
  }, [sip, isOpen]);

  const handleSave = () => {
    if (!name || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Use custom frequency if provided, otherwise use selected frequency
    const finalFrequency = customFrequency.trim() || frequency;
    if (!finalFrequency) {
      toast.error("Please select or enter a frequency");
      return;
    }

    const sipData = {
      name,
      amount: parseFloat(amount),
      frequency: finalFrequency,
      nextDate: nextDate || "",
      totalInvested: parseFloat(totalInvested) || 0,
    };

    if (isEditing && onUpdate && sip) {
      onUpdate(sip.id, sipData);
      toast.success("SIP updated successfully");
    } else {
      onSave(sipData);
      toast.success("SIP added successfully");
    }
    onClose();
  };

  const handleDelete = () => {
    if (sip && onDelete) {
      onDelete(sip.id);
      toast.success("SIP deleted");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit SIP" : "Add SIP / Recurring Investment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* SIP Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Investment Name</Label>
            <Input
              id="name"
              placeholder="e.g., Axis Bluechip Fund SIP"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">SIP Amount</Label>
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

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            {frequencyOptions.length > 0 ? (
              <Select value={frequency} onValueChange={(v) => {
                setFrequency(v);
                setCustomFrequency("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ Add Custom Frequency</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="e.g., Monthly, Weekly, Quarterly"
                value={customFrequency || frequency}
                onChange={(e) => {
                  setCustomFrequency(e.target.value);
                  setFrequency(e.target.value);
                }}
              />
            )}
            {frequency === "__custom__" && (
              <Input
                placeholder="Enter frequency"
                value={customFrequency}
                onChange={(e) => setCustomFrequency(e.target.value)}
              />
            )}
          </div>

          {/* Next Debit Date */}
          <div className="space-y-2">
            <Label htmlFor="nextDate">Next Debit Date</Label>
            <Input
              id="nextDate"
              placeholder="e.g., Jan 5"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
            />
          </div>

          {/* Total Invested */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="totalInvested">Total Invested So Far</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="totalInvested"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={totalInvested}
                  onChange={(e) => setTotalInvested(e.target.value)}
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
