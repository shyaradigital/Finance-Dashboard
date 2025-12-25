import { useState, useEffect, useRef } from "react";
import { 
  Eye, 
  EyeOff, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Download, 
  Share2,
  File
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VaultItem } from "@/hooks/useFinanceData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PasswordVerifyModal from "./PasswordVerifyModal";

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
  const [entryType, setEntryType] = useState<"text" | "document">("text");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"download" | "share" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setCategory(item.category);
      setValue(item.value);
      setEntryType(item.type || "text");
      setDocumentName(item.documentName || "");
      setDocumentPreview(item.documentUrl || null);
    } else {
      setTitle("");
      setCategory("");
      setValue("");
      setEntryType("text");
      setDocumentFile(null);
      setDocumentPreview(null);
      setDocumentName("");
    }
    setShowValue(false);
  }, [item, isOpen]);

  const handleFileChange = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload PDF, images, or documents.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size must be less than 10MB");
      return;
    }

    setDocumentFile(file);
    setDocumentName(file.name);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!title || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (entryType === "document" && !documentFile && !item?.documentUrl) {
      toast.error("Please upload a document");
      return;
    }

    const vaultData: Omit<VaultItem, "id"> = {
      title,
      category,
      value: entryType === "text" ? (value || "••••••••") : "",
      type: entryType,
      documentName: entryType === "document" ? documentName : undefined,
      documentUrl: entryType === "document" ? (documentPreview || item?.documentUrl) : undefined,
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

  const handleDownload = () => {
    setPendingAction("download");
    setIsPasswordModalOpen(true);
  };

  const handleShare = () => {
    setPendingAction("share");
    setIsPasswordModalOpen(true);
  };

  const executeAction = () => {
    if (pendingAction === "download") {
      // Simulate download
      if (documentPreview || item?.documentUrl) {
        const link = document.createElement("a");
        link.href = documentPreview || item?.documentUrl || "";
        link.download = documentName || item?.documentName || "document";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Document downloaded");
      } else {
        toast.info("Document download simulated");
      }
    } else if (pendingAction === "share") {
      // Share on WhatsApp
      const text = `Check out this document: ${title}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank");
      toast.success("Opening WhatsApp to share");
    }
    setPendingAction(null);
  };

  const removeDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    setDocumentName("");
  };

  const getFileIcon = () => {
    if (documentFile?.type.startsWith("image/") || documentPreview?.startsWith("data:image")) {
      return ImageIcon;
    }
    return FileText;
  };

  const FileIcon = getFileIcon();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Vault Item" : "Add to Vault"}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={entryType} onValueChange={(v) => setEntryType(v as "text" | "document")} className="mt-2">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />
                Text Entry
              </TabsTrigger>
              <TabsTrigger value="document" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Upload className="h-4 w-4 mr-2" />
                Document
              </TabsTrigger>
            </TabsList>

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

              <TabsContent value="text" className="mt-0 space-y-4">
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
              </TabsContent>

              <TabsContent value="document" className="mt-0 space-y-4">
                {/* Document Upload */}
                {!documentFile && !documentPreview ? (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                      isDragging 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileChange(file);
                      }}
                    />
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium text-foreground">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF, Images, Word documents (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="border border-border rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      {documentPreview?.startsWith("data:image") ? (
                        <img 
                          src={documentPreview} 
                          alt="Preview" 
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-16 w-16 flex items-center justify-center rounded-lg bg-primary/10">
                          <FileIcon className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{documentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {documentFile ? `${(documentFile.size / 1024).toFixed(1)} KB` : "Uploaded"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={removeDocument}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Document Actions */}
                    {isEditing && (item?.type === "document" || documentFile) && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={handleShare}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Documents are stored securely and require password verification to download or share.
                </p>
              </TabsContent>
            </div>
          </Tabs>

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

      {/* Password Verification Modal */}
      <PasswordVerifyModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPendingAction(null);
        }}
        onVerified={executeAction}
        title="Verify to Continue"
        description={
          pendingAction === "download" 
            ? "Enter your master password to download this document."
            : "Enter your master password to share this document."
        }
      />
    </>
  );
}
