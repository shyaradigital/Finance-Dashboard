import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
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
import { VaultItem } from "@/hooks/useFinanceData";
import { toast } from "sonner";

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<VaultItem, "id">) => void;
  onUpdate?: (id: string, item: Partial<VaultItem>) => void;
  onDelete?: (id: string) => void;
  item?: VaultItem | null;
}

const categoryOptions = ["Identity", "Travel", "Documents", "Financial", "Medical", "Other"];

export default function VaultModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  item,
}: VaultModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");
  const [showValue, setShowValue] = useState(false);

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setCategory(item.category);
      setValue(item.value);
    } else {
      setTitle("");
      setCategory("");
      setValue("");
    }
    setShowValue(false);
  }, [item, isOpen]);

  const handleSave = () => {
    if (!title || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const vaultData = {
      title,
      category,
      value: value || "••••••••",
      lastUpdated: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    if (isEditing && onUpdate && item) {
      onUpdate(item.id, vaultData);
      toast.success("Vault item updated successfully");
    } else {
      onSave(vaultData);
      toast.success("Item added to vault");
    }
    onClose();
  };

  const handleDelete = () => {
    if (item && onDelete) {
      onDelete(item.id);
      toast.success("Item removed from vault");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Vault Item" : "Add to Vault"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., PAN Card, Passport"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Secure Value */}
          <div className="space-y-2">
            <Label htmlFor="value">Secure Value / Number</Label>
            <div className="relative">
              <Input
                id="value"
                type={showValue ? "text" : "password"}
                placeholder="Enter sensitive information"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowValue(!showValue)}
              >
                {showValue ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This information is stored locally and masked by default.
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
