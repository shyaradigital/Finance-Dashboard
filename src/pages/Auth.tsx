import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  TrendingUp,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
  };

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 6) {
      return { valid: false, message: "Password must be at least 6 characters" };
    }
    return { valid: true };
  };

  // Real-time validation
  const validateSignIn = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateSignUp = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!name) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (!validateName(name)) {
      newErrors.name = "Name must be at least 2 characters and contain only letters";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
        isValid = false;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignIn()) {
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.error || "Login failed");
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) {
      return;
    }

    setIsLoading(true);

    const result = await signup(name, email, password);
    
    if (result.success) {
      toast.success("Account created successfully!");
      navigate("/");
    } else {
      toast.error(result.error || "Signup failed");
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password reset link sent to your email!");
    setShowForgotPassword(false);
  };

  return (
    <>
      <Helmet>
        <title>Sign In | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="Sign in to your FinanceFlow account to manage your finances." />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
          
          <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                <TrendingUp className="h-7 w-7" />
              </div>
              <span className="text-2xl font-bold">FinanceFlow</span>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Take Control of Your<br />
              <span className="text-white/90">Financial Future</span>
            </h1>
            
            <p className="text-lg text-white/80 mb-8 max-w-md">
              Track expenses, manage budgets, and grow your wealth with smart insights and automation.
            </p>

            <div className="space-y-4">
              {[
                "Smart expense categorization",
                "Budget tracking & alerts",
                "Investment portfolio insights",
                "Secure document vault"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-white/90 opacity-0 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <Sparkles className="h-5 w-5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute bottom-20 right-20 w-64 h-40 bg-white/10 backdrop-blur-md rounded-3xl transform rotate-12 animate-float" />
          <div className="absolute top-32 right-32 w-32 h-32 bg-white/5 backdrop-blur-md rounded-full" />
        </div>

        {/* Right Panel - Auth Forms */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-card">
            <CardContent className="p-8">
              {/* Mobile Logo */}
              <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">FinanceFlow</span>
              </div>

              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
                    <p className="text-muted-foreground mt-2">Enter your email to receive a reset link</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="gradient" className="w-full">
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Back to Sign In
                  </Button>
                </form>
              ) : (
                <Tabs value={activeTab} onValueChange={(v) => {
                  setActiveTab(v as "signin" | "signup");
                  // Clear errors when switching tabs
                  setErrors({});
                  setName("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}>
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-5">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                        <p className="text-muted-foreground mt-1">Sign in to continue to FinanceFlow</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) {
                                setErrors({ ...errors, email: undefined });
                              }
                            }}
                            onBlur={() => {
                              if (email && !validateEmail(email)) {
                                setErrors({ ...errors, email: "Please enter a valid email address" });
                              }
                            }}
                            className={cn("pl-10", errors.email && "border-destructive")}
                            required
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="signin-password">Password</Label>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs text-primary"
                            onClick={() => setShowForgotPassword(true)}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) {
                                setErrors({ ...errors, password: undefined });
                              }
                            }}
                            className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-destructive">{errors.password}</p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        variant="gradient" 
                        className="w-full" 
                        disabled={isLoading || !email || !password}
                      >
                        {isLoading ? (
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => toast.info("Google sign-in would be configured here")}
                        >
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => toast.info("Apple sign-in would be configured here")}
                        >
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                          </svg>
                          Apple
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-5">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Create account</h2>
                        <p className="text-muted-foreground mt-1">Start your financial journey today</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (errors.name) {
                                setErrors({ ...errors, name: undefined });
                              }
                            }}
                            onBlur={() => {
                              if (name && !validateName(name)) {
                                setErrors({ ...errors, name: "Name must be at least 2 characters and contain only letters" });
                              }
                            }}
                            className={cn("pl-10", errors.name && "border-destructive")}
                            required
                          />
                        </div>
                        {errors.name && (
                          <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) {
                                setErrors({ ...errors, email: undefined });
                              }
                            }}
                            onBlur={() => {
                              if (email && !validateEmail(email)) {
                                setErrors({ ...errors, email: "Please enter a valid email address" });
                              }
                            }}
                            className={cn("pl-10", errors.email && "border-destructive")}
                            required
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) {
                                setErrors({ ...errors, password: undefined });
                              }
                              // Clear confirm password error if passwords now match
                              if (confirmPassword && e.target.value === confirmPassword && errors.confirmPassword) {
                                setErrors({ ...errors, confirmPassword: undefined });
                              }
                            }}
                            onBlur={() => {
                              if (password) {
                                const validation = validatePassword(password);
                                if (!validation.valid) {
                                  setErrors({ ...errors, password: validation.message });
                                }
                              }
                            }}
                            className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password ? (
                          <p className="text-xs text-destructive">{errors.password}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (errors.confirmPassword) {
                                setErrors({ ...errors, confirmPassword: undefined });
                              }
                              // Real-time match check
                              if (e.target.value && password && e.target.value !== password) {
                                setErrors({ ...errors, confirmPassword: "Passwords do not match" });
                              } else if (e.target.value && password && e.target.value === password) {
                                setErrors({ ...errors, confirmPassword: undefined });
                              }
                            }}
                            className={cn("pl-10", errors.confirmPassword && "border-destructive")}
                            required
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        variant="gradient" 
                        className="w-full" 
                        disabled={isLoading || !name || !email || !password || !confirmPassword || !!errors.name || !!errors.email || !!errors.password || !!errors.confirmPassword}
                      >
                        {isLoading ? (
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground mt-4">
                        By creating an account, you agree to our{" "}
                        <Button variant="link" className="h-auto p-0 text-xs">Terms of Service</Button>
                        {" "}and{" "}
                        <Button variant="link" className="h-auto p-0 text-xs">Privacy Policy</Button>
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
