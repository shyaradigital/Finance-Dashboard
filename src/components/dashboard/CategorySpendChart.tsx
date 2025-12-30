import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getAccessToken } from "@/services/api";
import { queryKeys } from "@/hooks/useFinanceQueries";

export default function CategorySpendChart() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.categorySpend,
    queryFn: async () => {
      try {
        const response = await api.analytics.getCategorySpend();
        if (!response.success || !response.data) {
          if (response.error?.includes('Too many requests')) {
            throw new Error('RATE_LIMIT');
          }
          return [];
        }
        const backendData = response.data as Array<{ categoryName: string; amount: number; color: string }>;
        return backendData.map(item => ({
          name: item.categoryName,
          value: item.amount,
          color: item.color || "#3b82f6",
        }));
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

  const chartData = data || [];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const hasData = chartData.length > 0 && total > 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Loading category data...</p>
            </div>
          </div>
        ) : hasData ? (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="relative h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(270, 20%, 90%)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px hsla(270, 25%, 15%, 0.1)'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-foreground">₹{(total / 1000).toFixed(1)}k</p>
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{item.value.toLocaleString('en-IN')} · {((item.value / total) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">No spending data available</p>
              <p className="text-muted-foreground text-xs mt-1">Add expenses to see category breakdown</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
