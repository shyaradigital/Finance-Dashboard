import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Housing", value: 25000, color: "hsl(270, 60%, 55%)" },
  { name: "Food", value: 12000, color: "hsl(280, 70%, 60%)" },
  { name: "Transport", value: 8500, color: "hsl(160, 60%, 45%)" },
  { name: "Shopping", value: 9000, color: "hsl(35, 90%, 55%)" },
  { name: "Entertainment", value: 5500, color: "hsl(200, 70%, 50%)" },
  { name: "Others", value: 7450, color: "hsl(270, 20%, 70%)" },
];

const total = data.reduce((sum, item) => sum + item.value, 0);

export default function CategorySpendChart() {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
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
            {data.map((item, index) => (
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
      </CardContent>
    </Card>
  );
}
