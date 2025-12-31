import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { 
  Building2, 
  CreditCard, 
  Lock,
  Eye,
  EyeOff,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Wallet,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/FinanceContext";
import { AccountModal, CreditCardModal, DebitCardModal, VaultModal } from "@/components/modals";
import { BankAccount, CreditCardType, DebitCardType, VaultItem } from "@/hooks/useFinanceData";
import { useTransactions } from "@/hooks/useFinanceQueries";

function BankAccountCard({ 
  account, 
  delay,
  onClick 
}: { 
  account: BankAccount; 
  delay: number;
  onClick: () => void;
}) {
  return (
    <Card 
      className="glass-card overflow-hidden opacity-0 animate-fade-in hover:shadow-lg transition-all duration-300 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
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
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreditCardCard({ 
  card, 
  delay,
  onClick 
}: { 
  card: CreditCardType; 
  delay: number;
  onClick: () => void;
}) {
  const utilization = (card.used / card.limit) * 100;
  const isHighUtilization = utilization > 70;

  return (
    <Card 
      className="glass-card overflow-hidden opacity-0 animate-fade-in hover:shadow-lg transition-all duration-300 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
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

function DebitCardCard({ 
  card, 
  delay,
  onClick 
}: { 
  card: DebitCardType; 
  delay: number;
  onClick: () => void;
}) {
  return (
    <Card 
      className="glass-card overflow-hidden opacity-0 animate-fade-in hover:shadow-lg transition-all duration-300 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className={cn("h-2 bg-gradient-to-r", card.color)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-foreground">{card.bank} {card.name}</p>
            <p className="text-sm text-muted-foreground">**** **** **** {card.lastFour}</p>
          </div>
          <Wallet className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">Linked Account</p>
              <p className="text-sm font-medium text-foreground">{card.linkedAccount}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {card.cardNetwork}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {card.isActive ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className={cn("text-sm", card.isActive ? "text-success" : "text-destructive")}>
                {card.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">Exp: {card.expiryDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Accounts() {
  const { 
    bankAccounts, 
    creditCards, 
    debitCards,
    vaultItems,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addDebitCard,
    updateDebitCard,
    deleteDebitCard,
    addVaultItem,
    updateVaultItem,
    deleteVaultItem
  } = useFinance();
  
  const { data: transactions = [] } = useTransactions();
  
  const [activeTab, setActiveTab] = useState("banks");
  const [showVaultItems, setShowVaultItems] = useState(false);
  
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);
  const [isDebitCardModalOpen, setIsDebitCardModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [selectedCreditCard, setSelectedCreditCard] = useState<CreditCardType | null>(null);
  const [selectedDebitCard, setSelectedDebitCard] = useState<DebitCardType | null>(null);
  const [selectedVaultItem, setSelectedVaultItem] = useState<VaultItem | null>(null);

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCredit = creditCards.reduce((sum, card) => sum + card.used, 0);
  const activeDebitCards = debitCards.filter(c => c.isActive).length;

  // Calculate monthly change from transactions
  const monthlyChange = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const currentMonthTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= startOfMonth && txDate <= endOfMonth;
    });

    const income = currentMonthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = currentMonthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return income - expenses;
  }, [transactions]);

  // Calculate payment due status from credit cards
  const paymentDueStatus = useMemo(() => {
    if (creditCards.length === 0 || totalCredit === 0) {
      return null;
    }

    const now = new Date();
    const currentDay = now.getDate();
    let daysUntilDue = Infinity;

    // Find the nearest due date
    creditCards.forEach((card) => {
      // Use dueDateDay if available, otherwise parse from formatted string
      const dueDay = card.dueDateDay || (() => {
        try {
          // Try to parse from formatted string "MMM d"
          const parsedDate = new Date(card.dueDate + " " + now.getFullYear());
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.getDate();
          }
        } catch (e) {
          // If parsing fails, try to extract day number from string
          const dayMatch = card.dueDate.match(/\d+/);
          if (dayMatch) {
            return parseInt(dayMatch[0]);
          }
        }
        return null;
      })();

      if (dueDay !== null && !isNaN(dueDay)) {
        let daysUntil = dueDay - currentDay;
        
        // If due date has passed this month, check next month
        if (daysUntil < 0) {
          const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          daysUntil = daysInCurrentMonth - currentDay + dueDay;
        }

        if (daysUntil < daysUntilDue) {
          daysUntilDue = daysUntil;
        }
      }
    });

    if (daysUntilDue === Infinity) {
      return null;
    }

    if (daysUntilDue <= 7) {
      return daysUntilDue === 0 
        ? "Payment due today" 
        : daysUntilDue === 1 
        ? "Payment due tomorrow"
        : `Payment due in ${daysUntilDue} days`;
    }

    return null; // Don't show message if more than 7 days away
  }, [creditCards, totalCredit]);

  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsAccountModalOpen(true);
  };

  const handleEditCreditCard = (card: CreditCardType) => {
    setSelectedCreditCard(card);
    setIsCreditCardModalOpen(true);
  };

  const handleAddCreditCard = () => {
    setSelectedCreditCard(null);
    setIsCreditCardModalOpen(true);
  };

  const handleEditDebitCard = (card: DebitCardType) => {
    setSelectedDebitCard(card);
    setIsDebitCardModalOpen(true);
  };

  const handleAddDebitCard = () => {
    setSelectedDebitCard(null);
    setIsDebitCardModalOpen(true);
  };

  const handleEditVaultItem = (item: VaultItem) => {
    setSelectedVaultItem(item);
    setIsVaultModalOpen(true);
  };

  const handleAddVaultItem = () => {
    setSelectedVaultItem(null);
    setIsVaultModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Accounts & Vault | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="Manage your bank accounts, credit cards, debit cards, and securely store important documents." />
      </Helmet>

      <div className="space-y-6">
        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bank Balance</p>
                  <p className="text-2xl font-bold text-foreground mt-1">₹{totalBalance.toLocaleString('en-IN')}</p>
                  {monthlyChange !== 0 && (
                    <p className={cn(
                      "text-xs mt-1 flex items-center gap-1",
                      monthlyChange > 0 ? "text-success" : "text-destructive"
                    )}>
                      {monthlyChange > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {monthlyChange > 0 ? "+" : ""}₹{Math.abs(monthlyChange).toLocaleString('en-IN')} this month
                    </p>
                  )}
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
                  {paymentDueStatus && (
                    <p className="text-xs text-warning mt-1">{paymentDueStatus}</p>
                  )}
                  {!paymentDueStatus && totalCredit > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">No payments due soon</p>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <CreditCard className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card bg-gradient-to-br from-success/5 to-success/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Debit Cards</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{debitCards.length} cards</p>
                  <p className="text-xs text-success mt-1">{activeDebitCards} active</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Wallet className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border p-1 h-auto flex-wrap">
            <TabsTrigger value="banks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Bank Accounts
            </TabsTrigger>
            <TabsTrigger value="credit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Credit Cards
            </TabsTrigger>
            <TabsTrigger value="debit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Debit Cards
            </TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Secure Vault
            </TabsTrigger>
          </TabsList>

          <TabsContent value="banks" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bankAccounts.map((account, index) => (
                <BankAccountCard 
                  key={account.id} 
                  account={account} 
                  delay={index * 50}
                  onClick={() => handleEditAccount(account)}
                />
              ))}
              <Card 
                className="glass-card border-dashed flex items-center justify-center min-h-[200px] cursor-pointer hover:border-primary/50 transition-colors"
                onClick={handleAddAccount}
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Add Account</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="credit" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {creditCards.map((card, index) => (
                <CreditCardCard 
                  key={card.id} 
                  card={card} 
                  delay={index * 50}
                  onClick={() => handleEditCreditCard(card)}
                />
              ))}
              <Card 
                className="glass-card border-dashed flex items-center justify-center min-h-[250px] cursor-pointer hover:border-primary/50 transition-colors"
                onClick={handleAddCreditCard}
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Add Credit Card</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="debit" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {debitCards.map((card, index) => (
                <DebitCardCard 
                  key={card.id} 
                  card={card} 
                  delay={index * 50}
                  onClick={() => handleEditDebitCard(card)}
                />
              ))}
              <Card 
                className="glass-card border-dashed flex items-center justify-center min-h-[200px] cursor-pointer hover:border-primary/50 transition-colors"
                onClick={handleAddDebitCard}
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Add Debit Card</p>
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
                    onClick={() => handleEditVaultItem(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        {item.type === "document" ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <Lock className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {showVaultItems ? item.title : "••••••••"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          {item.category}
                          {item.type === "document" && (
                            <Badge variant="outline" className="text-xs">Document</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-4" onClick={handleAddVaultItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Vault
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
        bankAccounts={bankAccounts}
      />

      {/* Vault Modal */}
      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => {
          setIsVaultModalOpen(false);
          setSelectedVaultItem(null);
        }}
        onSave={addVaultItem}
        onUpdate={updateVaultItem}
        onDelete={deleteVaultItem}
        item={selectedVaultItem}
      />
    </>
  );
}
