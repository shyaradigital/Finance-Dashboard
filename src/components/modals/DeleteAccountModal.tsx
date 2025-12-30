import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!password) {
      toast.error("Please enter your password to confirm");
      return;
    }

    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.auth.deleteAccount(password);
      if (response.success) {
        // Clear React Query cache before logout to ensure no old data persists
        queryClient.clear();
        // Clear all localStorage data
        localStorage.removeItem('financeflow_setup_dismissed');
        toast.success("Account deleted successfully");
        await logout();
        navigate("/auth");
        onClose();
      } else {
        toast.error(response.error || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An error occurred while deleting your account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Delete Account</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-left space-y-4">
              <p className="text-foreground font-medium">
                This action cannot be undone. This will permanently delete your account and all associated data.
              </p>
              
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm font-medium text-foreground mb-2">All of the following will be deleted:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>All transactions and transaction history</li>
                  <li>All budgets and budget categories</li>
                  <li>All accounts, credit cards, and debit cards</li>
                  <li>All investments and SIPs</li>
                  <li>All categories and automation rules</li>
                  <li>All vault items and secure notes</li>
                  <li>All settings and preferences</li>
                </ul>
              </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="delete-password">Enter your password to confirm</Label>
                <div className="relative">
                  <Input
                    id="delete-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-delete">Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
                <Input
                  id="confirm-delete"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="font-mono"
                />
              </div>
            </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || !password || confirmText !== "DELETE"}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Delete Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

