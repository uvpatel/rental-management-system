'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRentalStore } from '@/hooks/use-rental-store';
import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import { toast } from 'sonner';
import {
  CreditCard,
  ShieldCheck,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const store = useRentalStore();
  const orders = store.getOrders();
  const currentUser = store.getCurrentUser();

  const order = orders.find((o) => o.id === orderId);

  const [paymentType, setPaymentType] = useState<'full' | 'deposit_partial'>('full');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || 'Acme Media Pvt Ltd');
  const [gstin, setGstin] = useState(currentUser?.gstin || '24AAACO1234M1Z5');

  // Simulated Payment Form
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  useEffect(() => {
    if (order) {
      setCustomerName(order.customerName);
      setCustomerEmail(order.customerEmail);
      if (order.companyName) setCompanyName(order.companyName);
      if (order.gstin) setGstin(order.gstin);
    }
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <SiteHeaderNav />
        <div className="container max-w-md mx-auto py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">No Order Found</h2>
          <p className="text-sm text-muted-foreground">
            The rental order you are trying to checkout does not exist or has expired.
          </p>
          <Button onClick={() => router.push('/store')} className="w-full">
            Browse Rental Store
          </Button>
        </div>
      </div>
    );
  }

  const payableAmount =
    paymentType === 'full'
      ? order.totalAmount
      : order.securityDeposit + Math.round(order.totalAmount * 0.2);

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstin) {
      toast.error('GSTIN is mandatory for rental invoicing!');
      return;
    }

    const result = store.confirmOrder(order.id, paymentType);

    if (result.success) {
      toast.success('Payment Received! Rental Order Confirmed & Stock Reserved.');
      router.push(`/portal?orderId=${order.id}`);
    } else {
      toast.error(result.message || 'Payment processing failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <SiteHeaderNav />

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-600" />
            Secure Checkout & Invoice Generation
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Order Reference: <span className="font-mono font-semibold">{order.id}</span> • Status: <Badge variant="outline">{order.status}</Badge>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details & Mandatory B2B Invoice details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  Invoicing & GST Details (Mandatory)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name / Authorized Rep</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Work Email (Invoice Recipient)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="company">Registered Company Name</Label>
                    <Input
                      id="company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Pvt Ltd"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gstin" className="flex items-center justify-between">
                      <span>GSTIN Number</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Mandatory for GST Invoice</span>
                    </Label>
                    <Input
                      id="gstin"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="24AAACO1234M1Z5"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Mode */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Select Payment Option
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      paymentType === 'full'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 ring-1 ring-purple-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Full Upfront Payment</span>
                        {paymentType === 'full' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay 100% rental total upfront. Instant order confirmation & stock reservation.
                      </p>
                    </div>
                    <div className="mt-4 font-bold text-lg text-purple-600">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('deposit_partial')}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      paymentType === 'deposit_partial'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 ring-1 ring-purple-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Security Deposit + 20%</span>
                        {paymentType === 'deposit_partial' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay security deposit + 20% advance now. Balance due upon pickup.
                      </p>
                    </div>
                    <div className="mt-4 font-bold text-lg text-purple-600">
                      ₹{(order.securityDeposit + Math.round(order.totalAmount * 0.2)).toLocaleString('en-IN')}
                    </div>
                  </button>
                </div>

                <form onSubmit={handleConfirmPayment} className="space-y-4 pt-2">
                  <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Simulated Online Gateway Integration (Razorpay / Stripe)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[10px]">Card Number</Label>
                        <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="h-8 text-xs font-mono" />
                      </div>
                      <div>
                        <Label className="text-[10px]">Expiry (MM/YY)</Label>
                        <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="h-8 text-xs font-mono" />
                      </div>
                      <div>
                        <Label className="text-[10px]">CVC</Label>
                        <Input value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="h-8 text-xs font-mono" />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-sm shadow-md gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Pay ₹{payableAmount.toLocaleString('en-IN')} & Confirm Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <Card className="bg-slate-900 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center justify-between text-slate-100">
                  <span>Rental Summary</span>
                  <Badge className="bg-purple-500 text-white text-[10px]">{order.items.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Rental Duration: {order.durationDays} Days ({order.durationHours} hrs)
                  </div>
                  <p className="text-[10px] text-slate-400">
                    From: {new Date(order.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    To: {new Date(order.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-slate-300">
                      <div>
                        <div className="font-semibold text-white">{item.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Qty: {item.quantity} × ₹{item.effectiveDailyRate}/day
                        </div>
                      </div>
                      <div className="font-semibold">₹{item.subtotal.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 border-t border-slate-800 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({order.taxRate}%)</span>
                    <span>₹{order.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refundable Security Deposit</span>
                    <span>₹{order.securityDeposit.toLocaleString('en-IN')}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({order.couponCode})</span>
                      <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm text-white pt-2 border-t border-slate-700">
                    <span>Total Amount</span>
                    <span className="text-emerald-400">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-[10px] text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <div>Stock reservation automatically blocks dates upon payment confirmation.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading Checkout...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
