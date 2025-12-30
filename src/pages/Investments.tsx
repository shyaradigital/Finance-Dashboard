import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus
} from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/FinanceContext";
import { InvestmentModal, SIPModal } from "@/components/modals";
import { Investment, SIP } from "@/hooks/useFinanceData";
import { api, getAccessToken } from "@/services/api";

// Helper to check if user is authenticated
const isAuthenticated = () => {
  return !!getAccessToken();
};

// Color mapping for investment types
const getTypeColor = (type: string, index: number): string => {
  const colors = [
    "hsl(270, 60%, 55%)", // Purple
    "hsl(160, 60%, 45%)", // Green
    "hsl(35, 90%, 55%)",  // Orange
    "hsl(45, 90%, 55%)",  // Yellow
    "hsl(200, 60%, 55%)", // Blue
    "hsl(320, 60%, 55%)", // Pink
  ];
  return colors[index % colors.length];
};

export default function Investments() {
  const { 
    investments, 
    sips,
    bankAccounts,
    creditCards,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addSIP,
    updateSIP,
    deleteSIP
  } = useFinance();
  
  const [activeTab, setActiveTab] = useState("portfolio");
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isSIPModalOpen, setIsSIPModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [selectedSIP, setSelectedSIP] = useState<SIP | null>(null);

  // Fetch net worth from backend
  const { data: netWorthData, isLoading: isLoadingNetWorth } = useQuery({
    queryKey: ['net-worth'],
    queryFn: async () => {
      const response = await api.analytics.getNetWorth();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch net worth");
      }
      return response.data;
    },
    enabled: isAuthenticated(),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate investment totals
  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.current, 0);
  const totalReturns = totalCurrent - totalInvested;
  const totalReturnsPercentage = totalInvested > 0 
    ? ((totalReturns / totalInvested) * 100).toFixed(1)
    : "0.0";

  // Calculate net worth from backend or fallback to calculation
  const netWorth = netWorthData?.netWorth ?? 0;
  
  // Calculate YTD percentage (simplified - compare to start of year)
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  // For now, we'll show 0% if no historical data, or calculate from current vs invested
  const ytdPercentage = useMemo(() => {
    if (!netWorthData || netWorth === 0) return null;
    // Simple calculation: assume net worth growth from investments
    // In a real scenario, you'd compare to net worth at start of year
    const totalAccountBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + card.used, 0);
    const baseNetWorth = totalAccountBalance + totalInvested - totalCreditCardDebt;
    if (baseNetWorth > 0) {
      return (((netWorth - baseNetWorth) / baseNetWorth) * 100).toFixed(1);
    }
    return null;
  }, [netWorthData, netWorth, bankAccounts, creditCards, totalInvested]);

  const totalSIPAmount = sips.reduce((sum, sip) => sum + sip.amount, 0);

  // Calculate asset allocation from actual investments
  const assetAllocation = useMemo(() => {
    const allocationMap = new Map<string, { name: string; value: number; color: string }>();
    
    investments.forEach((inv, index) => {
      const typeName = inv.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      const existing = allocationMap.get(inv.type);
      
      if (existing) {
        existing.value += inv.current;
      } else {
        allocationMap.set(inv.type, {
          name: typeName,
          value: inv.current,
          color: getTypeColor(inv.type, index),
        });
      }
    });

    return Array.from(allocationMap.values()).sort((a, b) => b.value - a.value);
  }, [investments]);

  // Net worth history - empty for now since we don't have historical data endpoint
  // In a real scenario, you'd fetch this from backend
  const netWorthHistory = useMemo(() => {
    // Return empty array - no historical data available
    // When backend adds net worth history endpoint, fetch it here
    return [];
  }, []);

  const handleEditInvestment = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsInvestmentModalOpen(true);
  };

  const handleAddInvestment = () => {
    setSelectedInvestment(null);
    setIsInvestmentModalOpen(true);
  };

  const handleEditSIP = (sip: SIP) => {
    setSelectedSIP(sip);
    setIsSIPModalOpen(true);
  };

  const handleAddSIP = () => {
    setSelectedSIP(null);
    setIsSIPModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Investments & Net Worth | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="Track your investment portfolio, SIPs, and monitor your net worth growth over time." />
      </Helmet>

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card 
            className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleAddInvestment}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold text-foreground mt-1">₹{(totalInvested / 100000).toFixed(1)}L</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card bg-gradient-to-br from-success/5 to-success/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-2xl font-bold text-foreground mt-1">₹{(totalCurrent / 100000).toFixed(1)}L</p>
                  <p className="text-xs text-success mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +{totalReturnsPercentage}%
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card bg-gradient-to-br from-accent/5 to-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Worth</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {isLoadingNetWorth ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : (
                      `₹${(netWorth / 100000).toFixed(1)}L`
                    )}
                  </p>
                  {ytdPercentage && (
                    <p className="text-xs text-success mt-1">
                      {parseFloat(ytdPercentage) >= 0 ? '+' : ''}{ytdPercentage}% YTD
                    </p>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-card border border-border p-1 h-auto">
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="sips" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                SIPs & Recurring
              </TabsTrigger>
              <TabsTrigger value="networth" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Net Worth
              </TabsTrigger>
            </TabsList>

            {activeTab === "portfolio" && (
              <Button variant="gradient" className="gap-2" onClick={handleAddInvestment}>
                <Plus className="h-4 w-4" />
                Add Investment
              </Button>
            )}
            {activeTab === "sips" && (
              <Button variant="gradient" className="gap-2" onClick={handleAddSIP}>
                <Plus className="h-4 w-4" />
                Add SIP
              </Button>
            )}
          </div>

          <TabsContent value="portfolio" className="mt-6 space-y-4">
            {investments.map((investment, index) => {
              const returnAmount = investment.current - investment.invested;
              const isPositive = returnAmount >= 0;
              
              return (
                <Card 
                  key={investment.id} 
                  className="glass-card opacity-0 animate-fade-in hover:shadow-md transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleEditInvestment(investment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="h-12 w-1.5 rounded-full"
                          style={{ backgroundColor: investment.color }}
                        />
                        <div>
                          <p className="font-medium text-foreground">{investment.name}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {investment.type.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          ₹{investment.current.toLocaleString('en-IN')}
                        </p>
                        <p className={cn(
                          "text-sm flex items-center justify-end gap-1",
                          isPositive ? "text-success" : "text-destructive"
                        )}>
                          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          ₹{Math.abs(returnAmount).toLocaleString('en-IN')} ({investment.returns}%)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Invested: ₹{investment.invested.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="sips" className="mt-6">
            <Card className="glass-card mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <RefreshCw className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Monthly SIPs</p>
                      <p className="text-xl font-bold text-foreground">₹{totalSIPAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <Button variant="gradient" onClick={handleAddSIP}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add SIP
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {sips.map((sip, index) => (
                <Card 
                  key={sip.id}
                  className="glass-card opacity-0 animate-fade-in cursor-pointer hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleEditSIP(sip)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                          <RefreshCw className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{sip.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {sip.frequency} · Next: {sip.nextDate}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">₹{sip.amount.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">
                          Total: ₹{sip.totalInvested.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="networth" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Net Worth Trend */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Net Worth Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {netWorthHistory.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          Historical data will appear here as you track your net worth over time
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={netWorthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(270, 20%, 90%)" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: 'hsl(270, 15%, 45%)', fontSize: 12 }}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: 'hsl(270, 15%, 45%)', fontSize: 12 }}
                            tickFormatter={(value) => `₹${(value / 100000)}L`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(0, 0%, 100%)',
                              border: '1px solid hsl(270, 20%, 90%)',
                              borderRadius: '12px',
                            }}
                            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Net Worth']}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(270, 60%, 55%)"
                            strokeWidth={2}
                            fill="url(#netWorthGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Asset Allocation */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  {assetAllocation.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          Add investments to see your asset allocation
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="relative h-[180px] w-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={assetAllocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                              strokeWidth={0}
                            >
                              {assetAllocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']} />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {assetAllocation.map((asset, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-3 w-3 rounded-full" 
                                style={{ backgroundColor: asset.color }} 
                              />
                              <span className="text-sm text-foreground">{asset.name}</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              ₹{(asset.value / 100000).toFixed(1)}L
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={isInvestmentModalOpen}
        onClose={() => {
          setIsInvestmentModalOpen(false);
          setSelectedInvestment(null);
        }}
        onSave={addInvestment}
        onUpdate={updateInvestment}
        onDelete={deleteInvestment}
        investment={selectedInvestment}
      />

      {/* SIP Modal */}
      <SIPModal
        isOpen={isSIPModalOpen}
        onClose={() => {
          setIsSIPModalOpen(false);
          setSelectedSIP(null);
        }}
        onSave={addSIP}
        onUpdate={updateSIP}
        onDelete={deleteSIP}
        sip={selectedSIP}
      />
    </>
  );
}
