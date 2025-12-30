import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  CalendarClock, 
  AlertTriangle, 
  CreditCard, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  Wallet
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, getAccessToken } from "@/services/api";
import { queryKeys } from "@/hooks/useFinanceQueries";
import { cn } from "@/lib/utils";
import { InsightDetailModal } from "@/components/modals";

interface Insight {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  description: string;
  action?: string;
  icon: React.ElementType;
}

// Map insight type to icon
const getInsightIcon = (type: string, title: string): React.ElementType => {
  if (title.toLowerCase().includes("card") || title.toLowerCase().includes("credit")) {
    return CreditCard;
  }
  if (title.toLowerCase().includes("budget")) {
    return Wallet;
  }
  if (title.toLowerCase().includes("income")) {
    return TrendingUp;
  }
  if (type === "warning") {
    return AlertTriangle;
  }
  if (type === "success") {
    return TrendingUp;
  }
  return CalendarClock;
};

interface InsightCardProps {
  insight: Insight;
  delay?: number;
  onClick: () => void;
}

function InsightCard({ insight, delay = 0, onClick }: InsightCardProps) {
  const Icon = insight.icon;
  
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
  };

  const styles = variantStyles[insight.type];

  return (
    <Card 
      className={cn(
        "border transition-all duration-300 hover:shadow-md opacity-0 animate-fade-in cursor-pointer group",
        styles.bg,
        styles.border
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">{insight.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
            {insight.action && (
              <Button 
                variant="link" 
                className="h-auto p-0 mt-2 text-xs text-primary font-medium group-hover:gap-2"
              >
                {insight.action}
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
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: backendInsights, isLoading, error } = useQuery({
    queryKey: queryKeys.insights,
    queryFn: async () => {
      try {
        const response = await api.analytics.getInsights();
        if (!response.success || !response.data) {
          if (response.error?.includes('Too many requests')) {
            throw new Error('RATE_LIMIT');
          }
          return [];
        }
        return response.data as Array<{
          id: string;
          type: "info" | "warning" | "success";
          title: string;
          description: string;
          action?: string;
        }>;
      } catch (err) {
        if (err instanceof Error && err.message === 'RATE_LIMIT') {
          throw err;
        }
        return [];
      }
    },
    enabled: !!getAccessToken(),
    retry: (failureCount, error: any) => {
      if (error?.message === 'RATE_LIMIT') {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 2 * 60 * 1000,
  });

  const insights: Insight[] = (backendInsights || []).map(insight => ({
    ...insight,
    icon: getInsightIcon(insight.type, insight.title),
  }));

  const handleInsightClick = (insight: Insight) => {
    setSelectedInsight(insight);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Smart Insights</h3>
        </div>
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground text-sm">Loading insights...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground text-sm">Unable to load insights</p>
            <p className="text-muted-foreground text-xs mt-1">Please try again later</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {insights.map((insight, index) => (
              <InsightCard 
                key={insight.id} 
                insight={insight} 
                delay={index * 100}
                onClick={() => handleInsightClick(insight)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground text-sm">No insights available</p>
            <p className="text-muted-foreground text-xs mt-1">Add transactions and accounts to get personalized insights</p>
          </div>
        )}
      </div>

      <InsightDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        insight={selectedInsight}
      />
    </>
  );
}
