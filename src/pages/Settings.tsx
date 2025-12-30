import { useState, useEffect, useRef } from "react";
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
  Pencil,
  User,
  Lock,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Building2,
  CreditCard,
  Wallet,
  Tag,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/FinanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { CategoryModal, AutomationRuleModal, InsightDetailModal, DeleteAccountModal, AccountModal, CreditCardModal, DebitCardModal } from "@/components/modals";
import { Category, AutomationRule, BankAccount, CreditCardType, DebitCardType } from "@/hooks/useFinanceData";
import { toast } from "sonner";
import api from "@/services/api";
import { exportToExcel, exportToCSV, exportToPDF } from "@/services/exportService";
import { useUserSetup } from "@/hooks/useUserSetup";
import { useSettingsOptions } from "@/hooks/useSettingsOptions";

interface Insight {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  description: string;
  action?: string;
}

const insights: Insight[] = [];

export default function SettingsPage() {
  const { 
    transactions,
    budgetCategories,
    bankAccounts,
    creditCards,
    debitCards,
    investments,
    sips,
    categories, 
    automationRules,
    addCategory,
    updateCategory,
    deleteCategory,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addDebitCard,
    updateDebitCard,
    deleteDebitCard,
    toggleAutomationRule,
    addAutomationRule,
    updateAutomationRule,
    deleteAutomationRule
  } = useFinance();
  
  const { user, changePassword, resetPassword } = useAuth();
  const { needsSetup, isNewUser } = useUserSetup();
  const { options, updateOptions, isLoading: isLoadingOptions } = useSettingsOptions();
  
  // Track if user has dismissed the setup (persist in localStorage)
  const SETUP_DISMISSED_KEY = 'financeflow_setup_dismissed';
  const [setupDismissed, setSetupDismissed] = useState(() => {
    return localStorage.getItem(SETUP_DISMISSED_KEY) === 'true';
  });
  
  // Clear dismissed state if user is truly new (has no data)
  // Use a ref to track if we've already cleared it to prevent infinite loops
  const hasClearedDismissed = useRef(false);
  useEffect(() => {
    if (isNewUser && setupDismissed && !hasClearedDismissed.current) {
      setSetupDismissed(false);
      localStorage.removeItem(SETUP_DISMISSED_KEY);
      hasClearedDismissed.current = true;
    }
  }, [isNewUser, setupDismissed]);
  
  // Show setup tab if user hasn't dismissed it yet
  // This allows users to continue adding data even after adding their first account
  // The tab will only disappear when they click "Continue" or "Skip Setup"
  const showSetupTab = !setupDismissed;
  
  // Initialize activeTab - use a ref to track if we've already set it from needsSetup
  const hasSetInitialTab = useRef(false);
  const [activeTab, setActiveTab] = useState("insights");
  
  // Set initial tab to setup if user needs setup (only once)
  useEffect(() => {
    if (showSetupTab && !hasSetInitialTab.current) {
      setActiveTab("setup");
      hasSetInitialTab.current = true;
    }
  }, [showSetupTab]);
  
  // Handler to dismiss setup
  const handleDismissSetup = () => {
    setSetupDismissed(true);
    localStorage.setItem(SETUP_DISMISSED_KEY, 'true');
    setActiveTab("insights");
  };
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);
  const [isDebitCardModalOpen, setIsDebitCardModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [selectedCreditCard, setSelectedCreditCard] = useState<CreditCardType | null>(null);
  const [selectedDebitCard, setSelectedDebitCard] = useState<DebitCardType | null>(null);
  
  // Custom options state
  const [customOptions, setCustomOptions] = useState({
    investmentTypes: options.investmentTypes,
    accountTypes: options.accountTypes,
    commitmentTypes: options.commitmentTypes,
    sipFrequencies: options.sipFrequencies,
    cardNetworks: options.cardNetworks,
    vaultCategories: options.vaultCategories,
  });
  
  useEffect(() => {
    setCustomOptions({
      investmentTypes: options.investmentTypes,
      accountTypes: options.accountTypes,
      commitmentTypes: options.commitmentTypes,
      sipFrequencies: options.sipFrequencies,
      cardNetworks: options.cardNetworks,
      vaultCategories: options.vaultCategories,
    });
  }, [options]);

  // Account settings state
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

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
            {showSetupTab && (
              <TabsTrigger 
                value="setup" 
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  showSetupTab && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <Zap className="h-4 w-4 mr-2" />
                Initial Setup
                {showSetupTab && <Badge variant="destructive" className="ml-2">New</Badge>}
              </TabsTrigger>
            )}
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
            <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Account
            </TabsTrigger>
          </TabsList>

          {/* Initial Setup Tab */}
          {showSetupTab && (
            <TabsContent value="setup" className="mt-6 space-y-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Welcome! Let's Get Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Set up your finance tracker by adding your accounts, cards, and categories. 
                    This will help you get the most out of the app. You can skip any step and add data later.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Add Bank Accounts */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Bank Accounts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Add your bank accounts with current balances
                        </p>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedAccount(null);
                              setIsAccountModalOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Account
                          </Button>
                          {bankAccounts.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs text-success font-medium">
                                ✓ {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''} added:
                              </p>
                              <div className="space-y-1">
                                {bankAccounts.map((account) => (
                                  <div key={account.id} className="text-xs text-muted-foreground flex items-center gap-2 p-2 bg-muted/50 rounded">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: account.color || '#6366f1' }}
                                    />
                                    <span className="font-medium">{account.bank} {account.name}</span>
                                    <span className="ml-auto">₹{account.balance.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Add Cards */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit & Debit Cards
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Add your credit and debit cards
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedCreditCard(null);
                              setIsCreditCardModalOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Credit Card
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedDebitCard(null);
                              setIsDebitCardModalOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Debit Card
                          </Button>
                        </div>
                        {(creditCards.length > 0 || debitCards.length > 0) && (
                          <p className="text-xs text-success mt-2">
                            ✓ {creditCards.length + debitCards.length} card{creditCards.length + debitCards.length !== 1 ? 's' : ''} added
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Add Categories */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Categories
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Create income and expense categories for your transactions
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(null);
                            setIsCategoryModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Category
                        </Button>
                        {categories.length > 0 && (
                          <p className="text-xs text-success mt-2">
                            ✓ {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} added
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="gradient" 
                        onClick={() => {
                          if (bankAccounts.length > 0 || categories.length > 0) {
                            toast.success("Setup complete! You can continue adding data anytime.");
                          } else {
                            toast.info("You can continue adding data later from the respective pages.");
                          }
                          handleDismissSetup();
                        }}
                      >
                        Continue
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleDismissSetup}
                      >
                        Skip Setup
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="insights" className="mt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Smart Insights</h2>
              {insights.length > 0 && (
                <Badge variant="secondary" className="ml-auto">{insights.length} new</Badge>
              )}
            </div>
            
            {insights.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-sm">No insights available</p>
              </div>
            ) : (
              insights.map((insight, index) => {
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
              })
            )}
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

              {/* Custom Options Management */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-5 w-5 text-primary" />
                    Custom Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your custom types and options that appear in dropdowns throughout the app.
                  </p>

                  {/* Investment Types */}
                  <div className="space-y-2">
                    <Label>Investment Types</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {customOptions.investmentTypes.map((type, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {type}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => {
                              const updated = customOptions.investmentTypes.filter((_, i) => i !== idx);
                              setCustomOptions({ ...customOptions, investmentTypes: updated });
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="e.g., Mutual Fund, Stock"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          if (!customOptions.investmentTypes.includes(value)) {
                            setCustomOptions({
                              ...customOptions,
                              investmentTypes: [...customOptions.investmentTypes, value]
                            });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Account Types */}
                  <div className="space-y-2">
                    <Label>Account Types</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {customOptions.accountTypes.map((type, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {type}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => {
                              const updated = customOptions.accountTypes.filter((_, i) => i !== idx);
                              setCustomOptions({ ...customOptions, accountTypes: updated });
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="e.g., Savings Account, Current Account"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          if (!customOptions.accountTypes.includes(value)) {
                            setCustomOptions({
                              ...customOptions,
                              accountTypes: [...customOptions.accountTypes, value]
                            });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Commitment Types */}
                  <div className="space-y-2">
                    <Label>Commitment Types</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {customOptions.commitmentTypes.map((type, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {type}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => {
                              const updated = customOptions.commitmentTypes.filter((_, i) => i !== idx);
                              setCustomOptions({ ...customOptions, commitmentTypes: updated });
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="e.g., Bill, Subscription, Loan"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          if (!customOptions.commitmentTypes.includes(value)) {
                            setCustomOptions({
                              ...customOptions,
                              commitmentTypes: [...customOptions.commitmentTypes, value]
                            });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  {/* SIP Frequencies */}
                  <div className="space-y-2">
                    <Label>SIP Frequencies</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {customOptions.sipFrequencies.map((freq, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {freq}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => {
                              const updated = customOptions.sipFrequencies.filter((_, i) => i !== idx);
                              setCustomOptions({ ...customOptions, sipFrequencies: updated });
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="e.g., Monthly, Weekly, Quarterly"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          if (!customOptions.sipFrequencies.includes(value)) {
                            setCustomOptions({
                              ...customOptions,
                              sipFrequencies: [...customOptions.sipFrequencies, value]
                            });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Card Networks */}
                  <div className="space-y-2">
                    <Label>Card Networks</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {customOptions.cardNetworks.map((network, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {network}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => {
                              const updated = customOptions.cardNetworks.filter((_, i) => i !== idx);
                              setCustomOptions({ ...customOptions, cardNetworks: updated });
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="e.g., Visa, Mastercard, RuPay"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          if (!customOptions.cardNetworks.includes(value)) {
                            setCustomOptions({
                              ...customOptions,
                              cardNetworks: [...customOptions.cardNetworks, value]
                            });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Vault Categories */}
                  <div className="space-y-2">
                    <Label>Vault Categories</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {customOptions.vaultCategories.map((cat, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {cat}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => {
                              const updated = customOptions.vaultCategories.filter((_, i) => i !== idx);
                              setCustomOptions({ ...customOptions, vaultCategories: updated });
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="e.g., Identity, Travel, Documents"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          if (!customOptions.vaultCategories.includes(value)) {
                            setCustomOptions({
                              ...customOptions,
                              vaultCategories: [...customOptions.vaultCategories, value]
                            });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  <Button
                    variant="gradient"
                    className="w-full mt-4"
                    onClick={() => {
                      updateOptions(customOptions);
                    }}
                    disabled={isLoadingOptions}
                  >
                    Save Options
                  </Button>
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

          <TabsContent value="account" className="mt-6">
            <div className="space-y-6">
              {/* Profile Information */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={user?.name || ""} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <Input value={user?.memberSince || ""} disabled className="bg-muted" />
                  </div>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (passwordErrors.current) {
                            setPasswordErrors({ ...passwordErrors, current: undefined });
                          }
                        }}
                        className={cn("pr-10", passwordErrors.current && "border-destructive")}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.current && (
                      <p className="text-xs text-destructive">{passwordErrors.current}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordErrors.new) {
                            setPasswordErrors({ ...passwordErrors, new: undefined });
                          }
                          if (confirmNewPassword && e.target.value !== confirmNewPassword && passwordErrors.confirm) {
                            setPasswordErrors({ ...passwordErrors, confirm: "Passwords do not match" });
                          } else if (confirmNewPassword && e.target.value === confirmNewPassword) {
                            setPasswordErrors({ ...passwordErrors, confirm: undefined });
                          }
                        }}
                        className={cn("pr-10", passwordErrors.new && "border-destructive")}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.new ? (
                      <p className="text-xs text-destructive">{passwordErrors.new}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-new-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          if (passwordErrors.confirm) {
                            setPasswordErrors({ ...passwordErrors, confirm: undefined });
                          }
                          if (e.target.value && newPassword && e.target.value !== newPassword) {
                            setPasswordErrors({ ...passwordErrors, confirm: "Passwords do not match" });
                          }
                        }}
                        className={cn("pr-10", passwordErrors.confirm && "border-destructive")}
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.confirm && (
                      <p className="text-xs text-destructive">{passwordErrors.confirm}</p>
                    )}
                  </div>

                  <Button
                    variant="gradient"
                    className="w-full"
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                    onClick={async () => {
                      const errors: typeof passwordErrors = {};
                      let isValid = true;

                      if (!currentPassword) {
                        errors.current = "Current password is required";
                        isValid = false;
                      }

                      if (!newPassword) {
                        errors.new = "New password is required";
                        isValid = false;
                      } else if (newPassword.length < 6) {
                        errors.new = "Password must be at least 6 characters";
                        isValid = false;
                      }

                      if (!confirmNewPassword) {
                        errors.confirm = "Please confirm your password";
                        isValid = false;
                      } else if (newPassword !== confirmNewPassword) {
                        errors.confirm = "Passwords do not match";
                        isValid = false;
                      }

                      setPasswordErrors(errors);
                      if (!isValid) return;

                      setIsChangingPassword(true);
                      const result = await changePassword(currentPassword, newPassword);
                      setIsChangingPassword(false);

                      if (result.success) {
                        toast.success("Password changed successfully");
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmNewPassword("");
                        setPasswordErrors({});
                      } else {
                        toast.error(result.error || "Failed to change password");
                        if (result.error?.toLowerCase().includes("current")) {
                          setPasswordErrors({ current: result.error });
                        }
                      }
                    }}
                  >
                    {isChangingPassword ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Reset Password */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-5 w-5 text-primary" />
                    Reset Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder={user?.email || "your@email.com"}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isResettingPassword || !resetEmail}
                    onClick={async () => {
                      setIsResettingPassword(true);
                      const result = await resetPassword(resetEmail || user?.email || "");
                      setIsResettingPassword(false);

                      if (result.success) {
                        toast.success("Password reset link sent to your email");
                        setResetEmail("");
                      } else {
                        toast.error(result.error || "Failed to send reset email");
                      }
                    }}
                  >
                    {isResettingPassword ? (
                      <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Export Data */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Download className="h-5 w-5 text-primary" />
                    Export Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Download all your financial data in various formats for backup or analysis.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isExporting}
                      onClick={async () => {
                        setIsExporting(true);
                        try {
                          const result = exportToExcel(
                            transactions,
                            budgetCategories,
                            bankAccounts,
                            creditCards,
                            debitCards,
                            investments,
                            sips,
                            categories
                          );
                          if (result.success) {
                            toast.success(`Exported to ${result.filename}`);
                          } else {
                            toast.error(result.error || "Failed to export data");
                          }
                        } catch (error) {
                          toast.error("Failed to export data");
                        } finally {
                          setIsExporting(false);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isExporting}
                      onClick={async () => {
                        setIsExporting(true);
                        try {
                          const result = exportToCSV(
                            transactions,
                            budgetCategories,
                            bankAccounts,
                            creditCards,
                            debitCards,
                            investments,
                            sips,
                            categories
                          );
                          if (result.success) {
                            toast.success(`Exported to ${result.filename}`);
                          } else {
                            toast.error(result.error || "Failed to export data");
                          }
                        } catch (error) {
                          toast.error("Failed to export data");
                        } finally {
                          setIsExporting(false);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isExporting}
                      onClick={async () => {
                        setIsExporting(true);
                        try {
                          const result = exportToPDF(
                            transactions,
                            budgetCategories,
                            bankAccounts,
                            creditCards,
                            debitCards,
                            investments,
                            sips,
                            categories
                          );
                          if (result.success) {
                            toast.success(`Exported to ${result.filename}`);
                          } else {
                            toast.error(result.error || "Failed to export data");
                          }
                        } catch (error) {
                          toast.error("Failed to export data");
                        } finally {
                          setIsExporting(false);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Delete Account */}
              <Card className="glass-card border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Delete Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-foreground font-medium mb-2">Warning: This action cannot be undone</p>
                    <p className="text-xs text-muted-foreground">
                      Deleting your account will permanently remove all your data including:
                    </p>
                    <ul className="text-xs text-muted-foreground mt-2 list-disc list-inside space-y-1">
                      <li>All transactions and transaction history</li>
                      <li>All budgets and budget categories</li>
                      <li>All accounts, credit cards, and debit cards</li>
                      <li>All investments and SIPs</li>
                      <li>All categories and automation rules</li>
                      <li>All vault items and secure notes</li>
                    </ul>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setIsDeleteAccountModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
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

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setSelectedAccount(null);
        }}
        onSave={addBankAccount}
        onUpdate={updateBankAccount}
        onDelete={deleteBankAccount}
        account={selectedAccount}
      />

      {/* Credit Card Modal */}
      <CreditCardModal
        isOpen={isCreditCardModalOpen}
        onClose={() => {
          setIsCreditCardModalOpen(false);
          setSelectedCreditCard(null);
        }}
        onSave={addCreditCard}
        onUpdate={updateCreditCard}
        onDelete={deleteCreditCard}
        card={selectedCreditCard}
      />

      {/* Debit Card Modal */}
      <DebitCardModal
        isOpen={isDebitCardModalOpen}
        onClose={() => {
          setIsDebitCardModalOpen(false);
          setSelectedDebitCard(null);
        }}
        onSave={addDebitCard}
        onUpdate={updateDebitCard}
        onDelete={deleteDebitCard}
        card={selectedDebitCard}
        bankAccounts={bankAccounts.map(acc => ({ name: `${acc.bank} ${acc.name}` }))}
      />
    </>
  );
}
