'use client';

import { useState } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { UserRole } from '@/types/rental';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Sparkles,
  Building2,
  Lock,
  Mail,
  User,
  Percent,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  Fingerprint
} from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const store = useRentalStore();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCompany, setSignupCompany] = useState('');
  const [signupGstin, setSignupGstin] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('customer');
  const [signupCoupon, setSignupCoupon] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Sync user with backend Neon DB
  const syncWithDatabase = async (userData: any) => {
    try {
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    } catch (err) {
      console.warn('API sync deferred to local store:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      toast.error('Please enter your email address.');
      return;
    }
    const users = store.getUsers();
    const foundUser = users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (foundUser) {
      store.setCurrentUser(foundUser);
      await syncWithDatabase(foundUser);
      toast.success(`Welcome back, ${foundUser.name}!`);
      onClose();
    } else {
      // Auto-create & log in as demo user
      const newUser = store.registerUser({
        name: loginEmail.split('@')[0],
        email: loginEmail,
        role: 'customer',
        companyName: 'Acme Corp',
        gstin: '24AAACO1234M1Z5'
      });
      await syncWithDatabase(newUser);
      toast.success(`Registered & Logged in as ${newUser.name}`);
      onClose();
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    const users = store.getUsers();
    const targetUser = users.find((u) => u.role === role) || {
      id: `usr-${role}-demo`,
      name: `${role.toUpperCase()} Demo User`,
      email: `${role}@odoorental.com`,
      role,
      companyName: role !== 'customer' ? 'Titan Industrial Solutions' : 'Acme Media Pvt Ltd',
      gstin: '24AAACO1234M1Z5',
      createdAt: new Date().toISOString()
    };

    store.setCurrentUser(targetUser);
    await syncWithDatabase(targetUser);
    toast.success(`Switched active profile to ${targetUser.name} (${role.toUpperCase()})`);
    onClose();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!signupGstin) {
      toast.error('GSTIN is mandatory for tax invoicing setup.');
      return;
    }

    // Validate Coupon
    let couponDiscount = 0;
    if (signupCoupon) {
      const coupons = store.getCoupons();
      const matched = coupons.find((c) => c.code.toUpperCase() === signupCoupon.toUpperCase());
      if (matched) {
        couponDiscount = matched.discountPercentage;
        toast.success(`Coupon "${matched.code}" verified! ${matched.discountPercentage}% off first order.`);
      } else {
        toast.error(`Invalid coupon code: "${signupCoupon}"`);
      }
    }

    const newUser = store.registerUser({
      name: signupName,
      email: signupEmail,
      role: signupRole,
      companyName: signupCompany || 'Independent Business',
      gstin: signupGstin
    });

    await syncWithDatabase(newUser);
    store.setCurrentUser(newUser);

    toast.success(`Account created for ${newUser.name}! Welcome to RentalFlow.`);
    onClose();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your registered email address.');
      return;
    }
    setForgotSent(true);
    toast.success(`Password reset link sent to ${forgotEmail}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-background border-border shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-purple-900/90 via-indigo-900 to-slate-900 text-white space-y-1 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">
                RentalFlow SSO & Portal Auth
              </DialogTitle>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
              Odoo ERP Ready
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-300 pt-1">
            Access Quotations, Rental Orders, GST Invoicing & Inventory Dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2">
          {/* Clerk SSO Banner */}
          <div className="p-3 mb-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">Clerk Auth SSO</span>
            </div>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="h-7 text-[11px] font-bold border-purple-400/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40">
                  Clerk Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="h-7 text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white">
                  Clerk Register
                </Button>
              </SignUpButton>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-9 bg-muted p-1 mb-4 rounded-lg">
              <TabsTrigger value="login" className="text-xs font-semibold rounded-md">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-xs font-semibold rounded-md">
                Register B2B
              </TabsTrigger>
              <TabsTrigger value="forgot" className="text-xs font-semibold rounded-md">
                Reset
              </TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-4 m-0">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="login-email" className="text-xs font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    Work Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="admin@odoorental.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-pass" className="text-xs font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="login-pass"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <Button type="submit" className="w-full h-9 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm gap-2">
                  Sign In to RentalFlow
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </form>

              {/* Quick Demo Mode Selector */}
              <div className="pt-3 border-t border-border space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>1-Click Hackathon Demo Sign-In:</span>
                  <Badge variant="outline" className="text-[9px] text-purple-600 border-purple-300">Instant</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickDemoLogin('customer')}
                    className="h-8 text-[11px] font-semibold flex items-center gap-1 justify-center hover:border-amber-500 hover:text-amber-600"
                  >
                    🛒 Customer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickDemoLogin('vendor')}
                    className="h-8 text-[11px] font-semibold flex items-center gap-1 justify-center hover:border-indigo-500 hover:text-indigo-600"
                  >
                    🏪 Vendor
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="h-8 text-[11px] font-semibold flex items-center gap-1 justify-center hover:border-purple-600 hover:text-purple-600"
                  >
                    ⚙️ Admin
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup" className="space-y-3 m-0">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="signup-name" className="text-[11px] font-semibold">
                      Full Name *
                    </Label>
                    <Input
                      id="signup-name"
                      placeholder="Alex Rivera"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-email" className="text-[11px] font-semibold">
                      Work Email *
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="alex@company.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="signup-company" className="text-[11px] font-semibold">
                      Company Name
                    </Label>
                    <Input
                      id="signup-company"
                      placeholder="Rental Gear Pvt Ltd"
                      value={signupCompany}
                      onChange={(e) => setSignupCompany(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-gstin" className="text-[11px] font-semibold flex items-center justify-between">
                      <span>GSTIN *</span>
                      <span className="text-[9px] text-purple-600">Tax Invoice</span>
                    </Label>
                    <Input
                      id="signup-gstin"
                      placeholder="24AAACO1234M1Z5"
                      value={signupGstin}
                      onChange={(e) => setSignupGstin(e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">User Role / Account Type *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'customer', label: 'Customer', icon: User },
                      { role: 'vendor', label: 'Vendor', icon: Building2 },
                      { role: 'admin', label: 'Admin', icon: ShieldCheck }
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setSignupRole(item.role as UserRole)}
                        className={`p-2 rounded-lg border text-center transition-all text-xs font-semibold flex items-center justify-center gap-1.5 ${
                          signupRole === item.role
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 ring-1 ring-purple-600'
                            : 'border-border hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="signup-pass" className="text-[11px] font-semibold">
                      Password *
                    </Label>
                    <Input
                      id="signup-pass"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-cpass" className="text-[11px] font-semibold">
                      Confirm Password *
                    </Label>
                    <Input
                      id="signup-cpass"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="signup-coupon" className="text-[11px] font-semibold flex items-center gap-1">
                    <Percent className="w-3 h-3 text-emerald-600" />
                    Coupon Code (Optional)
                  </Label>
                  <Input
                    id="signup-coupon"
                    placeholder="Try: HACKATHON10"
                    value={signupCoupon}
                    onChange={(e) => setSignupCoupon(e.target.value)}
                    className="h-8 text-xs font-mono uppercase"
                  />
                </div>

                <Button type="submit" className="w-full h-9 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
                  Create Account & Register GSTIN
                </Button>
              </form>
            </TabsContent>

            {/* FORGOT PASSWORD TAB */}
            <TabsContent value="forgot" className="space-y-4 m-0">
              {forgotSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">Reset Email Sent!</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    We sent password reset instructions to <span className="font-semibold">{forgotEmail}</span>.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForgotSent(false);
                      setActiveTab('login');
                    }}
                    className="text-xs h-8"
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="forgot-email" className="text-xs font-medium">
                      Enter your registered email address
                    </Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="user@odoorental.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-9 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white">
                    Send Password Reset Link
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveTab('login')}
                    className="w-full h-8 text-xs text-muted-foreground"
                  >
                    Cancel & Return to Login
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
