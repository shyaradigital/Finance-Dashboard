import { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  ShoppingBag,
  Utensils,
  Home,
  Car,
  Gamepad2,
  Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  isRecurring?: boolean;
  account: string;
  icon: React.ElementType;
}

const transactions: Transaction[] = [
  { id: "1", type: "expense", category: "Shopping", description: "Amazon - Electronics", amount: 12499, date: "Today", account: "HDFC Credit Card", icon: ShoppingBag },
  { id: "2", type: "expense", category: "Food", description: "Swiggy", amount: 856, date: "Today", account: "ICICI Debit", icon: Utensils },
  { id: "3", type: "income", category: "Salary", description: "Monthly Salary", amount: 125000, date: "Yesterday", isRecurring: true, account: "HDFC Savings", icon: Receipt },
  { id: "4", type: "expense", category: "Housing", description: "Rent Payment", amount: 25000, date: "Dec 20", isRecurring: true, account: "HDFC Savings", icon: Home },
  { id: "5", type: "expense", category: "Transport", description: "Uber Rides", amount: 1240, date: "Dec 19", account: "ICICI Debit", icon: Car },
  { id: "6", type: "expense", category: "Entertainment", description: "Netflix Subscription", amount: 649, date: "Dec 18", isRecurring: true, account: "HDFC Credit Card", icon: Gamepad2 },
  { id: "7", type: "expense", category: "Food", description: "Grocery - BigBasket", amount: 3420, date: "Dec 17", account: "HDFC Debit", icon: Utensils },
  { id: "8", type: "income", category: "Freelance", description: "Design Project", amount: 35000, date: "Dec 15", account: "HDFC Savings", icon: Receipt },
];

function TransactionItem({ transaction, delay }: { transaction: Transaction; delay: number }) {
  const Icon = transaction.icon;
  
  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:shadow-md transition-all duration-200 opacity-0 animate-fade-in group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
        transaction.type === "income" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">{transaction.description}</p>
          {transaction.isRecurring && (
            <RefreshCw className="h-3 w-3 text-primary shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {transaction.category} · {transaction.account}
        </p>
      </div>
      
      <div className="text-right shrink-0">
        <p className={cn(
          "font-semibold",
          transaction.type === "income" ? "text-success" : "text-foreground"
        )}>
          {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{transaction.date}</p>
      </div>
      
      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function Transactions() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === "income") return t.type === "income";
    if (activeTab === "expenses") return t.type === "expense";
    if (activeTab === "recurring") return t.isRecurring;
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Transactions | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="Track and manage all your income, expenses, and recurring transactions in one place." />
      </Helmet>

      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-xl font-bold text-foreground">₹1,60,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-xl font-bold text-foreground">₹43,664</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recurring</p>
                  <p className="text-xl font-bold text-foreground">₹25,649</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  This Month
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Transaction List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border p-1 h-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All
            </TabsTrigger>
            <TabsTrigger value="income" className="data-[state=active]:bg-success data-[state=active]:text-success-foreground">
              Income
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="recurring" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Recurring
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <TransactionItem key={transaction.id} transaction={transaction} delay={index * 50} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Add Transaction Button (Mobile) */}
        <div className="flex justify-center lg:hidden">
          <Button variant="gradient" size="lg" className="gap-2">
            <TrendingUp className="h-5 w-5" />
            Add Transaction
          </Button>
        </div>
      </div>
    </>
  );
}
