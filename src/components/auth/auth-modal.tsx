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
import { ShieldCheck, Sparkles, Building2, Lock, Mail, User, Percent } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const store = useRentalStore();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      toast.error('Please enter your email address.');
      return;
    }
    const users = store.getUsers();
    const foundUser = users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (foundUser) {
      store.setCurrentUser(foundUser);
      toast.success(`Welcome back, ${foundUser.name}!`);
      onClose();
    } else {
      // Auto-create/switch as demo user
      const newUser = store.registerUser({
        name: loginEmail.split('@')[0],
        email: loginEmail,
        role: 'customer',
        companyName: 'Acme Corp',
        gstin: '24AAACO1234M1Z5'
      });
      toast.success(`Logged in as ${newUser.name}`);
      onClose();
    }
  };

  const handleSignup = (e: React.FormEvent) => {
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
      toast.error('GSTIN is mandatory for invoicing setup.');
      return;
    }

    // Validate Coupon if entered
    if (signupCoupon) {
      const coupons = store.getCoupons();
      const matched = coupons.find((c) => c.code.toUpperCase() === signupCoupon.toUpperCase());
      if (matched) {
        toast.success(`Coupon "${matched.code}" applied! ${matched.discountPercentage}% discount granted on first rental.`);
      } else {
        toast.error(`Invalid coupon code: "${signupCoupon}"`);
      }
    }

    const newUser = store.registerUser({
      name: signupName,
      email: signupEmail,
      role: signupRole,
      companyName: signupCompany || 'Private Limited',
      gstin: signupGstin
    });

    toast.success(`Registration successful! Welcome, ${newUser.name}.`);
    onClose();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your registered email address.');
      return;
    }
    setForgotSent(true);
    toast.success('Password reset link sent to ' + forgotEmail);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Odoo Rental Portal
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sign in or register an account to create quotations, track orders, and manage invoices.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>

          {/* SIGN IN TAB */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="sarah@skynetmedia.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-pass">Password</Label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="login-pass"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Sign In
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t text-xs text-center space-y-2">
              <p className="font-medium text-slate-700 dark:text-slate-300">Quick Demo One-Click Sign In:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoginEmail('admin@odoorental.com');
                    setLoginPassword('admin123');
                  }}
                  className="text-[11px] h-7"
                >
                  Admin Account
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoginEmail('vendor@apexgear.com');
                    setLoginPassword('vendor123');
                  }}
                  className="text-[11px] h-7"
                >
                  Vendor Account
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoginEmail('sarah@skynetmedia.com');
                    setLoginPassword('cust123');
                  }}
                  className="text-[11px] h-7"
                >
                  Customer Account
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* SIGN UP TAB */}
          <TabsContent value="signup" className="space-y-3">
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="signup-name">Full Name *</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Work Email *</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="john@company.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-company">Company Name</Label>
                  <Input
                    id="signup-company"
                    placeholder="Acme Pvt Ltd"
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-gstin">GSTIN (Mandatory) *</Label>
                  <Input
                    id="signup-gstin"
                    placeholder="24AAACO1234M1Z5"
                    value={signupGstin}
                    onChange={(e) => setSignupGstin(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-pass">Password *</Label>
                  <Input
                    id="signup-pass"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm">Confirm Password *</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-coupon">Coupon Code (Optional)</Label>
                <div className="relative">
                  <Percent className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="signup-coupon"
                    placeholder="Try: HACKATHON10 or ODOO20"
                    value={signupCoupon}
                    onChange={(e) => setSignupCoupon(e.target.value)}
                    className="pl-9 uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Select Role</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('customer')}
                    className={`py-1.5 px-2 text-xs rounded-md border font-medium transition-all ${
                      signupRole === 'customer'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                    }`}
                  >
                    🛒 Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('vendor')}
                    className={`py-1.5 px-2 text-xs rounded-md border font-medium transition-all ${
                      signupRole === 'vendor'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                    }`}
                  >
                    🏪 Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('admin')}
                    className={`py-1.5 px-2 text-xs rounded-md border font-medium transition-all ${
                      signupRole === 'admin'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                    }`}
                  >
                    ⚙️ Admin
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2">
                Create Account & Sign In
              </Button>
            </form>
          </TabsContent>

          {/* FORGOT PASSWORD TAB */}
          {activeTab === 'forgot' && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground">
                Enter your email address and we will send you a verification link to reset your rental portal password.
              </p>
              {forgotSent ? (
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs space-y-2 text-center">
                  <p className="font-semibold">Verification Email Sent!</p>
                  <p>Check your inbox at <strong>{forgotEmail}</strong> to reset password.</p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('login')} className="mt-2 text-xs">
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Send Verification Email
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => setActiveTab('login')} className="w-full text-xs">
                    Cancel & Back to Sign In
                  </Button>
                </form>
              )}
            </div>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
