"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Money } from "@/components/shared/Money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { CheckCircle2, ShieldCheck, CreditCard, ArrowLeft, Loader2, FileText, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, startAt, endAt, couponCode, fulfilmentMethod, setFulfilmentMethod, clearCart } = useCartStore();

  const [actor, setActor] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("101 Commercial Hub, S.G. Highway, Ahmedabad");
  const [paymentOption, setPaymentOption] = useState<"FULL" | "PARTIAL">("FULL");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setActor(data.data);
          if (data.data.companyName) setCompanyName(data.data.companyName);
          if (data.data.gstin) setGstin(data.data.gstin);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  const start = new Date(startAt);
  const end = new Date(endAt);
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const days = Math.max(1, Math.ceil(diffMs / (1000 * 3600 * 24)));

  const subtotal = items.reduce((acc, item) => acc + item.dailyPrice * days * item.quantity, 0);
  const totalDeposit = items.reduce((acc, item) => acc + item.securityDeposit * item.quantity, 0);

  let discountAmount = 0;
  if (couponCode.toUpperCase() === "WELCOME10" && subtotal >= 100000) {
    discountAmount = Math.min(50000, Math.round(subtotal * 0.1));
  } else if (couponCode.toUpperCase() === "HACKATHON20" && subtotal >= 200000) {
    discountAmount = Math.round(subtotal * 0.2);
  }

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableSubtotal * 18) / 100);
  const grandTotal = taxableSubtotal + taxAmount + totalDeposit;

  const handleConfirmOrder = async () => {
    if (!actor) {
      toast.error("Please sign in or register to complete your order.");
      router.push("/sign-in");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Please accept the rental agreement terms to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Quotation
      const qRes = await fetch("/api/v1/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          couponCode,
          fulfilmentMethod,
          billingAddressJson: JSON.stringify({ address, companyName, gstin }),
          lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const qData = await qRes.json();

      if (!qRes.ok || !qData.data?.quotationId) {
        toast.error(qData.error?.message || "Failed to create quotation");
        setIsSubmitting(false);
        return;
      }

      // 2. Confirm Quotation into Order & Reservation
      const cRes = await fetch(`/api/v1/quotations/${qData.data.quotationId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const cData = await cRes.json();

      if (!cRes.ok) {
        toast.error(cData.error?.message || "Reservation conflict occurred.");
        setIsSubmitting(false);
        return;
      }

      clearCart();
      setConfirmedOrder(cData.data);
      toast.success("Rental Order Confirmed!");
    } catch (err: any) {
      toast.error("Error processing order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="container max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/15 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-extrabold">Order Confirmed!</h1>
          <p className="text-muted-foreground text-sm">
            Your rental order and inventory reservations have been created atomically.
          </p>

          <Card className="p-6 text-left max-w-md mx-auto space-y-3 border">
            <div className="flex justify-between border-b pb-2 text-xs">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-mono font-bold text-primary">{confirmedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b pb-2 text-xs">
              <span className="text-muted-foreground">Invoice Reference:</span>
              <span className="font-mono font-semibold">{confirmedOrder.invoiceId}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-muted-foreground">Amount Required:</span>
              <Money amountPaise={confirmedOrder.paymentRequired} className="font-bold text-base text-foreground" />
            </div>
          </Card>

          <div className="flex justify-center gap-4 pt-4">
            <Link href={`/portal/rentals/${confirmedOrder.orderId}`}>
              <Button className="gap-2">
                <FileText className="w-4 h-4" />
                View Order & Invoice
              </Button>
            </Link>
            <Link href="/portal/rentals">
              <Button variant="outline">Customer Portal</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-6">Rental Order Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground">No items in cart to checkout.</p>
            <Link href="/products"><Button>Browse Catalog</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Steps & Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Customer Info */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
                  Customer & Billing Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-medium text-muted-foreground mb-1 block">Full Name</label>
                    <Input value={actor?.name || "Customer"} disabled />
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground mb-1 block">Email Address</label>
                    <Input value={actor?.email || "customer@example.com"} disabled />
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground mb-1 block">Company Name</label>
                    <Input placeholder="Kinetix Media Ltd" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground mb-1 block">GSTIN</label>
                    <Input placeholder="24ABCDE1234F1Z5" value={gstin} onChange={(e) => setGstin(e.target.value)} />
                  </div>
                </div>
              </Card>

              {/* Step 2: Fulfilment Choice */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
                  Fulfilment Method & Address
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Button
                    type="button"
                    variant={fulfilmentMethod === "PICKUP" ? "default" : "outline"}
                    onClick={() => setFulfilmentMethod("PICKUP")}
                    className="h-12 flex-col gap-0.5"
                  >
                    <span className="font-bold">Store Pickup</span>
                    <span className="text-[10px] opacity-80">Collect from Apex Warehouse</span>
                  </Button>
                  <Button
                    type="button"
                    variant={fulfilmentMethod === "DELIVERY" ? "default" : "outline"}
                    onClick={() => setFulfilmentMethod("DELIVERY")}
                    className="h-12 flex-col gap-0.5"
                  >
                    <span className="font-bold">Site Delivery</span>
                    <span className="text-[10px] opacity-80">Direct to shoot location</span>
                  </Button>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} className="text-xs" />
                </div>
              </Card>

              {/* Step 3: Payment Choice & Terms */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span>
                  Payment Option & Agreement
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Button
                    type="button"
                    variant={paymentOption === "FULL" ? "default" : "outline"}
                    onClick={() => setPaymentOption("FULL")}
                    className="h-12 flex-col gap-0.5"
                  >
                    <span className="font-bold">Full Payment</span>
                    <span className="text-[10px] opacity-80">Rental + Deposit</span>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentOption === "PARTIAL" ? "default" : "outline"}
                    onClick={() => setPaymentOption("PARTIAL")}
                    className="h-12 flex-col gap-0.5"
                  >
                    <span className="font-bold">Pay Deposit First</span>
                    <span className="text-[10px] opacity-80">Settle balance at pickup</span>
                  </Button>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t text-xs">
                  <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(c) => setAcceptedTerms(!!c)} />
                  <label htmlFor="terms" className="leading-snug text-muted-foreground cursor-pointer">
                    I agree to the <span className="underline text-foreground font-medium">Rental Terms & Conditions</span>, grace period policy, and security deposit inspection procedures.
                  </label>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <Card className="sticky top-24 shadow-lg border-border">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg font-bold flex items-center justify-between">
                    <span>Order Summary</span>
                    <Badge variant="outline" className="font-mono text-xs">{days} Days</Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-3 text-xs">
                  <div className="space-y-2 pb-3 border-b">
                    {items.map((i) => (
                      <div key={i.productId} className="flex justify-between">
                        <span className="text-muted-foreground">{i.quantity}x {i.name}</span>
                        <Money amountPaise={i.dailyPrice * days * i.quantity} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <Money amountPaise={subtotal} />
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-<Money amountPaise={discountAmount} /></span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (18%)</span>
                    <Money amountPaise={taxAmount} />
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Security Deposit</span>
                    <Money amountPaise={totalDeposit} />
                  </div>

                  <div className="flex justify-between pt-3 border-t text-base font-bold text-foreground">
                    <span>Grand Total</span>
                    <Money amountPaise={grandTotal} className="text-primary" />
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting || !acceptedTerms}
                    className="w-full py-6 text-base font-semibold gap-2 shadow-md"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                    Confirm & Reserve Gear
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>

      <AiAssistantDrawer />
    </div>
  );
}
