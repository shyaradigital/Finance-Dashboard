import { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  Home, 
  Utensils, 
  ShoppingBag, 
  Car, 
  Gamepad2, 
  Wifi,
  Heart,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/FinanceContext";
import { BudgetModal, CommitmentModal } from "@/components/modals";
import { BudgetCategory, UpcomingCommitment } from "@/hooks/useFinanceData";

function BudgetCard({ 
  category, 
  delay,
  onClick 
}: { 
  category: BudgetCategory; 
  delay: number;
  onClick: () => void;
}) {
  const Icon = category.icon;
  const percentage = (category.spent / category.budget) * 100;
  const isOverBudget = percentage > 100;
  const remaining = category.budget - category.spent;

  return (
    <Card 
      className={cn(
        "glass-card opacity-0 animate-fade-in transition-all duration-200 hover:shadow-md cursor-pointer",
        isOverBudget && "border-destructive/30"
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", category.color + "/10")}>
              <Icon className={cn("h-5 w-5", category.color.replace("bg-", "text-"))} />
            </div>
            <div>
              <p className="font-medium text-foreground">{category.name}</p>
              <p className="text-xs text-muted-foreground">
                ₹{category.spent.toLocaleString('en-IN')} of ₹{category.budget.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          {isOverBudget ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : percentage > 80 ? (
            <AlertCircle className="h-5 w-5 text-warning" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-success" />
          )}
        </div>
        
        <Progress 
          value={Math.min(percentage, 100)} 
          className={cn("h-2", isOverBudget && "[&>div]:bg-destructive")}
        />
        
        <div className="flex items-center justify-between mt-2">
          <span className={cn(
            "text-xs font-medium",
            isOverBudget ? "text-destructive" : remaining > category.budget * 0.3 ? "text-success" : "text-warning"
          )}>
            {isOverBudget ? `₹${Math.abs(remaining).toLocaleString('en-IN')} over` : `₹${remaining.toLocaleString('en-IN')} left`}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Budget() {
  const { 
    budgetCategories, 
    commitments, 
    addBudgetCategory, 
    updateBudgetCategory, 
    deleteBudgetCategory,
    addCommitment,
    updateCommitment,
    deleteCommitment
  } = useFinance();
  
  const [activeTab, setActiveTab] = useState("budget");
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);
  const [selectedCommitment, setSelectedCommitment] = useState<UpcomingCommitment | null>(null);
  
  const totalBudget = budgetCategories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = budgetCategories.reduce((sum, c) => sum + c.spent, 0);
  const overallPercentage = (totalSpent / totalBudget) * 100;
  const totalCommitments = commitments.reduce((sum, c) => sum + c.amount, 0);

  const handleEditBudget = (budget: BudgetCategory) => {
    setSelectedBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleAddBudget = () => {
    setSelectedBudget(null);
    setIsBudgetModalOpen(true);
  };

  const handleEditCommitment = (commitment: UpcomingCommitment) => {
    setSelectedCommitment(commitment);
    setIsCommitmentModalOpen(true);
  };

  const handleAddCommitment = () => {
    setSelectedCommitment(null);
    setIsCommitmentModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Budget & Planning | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="Plan your monthly budget, track spending limits, and forecast your financial future." />
      </Helmet>

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold text-foreground mt-1">₹{totalBudget.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card bg-gradient-to-br from-success/5 to-success/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Spent So Far</p>
                  <p className="text-2xl font-bold text-foreground mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-success mt-1">{Math.round(overallPercentage)}% of budget</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <TrendingDown className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="glass-card bg-gradient-to-br from-warning/5 to-warning/10 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleAddCommitment}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Commitments</p>
                  <p className="text-2xl font-bold text-foreground mt-1">₹{totalCommitments.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-warning mt-1">Next 30 days</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Calendar className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-card border border-border p-1 h-auto">
              <TabsTrigger value="budget" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Monthly Budget
              </TabsTrigger>
              <TabsTrigger value="commitments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="forecast" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Forecast
              </TabsTrigger>
            </TabsList>
            
            {activeTab === "budget" && (
              <Button variant="gradient" className="gap-2" onClick={handleAddBudget}>
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            )}
            {activeTab === "commitments" && (
              <Button variant="gradient" className="gap-2" onClick={handleAddCommitment}>
                <Plus className="h-4 w-4" />
                Add Commitment
              </Button>
            )}
          </div>

          <TabsContent value="budget" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgetCategories.map((category, index) => (
                <BudgetCard 
                  key={category.id} 
                  category={category} 
                  delay={index * 50}
                  onClick={() => handleEditBudget(category)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="commitments" className="mt-6 space-y-3">
            {commitments.map((commitment, index) => (
              <Card 
                key={commitment.id} 
                className="glass-card opacity-0 animate-fade-in cursor-pointer hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleEditCommitment(commitment)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        commitment.type === "bill" && "bg-destructive/10 text-destructive",
                        commitment.type === "subscription" && "bg-primary/10 text-primary",
                        commitment.type === "loan" && "bg-warning/10 text-warning"
                      )}>
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{commitment.name}</p>
                        <p className="text-sm text-muted-foreground">Due: {commitment.dueDate}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">₹{commitment.amount.toLocaleString('en-IN')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="forecast" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Balance Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-2xl font-bold text-foreground">₹3,45,890</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-warning/5 border border-warning/20">
                    <div>
                      <p className="text-sm text-muted-foreground">After Commitments</p>
                      <p className="text-2xl font-bold text-foreground">₹3,02,622</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-warning" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/20">
                    <div>
                      <p className="text-sm text-muted-foreground">After Next Salary</p>
                      <p className="text-2xl font-bold text-foreground">₹4,27,622</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    "Can I Afford This?" Calculator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setSelectedBudget(null);
        }}
        onSave={addBudgetCategory}
        onUpdate={updateBudgetCategory}
        onDelete={deleteBudgetCategory}
        budget={selectedBudget}
      />

      {/* Commitment Modal */}
      <CommitmentModal
        isOpen={isCommitmentModalOpen}
        onClose={() => {
          setIsCommitmentModalOpen(false);
          setSelectedCommitment(null);
        }}
        onSave={addCommitment}
        onUpdate={updateCommitment}
        onDelete={deleteCommitment}
        commitment={selectedCommitment}
      />
    </>
  );
}
