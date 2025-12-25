import { useState } from "react";
import { Helmet } from "react-helmet";
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

const netWorthHistory = [
  { month: "Jul", value: 2100000 },
  { month: "Aug", value: 2180000 },
  { month: "Sep", value: 2250000 },
  { month: "Oct", value: 2320000 },
  { month: "Nov", value: 2400000 },
  { month: "Dec", value: 2456890 },
];

const assetAllocation = [
  { name: "Equity", value: 618000, color: "hsl(270, 60%, 55%)" },
  { name: "Debt", value: 925000, color: "hsl(160, 60%, 45%)" },
  { name: "Real Estate", value: 800000, color: "hsl(35, 90%, 55%)" },
  { name: "Gold", value: 113890, color: "hsl(45, 90%, 55%)" },
];

export default function Investments() {
  const { 
    investments, 
    sips,
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

  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.current, 0);
  const totalReturns = totalCurrent - totalInvested;
  const totalReturnsPercentage = ((totalReturns / totalInvested) * 100).toFixed(1);
  const netWorth = assetAllocation.reduce((sum, asset) => sum + asset.value, 0);
  const totalSIPAmount = sips.reduce((sum, sip) => sum + sip.amount, 0);

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
                  <p className="text-2xl font-bold text-foreground mt-1">₹{(netWorth / 100000).toFixed(1)}L</p>
                  <p className="text-xs text-success mt-1">+12.5% YTD</p>
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
                </CardContent>
              </Card>

              {/* Asset Allocation */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
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
