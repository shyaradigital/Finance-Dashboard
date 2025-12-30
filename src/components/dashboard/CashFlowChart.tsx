import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, getAccessToken } from "@/services/api";
import { queryKeys } from "@/hooks/useFinanceQueries";
import { cn } from "@/lib/utils";

export default function CashFlowChart() {
  const [view, setView] = useState<"month" | "quarter">("month");
  
  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.cashFlow, view],
    queryFn: async () => {
      try {
        const response = await api.analytics.getCashFlow(view);
        if (!response.success || !response.data) {
          if (response.error?.includes('Too many requests')) {
            throw new Error('RATE_LIMIT');
          }
          return [];
        }
        return response.data as Array<{ name: string; income: number; expense: number }>;
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
  const hasData = chartData.length > 0 && chartData.some(d => d.income > 0 || d.expense > 0);

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Cash Flow</CardTitle>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs",
              view === "month" && "bg-card shadow-sm"
            )}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs",
              view === "quarter" && "bg-card shadow-sm"
            )}
            onClick={() => setView("quarter")}
          >
            Quarter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Loading cash flow data...</p>
            </div>
          </div>
        ) : hasData ? (
          <>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(270, 20%, 90%)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(270, 15%, 45%)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(270, 15%, 45%)', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(270, 20%, 90%)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px hsla(270, 25%, 15%, 0.1)'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(160, 60%, 45%)"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="hsl(0, 70%, 55%)"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                    name="Expense"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-sm text-muted-foreground">Expense</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">No cash flow data available</p>
              <p className="text-muted-foreground text-xs mt-1">Add transactions to see your income and expenses</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
