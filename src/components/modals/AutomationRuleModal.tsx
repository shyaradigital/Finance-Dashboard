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
import { Switch } from "@/components/ui/switch";
import { AutomationRule } from "@/hooks/useFinanceData";
import { toast } from "sonner";

interface AutomationRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<AutomationRule, "id">) => void;
  onUpdate?: (id: string, rule: Partial<AutomationRule>) => void;
  onDelete?: (id: string) => void;
  rule?: AutomationRule | null;
}

export default function AutomationRuleModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  rule,
}: AutomationRuleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);

  const isEditing = !!rule;

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setDescription(rule.description);
      setEnabled(rule.enabled);
    } else {
      setName("");
      setDescription("");
      setEnabled(true);
    }
  }, [rule, isOpen]);

  const handleSave = () => {
    if (!name || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const ruleData = {
      name,
      description,
      enabled,
    };

    if (isEditing && onUpdate && rule) {
      onUpdate(rule.id, ruleData);
      toast.success("Rule updated successfully");
    } else {
      onSave(ruleData);
      toast.success("Rule created successfully");
    }
    onClose();
  };

  const handleDelete = () => {
    if (rule && onDelete) {
      onDelete(rule.id);
      toast.success("Rule deleted");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Automation Rule" : "Create Automation Rule"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="e.g., Auto-categorize Amazon"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this rule does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Enabled</p>
              <p className="text-xs text-muted-foreground">
                This rule is currently {enabled ? "active" : "inactive"}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
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
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
