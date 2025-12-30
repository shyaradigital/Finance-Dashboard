import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getAccessToken } from "@/services/api";
import { queryKeys } from "@/hooks/useFinanceQueries";
import { cn } from "@/lib/utils";

export default function SpendTypeChart() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.spendType,
    queryFn: async () => {
      try {
        const response = await api.analytics.getSpendType();
        if (!response.success || !response.data) {
          if (response.error?.includes('Too many requests')) {
            throw new Error('RATE_LIMIT');
          }
          return [];
        }
        const backendData = response.data as { fixed: number; variable: number; total: number };
        const total = backendData.total || 0;
        if (total === 0) {
          return [];
        }
        return [
          {
            type: "Fixed",
            amount: backendData.fixed,
            percentage: (backendData.fixed / total) * 100,
            color: "bg-primary",
          },
          {
            type: "Variable",
            amount: backendData.variable,
            percentage: (backendData.variable / total) * 100,
            color: "bg-accent",
          },
        ];
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

  const spendData = data || [];
  const total = spendData.reduce((sum, item) => sum + item.amount, 0);
  const hasData = spendData.length > 0 && total > 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Fixed vs Variable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="h-[120px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Loading spend type data...</p>
            </div>
          </div>
        ) : hasData ? (
          <>
            {/* Progress bar */}
            <div className="relative h-4 rounded-full bg-muted overflow-hidden">
              {spendData.map((item, index) => (
                <div
                  key={index}
                  className={cn("absolute top-0 h-full transition-all duration-500", item.color)}
                  style={{
                    left: index === 0 ? 0 : `${spendData[0].percentage}%`,
                    width: `${item.percentage}%`,
                  }}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-4">
              {spendData.map((item, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "rounded-xl p-4 transition-all duration-200 hover:shadow-sm",
                    index === 0 ? "bg-primary/5" : "bg-accent/5"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("h-3 w-3 rounded-full", item.color)} />
                    <span className="text-sm font-medium text-foreground">{item.type}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.percentage}% of total spend
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Total Expenses</span>
              <span className="text-lg font-bold text-foreground">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </>
        ) : (
          <div className="h-[120px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">No expense data available</p>
              <p className="text-muted-foreground text-xs mt-1">Add expenses to see fixed vs variable breakdown</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
