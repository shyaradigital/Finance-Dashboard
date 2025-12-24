import { 
  CalendarClock, 
  AlertTriangle, 
  CreditCard, 
  TrendingUp,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: string;
  variant?: "info" | "warning" | "success" | "neutral";
  delay?: number;
}

function InsightCard({ icon: Icon, title, description, action, variant = "neutral", delay = 0 }: InsightCardProps) {
  const variantStyles = {
    info: {
      bg: "bg-primary/5",
      icon: "bg-primary/10 text-primary",
      border: "border-primary/10"
    },
    warning: {
      bg: "bg-warning/5",
      icon: "bg-warning/10 text-warning",
      border: "border-warning/10"
    },
    success: {
      bg: "bg-success/5",
      icon: "bg-success/10 text-success",
      border: "border-success/10"
    },
    neutral: {
      bg: "bg-muted/50",
      icon: "bg-muted text-muted-foreground",
      border: "border-border"
    }
  };

  const styles = variantStyles[variant];

  return (
    <Card 
      className={cn(
        "border transition-all duration-300 hover:shadow-md opacity-0 animate-fade-in cursor-pointer group",
        styles.bg,
        styles.border
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
            {action && (
              <Button 
                variant="link" 
                className="h-auto p-0 mt-2 text-xs text-primary font-medium group-hover:gap-2"
              >
                {action}
                <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InsightCards() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Smart Insights</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InsightCard
          icon={CalendarClock}
          title="Salary Expected"
          description="Your salary of ₹1,25,000 is expected on Dec 28th based on your history."
          variant="success"
          delay={0}
        />
        <InsightCard
          icon={AlertTriangle}
          title="Rent Due Soon"
          description="Rent payment of ₹25,000 is due in 3 days. Ensure sufficient balance."
          action="Set Reminder"
          variant="warning"
          delay={100}
        />
        <InsightCard
          icon={CreditCard}
          title="Card Utilization High"
          description="Your HDFC credit card is at 78% utilization. Consider paying down."
          action="View Card"
          variant="warning"
          delay={200}
        />
        <InsightCard
          icon={TrendingUp}
          title="Savings Goal Progress"
          description="You're on track to save ₹58,000 this month. That's ₹12,000 above target!"
          variant="success"
          delay={300}
        />
      </div>
    </div>
  );
}
