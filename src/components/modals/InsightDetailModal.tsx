import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  description: string;
  action?: string;
}

interface InsightDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: Insight | null;
}

export default function InsightDetailModal({
  isOpen,
  onClose,
  insight,
}: InsightDetailModalProps) {
  if (!insight) return null;

  const getIcon = () => {
    switch (insight.type) {
      case "warning":
        return AlertTriangle;
      case "success":
        return CheckCircle;
      default:
        return Sparkles;
    }
  };

  const getStyles = () => {
    switch (insight.type) {
      case "warning":
        return { bg: "bg-warning/10", text: "text-warning" };
      case "success":
        return { bg: "bg-success/10", text: "text-success" };
      default:
        return { bg: "bg-primary/10", text: "text-primary" };
    }
  };

  const Icon = getIcon();
  const styles = getStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", styles.bg)}>
              <Icon className={cn("h-5 w-5", styles.text)} />
            </div>
            {insight.title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-muted-foreground">{insight.description}</p>

          {/* Detailed breakdown based on insight type */}
          {insight.type === "warning" && (
            <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
              <h4 className="font-medium text-foreground mb-2">Recommendation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review recent transactions in this category</li>
                <li>• Consider adjusting your budget limits</li>
                <li>• Set up alerts for spending thresholds</li>
              </ul>
            </div>
          )}

          {insight.type === "success" && (
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <h4 className="font-medium text-foreground mb-2">Great Progress!</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target</span>
                <span className="font-medium text-foreground">₹50,000</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Current</span>
                <span className="font-medium text-success">₹58,000</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-success text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>₹8,000 above target</span>
              </div>
            </div>
          )}

          {insight.type === "info" && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-foreground mb-2">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active subscriptions</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly total</span>
                  <span className="font-medium">₹2,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last reviewed</span>
                  <span className="font-medium">30 days ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          {insight.action && (
            <Button variant="gradient" className="flex-1" onClick={onClose}>
              {insight.action}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
