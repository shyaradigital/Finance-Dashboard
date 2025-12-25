import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  LogOut,
  Camera,
  Shield,
  Bell,
  CreditCard,
  Building2,
  ChevronRight,
  Edit3,
  Check,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/FinanceContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { bankAccounts, creditCards, transactions } = useFinance();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSaveName = () => {
    if (editName.trim()) {
      updateUser({ name: editName.trim() });
      toast.success("Name updated successfully");
      setIsEditingName(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const stats = [
    { label: "Transactions", value: transactions.length, color: "text-primary" },
    { label: "Bank Accounts", value: bankAccounts.length, color: "text-success" },
    { label: "Credit Cards", value: creditCards.length, color: "text-accent" },
  ];

  const quickActions = [
    { icon: Settings, label: "Account Settings", description: "Manage your account preferences", onClick: () => navigate("/settings") },
    { icon: Shield, label: "Security", description: "Password & security settings", onClick: () => navigate("/settings?tab=account") },
    { icon: Bell, label: "Notifications", description: "Manage notification preferences", onClick: () => navigate("/settings?tab=settings") },
    { icon: Building2, label: "Linked Accounts", description: "Manage bank connections", onClick: () => navigate("/accounts") },
    { icon: CreditCard, label: "Payment Methods", description: "View and manage cards", onClick: () => navigate("/accounts") },
  ];

  return (
    <>
      <Helmet>
        <title>Profile | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="View and manage your FinanceFlow profile and account settings." />
      </Helmet>

      <div className="space-y-6">
        {/* Profile Header Card */}
        <Card className="glass-card overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary to-accent" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
              {/* Avatar */}
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg border-4 border-card">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <Button 
                  variant="secondary" 
                  size="icon-sm" 
                  className="absolute bottom-0 right-0 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toast.info("Profile photo upload coming soon")}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>

              {/* Name & Email */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 w-48"
                        autoFocus
                      />
                      <Button size="icon-sm" variant="ghost" onClick={handleSaveName}>
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setIsEditingName(false)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                      <Button 
                        size="icon-sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditName(user.name);
                          setIsEditingName(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Member since {user.memberSince}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.label}
              className="glass-card text-center opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6 pb-4">
                <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, index) => (
              <div
                key={action.label}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer opacity-0 animate-fade-in group"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={action.onClick}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{action.label}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium text-foreground">Account Verified</p>
                  <p className="text-sm text-muted-foreground">Your account is fully verified and secure</p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
