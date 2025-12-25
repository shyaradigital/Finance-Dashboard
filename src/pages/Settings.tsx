import { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  Sparkles, 
  Settings, 
  Bell, 
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
  LogOut,
  Plus,
  Pencil
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/FinanceContext";
import { CategoryModal, AutomationRuleModal, InsightDetailModal } from "@/components/modals";
import { Category, AutomationRule } from "@/hooks/useFinanceData";
import { toast } from "sonner";

interface Insight {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  description: string;
  action?: string;
}

const insights: Insight[] = [
  { id: "1", type: "warning", title: "Unusual Spending Detected", description: "Your shopping expenses are 45% higher than last month. Consider reviewing your purchases.", action: "View Details" },
  { id: "2", type: "success", title: "Savings Goal On Track", description: "You're on track to reach your emergency fund goal by March 2025.", action: "View Progress" },
  { id: "3", type: "info", title: "Subscription Review", description: "You have 5 active subscriptions totaling ₹2,500/month. Last reviewed 30 days ago.", action: "Review" },
  { id: "4", type: "warning", title: "Credit Utilization High", description: "Your HDFC card utilization is above 70%. This may affect your credit score.", action: "Pay Now" },
  { id: "5", type: "success", title: "Investment Returns Up", description: "Your portfolio has gained 12.5% this month, outperforming the market.", action: "View Portfolio" },
];

export default function SettingsPage() {
  const { 
    categories, 
    automationRules,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleAutomationRule,
    addAutomationRule,
    updateAutomationRule,
    deleteAutomationRule
  } = useFinance();
  
  const [activeTab, setActiveTab] = useState("insights");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    transactionAlerts: true,
    budgetWarnings: true,
    billReminders: true,
    weeklySummary: false,
  });

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setIsRuleModalOpen(true);
  };

  const handleAddRule = () => {
    setSelectedRule(null);
    setIsRuleModalOpen(true);
  };

  const handleInsightClick = (insight: Insight) => {
    setSelectedInsight(insight);
    setIsInsightModalOpen(true);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const newValue = !prev[key];
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${newValue ? 'enabled' : 'disabled'}`);
      return { ...prev, [key]: newValue };
    });
  };

  const handlePreferenceClick = (label: string) => {
    toast.info(`Opening ${label} settings...`);
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
                  onClick={() => handleInsightClick(insight)}
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Automation Rules
                </CardTitle>
                <Button variant="gradient" size="sm" onClick={handleAddRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Rule
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                  {automationRules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 opacity-0 animate-fade-in hover:bg-muted transition-colors cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleEditRule(rule)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <Switch 
                      checked={rule.enabled}
                      onCheckedChange={() => toggleAutomationRule(rule.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="flex items-center justify-end mb-4">
              <Button variant="gradient" onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
            
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
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer opacity-0 animate-fade-in group"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleEditCategory(category)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-3 w-3 rounded-full", category.color)} />
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{category.count} txns</Badge>
                        <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
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
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer opacity-0 animate-fade-in group"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleEditCategory(category)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-3 w-3 rounded-full", category.color)} />
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{category.count} txns</Badge>
                        <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
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
                    { key: "transactionAlerts" as const, label: "Transaction Alerts", description: "Get notified for every transaction" },
                    { key: "budgetWarnings" as const, label: "Budget Warnings", description: "Alert when nearing budget limits" },
                    { key: "billReminders" as const, label: "Bill Reminders", description: "Reminder before bill due dates" },
                    { key: "weeklySummary" as const, label: "Weekly Summary", description: "Weekly spending summary digest" },
                  ].map((item) => (
                    <div 
                      key={item.key} 
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleNotification(item.key)}
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch 
                        checked={notifications[item.key]} 
                        onCheckedChange={() => toggleNotification(item.key)}
                        onClick={(e) => e.stopPropagation()}
                      />
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
                      onClick={() => handlePreferenceClick(item.label)}
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

              <Button 
                variant="outline" 
                className="w-full text-destructive hover:text-destructive"
                onClick={() => toast.info("Sign out functionality would be implemented with authentication")}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        onSave={addCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
        category={selectedCategory}
      />

      {/* Automation Rule Modal */}
      <AutomationRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => {
          setIsRuleModalOpen(false);
          setSelectedRule(null);
        }}
        onSave={addAutomationRule}
        onUpdate={updateAutomationRule}
        onDelete={deleteAutomationRule}
        rule={selectedRule}
      />

      {/* Insight Detail Modal */}
      <InsightDetailModal
        isOpen={isInsightModalOpen}
        onClose={() => setIsInsightModalOpen(false)}
        insight={selectedInsight}
      />
    </>
  );
}
