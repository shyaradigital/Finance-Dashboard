import { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  Sparkles, 
  Settings, 
  Bell, 
  Tag, 
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  description: string;
  action?: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  count: number;
  color: string;
}

const insights: Insight[] = [
  { id: "1", type: "warning", title: "Unusual Spending Detected", description: "Your shopping expenses are 45% higher than last month. Consider reviewing your purchases.", action: "View Details" },
  { id: "2", type: "success", title: "Savings Goal On Track", description: "You're on track to reach your emergency fund goal by March 2025.", action: "View Progress" },
  { id: "3", type: "info", title: "Subscription Review", description: "You have 5 active subscriptions totaling ₹2,500/month. Last reviewed 30 days ago.", action: "Review" },
  { id: "4", type: "warning", title: "Credit Utilization High", description: "Your HDFC card utilization is above 70%. This may affect your credit score.", action: "Pay Now" },
  { id: "5", type: "success", title: "Investment Returns Up", description: "Your portfolio has gained 12.5% this month, outperforming the market.", action: "View Portfolio" },
];

const categories: Category[] = [
  { id: "1", name: "Salary", type: "income", count: 12, color: "bg-success" },
  { id: "2", name: "Freelance", type: "income", count: 8, color: "bg-accent" },
  { id: "3", name: "Housing", type: "expense", count: 12, color: "bg-primary" },
  { id: "4", name: "Food & Dining", type: "expense", count: 45, color: "bg-warning" },
  { id: "5", name: "Shopping", type: "expense", count: 23, color: "bg-destructive" },
  { id: "6", name: "Transport", type: "expense", count: 34, color: "bg-muted-foreground" },
  { id: "7", name: "Entertainment", type: "expense", count: 18, color: "bg-accent" },
  { id: "8", name: "Utilities", type: "expense", count: 12, color: "bg-primary" },
];

const automationRules = [
  { id: "1", name: "Auto-categorize Amazon", description: "Categorize Amazon transactions as Shopping", enabled: true },
  { id: "2", name: "Salary Detection", description: "Auto-tag monthly salary credits", enabled: true },
  { id: "3", name: "Recurring Bill Alert", description: "Notify 3 days before due date", enabled: true },
  { id: "4", name: "Budget Warning", description: "Alert when 80% budget consumed", enabled: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("insights");
  const [rules, setRules] = useState(automationRules);

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "warning": return AlertTriangle;
      case "success": return CheckCircle;
      default: return Sparkles;
    }
  };

  const getInsightStyles = (type: Insight["type"]) => {
    switch (type) {
      case "warning": return { bg: "bg-warning/5", icon: "bg-warning/10 text-warning", border: "border-warning/20" };
      case "success": return { bg: "bg-success/5", icon: "bg-success/10 text-success", border: "border-success/20" };
      default: return { bg: "bg-primary/5", icon: "bg-primary/10 text-primary", border: "border-primary/20" };
    }
  };

  return (
    <>
      <Helmet>
        <title>Insights & Settings | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="View smart financial insights, manage automation rules, and customize your preferences." />
      </Helmet>

      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border p-1 h-auto">
            <TabsTrigger value="insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Insights
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Automation
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Categories
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Smart Insights</h2>
              <Badge variant="secondary" className="ml-auto">{insights.length} new</Badge>
            </div>
            
            {insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              const styles = getInsightStyles(insight.type);
              
              return (
                <Card 
                  key={insight.id}
                  className={cn(
                    "border opacity-0 animate-fade-in cursor-pointer group transition-all duration-200 hover:shadow-md",
                    styles.bg,
                    styles.border
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", styles.icon)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        {insight.action && (
                          <Button variant="link" className="h-auto p-0 mt-2 text-primary text-sm">
                            {insight.action}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="automation" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Automation Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <p className="font-medium text-foreground">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <Switch 
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Create New Rule
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Income Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.filter(c => c.type === "income").map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer opacity-0 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-3 w-3 rounded-full", category.color)} />
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.count} txns</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    Expense Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.filter(c => c.type === "expense").map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer opacity-0 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-3 w-3 rounded-full", category.color)} />
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.count} txns</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Transaction Alerts", description: "Get notified for every transaction" },
                    { label: "Budget Warnings", description: "Alert when nearing budget limits" },
                    { label: "Bill Reminders", description: "Reminder before bill due dates" },
                    { label: "Weekly Summary", description: "Weekly spending summary digest" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={index < 3} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-5 w-5 text-primary" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Globe, label: "Currency", value: "INR (₹)" },
                    { icon: Moon, label: "Theme", value: "System" },
                    { icon: Shield, label: "Security", value: "Biometric enabled" },
                    { icon: HelpCircle, label: "Help & Support", value: "" },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
