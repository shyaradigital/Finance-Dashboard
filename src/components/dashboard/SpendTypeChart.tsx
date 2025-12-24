import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const spendData = [
  { type: "Fixed", amount: 42000, percentage: 62, color: "bg-primary" },
  { type: "Variable", amount: 25450, percentage: 38, color: "bg-accent" },
];

export default function SpendTypeChart() {
  const total = spendData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Fixed vs Variable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
}
