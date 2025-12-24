import { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  Building2, 
  CreditCard, 
  Lock,
  Eye,
  EyeOff,
  Plus,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  type: "savings" | "current" | "fd";
  balance: number;
  accountNumber: string;
  color: string;
}

interface CreditCardType {
  id: string;
  name: string;
  bank: string;
  lastFour: string;
  limit: number;
  used: number;
  dueDate: string;
  minDue: number;
  color: string;
}

interface VaultItem {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
}

const bankAccounts: BankAccount[] = [
  { id: "1", name: "Primary Savings", bank: "HDFC Bank", type: "savings", balance: 245890, accountNumber: "XXXX4521", color: "from-blue-500 to-blue-600" },
  { id: "2", name: "Salary Account", bank: "ICICI Bank", type: "savings", balance: 78560, accountNumber: "XXXX8934", color: "from-orange-500 to-orange-600" },
  { id: "3", name: "Fixed Deposit", bank: "SBI", type: "fd", balance: 500000, accountNumber: "XXXX2156", color: "from-green-500 to-green-600" },
];

const creditCards: CreditCardType[] = [
  { id: "1", name: "Regalia", bank: "HDFC", lastFour: "4521", limit: 300000, used: 78500, dueDate: "Jan 5", minDue: 7850, color: "from-purple-500 to-purple-600" },
  { id: "2", name: "Amazon Pay", bank: "ICICI", lastFour: "8934", limit: 150000, used: 23400, dueDate: "Jan 10", minDue: 2340, color: "from-yellow-500 to-orange-500" },
];

const vaultItems: VaultItem[] = [
  { id: "1", title: "PAN Card", category: "Identity", lastUpdated: "Dec 15, 2024" },
  { id: "2", title: "Aadhaar Card", category: "Identity", lastUpdated: "Dec 15, 2024" },
  { id: "3", title: "Passport", category: "Travel", lastUpdated: "Nov 20, 2024" },
  { id: "4", title: "Insurance Policy", category: "Documents", lastUpdated: "Oct 5, 2024" },
];

function BankAccountCard({ account, delay }: { account: BankAccount; delay: number }) {
  return (
    <Card 
      className="glass-card overflow-hidden opacity-0 animate-fade-in hover:shadow-lg transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn("h-2 bg-gradient-to-r", account.color)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-foreground">{account.name}</p>
            <p className="text-sm text-muted-foreground">{account.bank}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {account.type === "fd" ? "FD" : account.type}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold text-foreground">₹{account.balance.toLocaleString('en-IN')}</p>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">A/C {account.accountNumber}</span>
            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreditCardCard({ card, delay }: { card: CreditCardType; delay: number }) {
  const utilization = (card.used / card.limit) * 100;
  const isHighUtilization = utilization > 70;

  return (
    <Card 
      className="glass-card overflow-hidden opacity-0 animate-fade-in hover:shadow-lg transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn("h-2 bg-gradient-to-r", card.color)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-foreground">{card.bank} {card.name}</p>
            <p className="text-sm text-muted-foreground">**** **** **** {card.lastFour}</p>
          </div>
          <CreditCard className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Utilization</span>
              <span className={cn("text-xs font-medium", isHighUtilization ? "text-warning" : "text-success")}>
                {Math.round(utilization)}%
              </span>
            </div>
            <Progress value={utilization} className={cn(isHighUtilization && "[&>div]:bg-warning")} />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium text-foreground">₹{card.used.toLocaleString('en-IN')}</span>
              <span className="text-xs text-muted-foreground">of ₹{card.limit.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="text-sm font-medium text-foreground">{card.dueDate}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Min Due</p>
              <p className="text-sm font-medium text-destructive">₹{card.minDue.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          {isHighUtilization && (
            <div className="flex items-center gap-2 text-warning text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>High credit utilization affects credit score</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Accounts() {
  const [activeTab, setActiveTab] = useState("banks");
  const [showVaultItems, setShowVaultItems] = useState(false);

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCredit = creditCards.reduce((sum, card) => sum + card.used, 0);

  return (
    <>
      <Helmet>
        <title>Accounts & Vault | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="Manage your bank accounts, credit cards, and securely store important documents." />
      </Helmet>

      <div className="space-y-6">
        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bank Balance</p>
                  <p className="text-2xl font-bold text-foreground mt-1">₹{totalBalance.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-success mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +₹45,230 this month
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card bg-gradient-to-br from-destructive/5 to-destructive/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credit Card Outstanding</p>
                  <p className="text-2xl font-bold text-foreground mt-1">₹{totalCredit.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-warning mt-1">Payment due soon</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <CreditCard className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border p-1 h-auto">
            <TabsTrigger value="banks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Bank Accounts
            </TabsTrigger>
            <TabsTrigger value="cards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Credit Cards
            </TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Secure Vault
            </TabsTrigger>
          </TabsList>

          <TabsContent value="banks" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bankAccounts.map((account, index) => (
                <BankAccountCard key={account.id} account={account} delay={index * 50} />
              ))}
              <Card className="glass-card border-dashed flex items-center justify-center min-h-[200px] cursor-pointer hover:border-primary/50 transition-colors">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Add Account</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cards" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {creditCards.map((card, index) => (
                <CreditCardCard key={card.id} card={card} delay={index * 50} />
              ))}
              <Card className="glass-card border-dashed flex items-center justify-center min-h-[250px] cursor-pointer hover:border-primary/50 transition-colors">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Add Card</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vault" className="mt-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Secure Vault
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowVaultItems(!showVaultItems)}
                >
                  {showVaultItems ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {vaultItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {showVaultItems ? item.title : "••••••••"}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Vault
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
