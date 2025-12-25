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
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/FinanceContext";
import { TransactionModal } from "@/components/modals";
import { Transaction } from "@/hooks/useFinanceData";

function TransactionItem({ 
  transaction, 
  delay,
  onEdit,
  onDelete 
}: { 
  transaction: Transaction; 
  delay: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = transaction.icon;
  
  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:shadow-md transition-all duration-200 opacity-0 animate-fade-in group cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onEdit}
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [defaultType, setDefaultType] = useState<"income" | "expense">("expense");

  const filteredTransactions = transactions.filter(t => {
    const matchesTab = 
      activeTab === "all" ? true :
      activeTab === "income" ? t.type === "income" :
      activeTab === "expenses" ? t.type === "expense" :
      activeTab === "recurring" ? t.isRecurring : true;
    
    const matchesSearch = searchQuery === "" || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const totalRecurring = transactions.filter(t => t.isRecurring).reduce((sum, t) => sum + t.amount, 0);

  const handleAddTransaction = (type: "income" | "expense" = "expense") => {
    setSelectedTransaction(null);
    setDefaultType(type);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDefaultType(transaction.type);
    setIsModalOpen(true);
  };

  const handleSave = (transaction: Omit<Transaction, "id">) => {
    addTransaction(transaction);
  };

  const handleUpdate = (id: string, updates: Partial<Transaction>) => {
    updateTransaction(id, updates);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
  };

  return (
    <>
      <Helmet>
        <title>Transactions | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="Track and manage all your income, expenses, and recurring transactions in one place." />
      </Helmet>

      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card 
            className="glass-card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleAddTransaction("income")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-xl font-bold text-foreground">₹{totalIncome.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="glass-card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleAddTransaction("expense")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-xl font-bold text-foreground">₹{totalExpenses.toLocaleString('en-IN')}</p>
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
                  <p className="text-xl font-bold text-foreground">₹{totalRecurring.toLocaleString('en-IN')}</p>
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
                <Button variant="gradient" className="gap-2" onClick={() => handleAddTransaction()}>
                  <Plus className="h-4 w-4" />
                  Add
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
            {filteredTransactions.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No transactions found</p>
                  <Button variant="gradient" className="mt-4" onClick={() => handleAddTransaction()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction} 
                  delay={index * 50}
                  onEdit={() => handleEditTransaction(transaction)}
                  onDelete={() => handleDelete(transaction.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Add Transaction Button (Mobile) */}
        <div className="flex justify-center lg:hidden">
          <Button variant="gradient" size="lg" className="gap-2" onClick={() => handleAddTransaction()}>
            <Plus className="h-5 w-5" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        transaction={selectedTransaction}
        defaultType={defaultType}
      />
    </>
  );
}
