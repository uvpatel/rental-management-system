'use client';

import { useState, useEffect } from 'react';
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

export default function CheckoutPage() {
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
          <h2 className="text-xl font-bold">No active quotation found for checkout</h2>
          <Button onClick={() => router.push('/store')} className="bg-purple-600 text-white">
            Return to Storefront
          </Button>
        </div>
      </div>
    );
  }

  const initialAmountToPay =
    paymentType === 'deposit_partial' ? order.securityDeposit : order.totalAmount;

  const handlePayAndConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!gstin) {
      toast.error('GSTIN is mandatory for tax invoicing setup.');
      return;
    }

    const result = store.confirmOrder(order.id, paymentType);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(`Payment of ₹${initialAmountToPay} processed! Rental Order ${order.id} confirmed.`);
    router.push(`/portal?confirmedId=${order.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      <SiteHeaderNav />

      <main className="container max-w-5xl mx-auto py-8 px-4 flex-1 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Checkout & Order Confirmation</h1>
            <p className="text-xs text-muted-foreground">
              Quotation Ref: <strong className="text-purple-600">{order.id}</strong> | Status: <span className="uppercase font-semibold text-amber-600">{order.status}</span>
            </p>
          </div>
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            Stock Reserved on Confirmation
          </Badge>
        </div>

        <form onSubmit={handlePayAndConfirm} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Customer Details & Payment Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Customer & Invoicing Info */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" /> 1. Customer & Tax Invoicing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="c-name">Full Name</Label>
                    <Input id="c-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="c-email">Email Address</Label>
                    <Input id="c-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="c-company">Company Name</Label>
                    <Input id="c-company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="c-gstin">GSTIN (Mandatory for Invoicing) *</Label>
                    <Input
                      id="c-gstin"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="font-mono uppercase font-semibold"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Payment Terms Selection */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" /> 2. Payment Schedule Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                      paymentType === 'full'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 ring-2 ring-purple-600/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Full Upfront Payment</span>
                      {paymentType === 'full' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Pay rental amount + GST upfront. Deposit is refunded upon clean return.
                    </p>
                    <p className="text-sm font-extrabold text-purple-700 dark:text-purple-400 pt-1">
                      ₹{order.totalAmount}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('deposit_partial')}
                    className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                      paymentType === 'deposit_partial'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 ring-2 ring-purple-600/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Security Deposit Only</span>
                      {paymentType === 'deposit_partial' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Pay security deposit now to hold reservation. Pay rental balance on pickup.
                    </p>
                    <p className="text-sm font-extrabold text-purple-700 dark:text-purple-400 pt-1">
                      ₹{order.securityDeposit}
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 3. Payment Gateway Integration Simulation */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" /> 3. Payment Gateway (Test Environment)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1">
                  <Label>Card Number</Label>
                  <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Expiry Date</Label>
                    <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>CVV / CVC</Label>
                    <Input value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                  </div>
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>256-bit encrypted test transaction. Payment updates invoice state in real time.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary & Pay Button */}
          <div className="space-y-6">
            <Card className="border-purple-200 dark:border-purple-900 shadow-md sticky top-24">
              <CardHeader className="pb-3 border-b bg-purple-50/50 dark:bg-purple-950/20">
                <CardTitle className="text-base font-bold">Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4 text-xs">
                {/* Dates */}
                <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Rental Duration ({order.durationDays} Days)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    From: {new Date(order.startDate).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    To: {new Date(order.endDate).toLocaleString()}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Order Items:</span>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-xs border-b pb-2">
                      <div>
                        <p className="font-semibold line-clamp-1">{item.productName}</p>
                        {item.variantName && <p className="text-[10px] text-purple-600">{item.variantName}</p>}
                        <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="space-y-1.5 pt-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({order.couponCode}):</span>
                      <span>-₹{order.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST Tax ({order.taxRate}%):</span>
                    <span>₹{order.taxAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Security Deposit:</span>
                    <span>₹{order.securityDeposit}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground border-t pt-2">
                    <span>Order Total:</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Amount Due Now */}
                <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-xl space-y-1 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800">
                  <span className="text-[11px] font-semibold uppercase tracking-wider block">Due Now at Checkout:</span>
                  <span className="text-2xl font-extrabold block">₹{initialAmountToPay}</span>
                  {paymentType === 'deposit_partial' && (
                    <p className="text-[10px] text-purple-700 dark:text-purple-300">
                      Remaining balance of ₹{order.totalAmount - order.securityDeposit} due on pickup.
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-sm shadow-lg gap-2">
                  Confirm Order & Pay ₹{initialAmountToPay} <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
