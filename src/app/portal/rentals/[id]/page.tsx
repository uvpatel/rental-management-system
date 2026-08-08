"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, ArrowLeft, CreditCard, Printer, CheckCircle2, ShieldCheck, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RentalOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/v1/rental-orders/${id}`);
      const data = await res.json();
      if (data.data) {
        setOrder(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleSimulatePayment = async () => {
    if (!order?.invoice?.id) {
      toast.error("No active invoice found for this order.");
      return;
    }
    setPaying(true);

    try {
      const res = await fetch("/api/v1/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: order.invoice.id,
          razorpayOrderId: `order_rzp_${Date.now()}`,
          razorpayPaymentId: `pay_rzp_${Date.now()}`,
          razorpaySignature: "simulated_valid_signature",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Payment processed successfully!");
        setPayModalOpen(false);
        fetchOrder();
      } else {
        toast.error(data.error?.message || "Payment failed");
      }
    } catch (e) {
      toast.error("Payment connection error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container max-w-5xl mx-auto py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container max-w-5xl mx-auto py-20 text-center space-y-4">
          <h2 className="text-xl font-bold">Order not found</h2>
          <Link href="/portal/rentals"><Button variant="outline">Back to Orders</Button></Link>
        </div>
      </div>
    );
  }

  const steps = [
    { label: "Confirmed", status: "CONFIRMED" },
    { label: "Paid", status: "PAID" },
    { label: "Ready for Pickup", status: "READY_FOR_PICKUP" },
    { label: "With Customer", status: "WITH_CUSTOMER" },
    { label: "Returned & Completed", status: "COMPLETED" },
  ];

  const currentStepIdx = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        <Link href="/portal/rentals" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Rental Orders
        </Link>

        {/* Order Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight font-mono text-primary">
                {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Created on {new Date(order.createdAt).toLocaleDateString()} | Rental Period: {new Date(order.startAt).toLocaleDateString()} to {new Date(order.endAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {order.outstandingAmount > 0 && (
              <Button onClick={() => setPayModalOpen(true)} className="gap-2 shadow-md">
                <CreditCard className="w-4 h-4" />
                Pay Balance (<Money amountPaise={order.outstandingAmount} />)
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()} className="gap-1.5">
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
          </div>
        </div>

        {/* Timeline Indicator */}
        <Card className="p-6 border">
          <div className="text-xs font-semibold text-muted-foreground mb-4">Rental Lifecycle Status</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {steps.map((step, idx) => {
              const isPast = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step.status} className="flex flex-col items-center text-center space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isPast
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground border"
                    } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-medium ${isCurrent ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Lines & Invoice Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items Table */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-base font-bold">Rented Equipment Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y text-xs">
                  {order.lines?.map((line: any) => (
                    <div key={line.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-foreground">{line.productNameSnapshot}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">SKU: {line.skuSnapshot || "N/A"}</div>
                        <div className="text-[11px] text-muted-foreground">Qty: {line.quantity} | Unit: <Money amountPaise={line.unitPrice} /></div>
                      </div>
                      <div className="text-right font-bold text-sm">
                        <Money amountPaise={line.totalAmount} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pickups / Returns Notes */}
            {order.pickup && (
              <Card className="p-4 border text-xs space-y-1">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dispatch Record #{order.pickup.documentNumber}
                </div>
                <p className="text-muted-foreground">{order.pickup.notes || "Handed over in good condition."}</p>
              </Card>
            )}

            {order.returnDoc && (
              <Card className="p-4 border text-xs space-y-1">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Return Inspection #{order.returnDoc.documentNumber}
                </div>
                <p className="text-muted-foreground">{order.returnDoc.notes || "Inspected and returned to available inventory."}</p>
              </Card>
            )}
          </div>

          {/* Invoice Summary */}
          <div className="lg:col-span-5">
            <Card className="border shadow-md">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-base font-bold flex justify-between items-center">
                  <span>Invoice Breakdown</span>
                  <StatusBadge status={order.invoice?.status || order.status} />
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Subtotal</span>
                  <Money amountPaise={order.subtotal} />
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-<Money amountPaise={order.discountAmount} /></span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <Money amountPaise={order.taxAmount} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Security Deposit
                  </span>
                  <Money amountPaise={order.securityDepositAmount} className="font-semibold" />
                </div>

                {order.lateFeeAmount > 0 && (
                  <div className="flex justify-between text-destructive font-semibold pt-1 border-t">
                    <span>Late Fee Applied</span>
                    <Money amountPaise={order.lateFeeAmount} />
                  </div>
                )}

                {order.damageChargeAmount > 0 && (
                  <div className="flex justify-between text-destructive font-semibold">
                    <span>Damage Charge</span>
                    <Money amountPaise={order.damageChargeAmount} />
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t text-sm font-bold text-foreground">
                  <span>Total Amount</span>
                  <Money amountPaise={order.totalAmount} />
                </div>

                <div className="flex justify-between text-xs font-semibold text-emerald-600">
                  <span>Paid Amount</span>
                  <Money amountPaise={order.paidAmount} />
                </div>

                <div className="flex justify-between text-sm font-extrabold text-foreground pt-2 border-t">
                  <span>Outstanding Balance</span>
                  <Money amountPaise={order.outstandingAmount} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Razorpay Payment Dialog */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Razorpay Secure Checkout
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete payment for Invoice #{order?.invoice?.invoiceNumber || order?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/40 p-4 rounded-xl border text-center space-y-2 py-6">
            <div className="text-xs text-muted-foreground">Amount to Pay</div>
            <Money amountPaise={order?.outstandingAmount || 0} className="text-3xl font-extrabold text-primary" />
            <div className="text-[11px] text-muted-foreground">Supports UPI, NetBanking, Credit/Debit Cards</div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSimulatePayment} disabled={paying} className="gap-2">
              {paying && <Loader2 className="w-4 h-4 animate-spin" />}
              Pay Now (Simulate Razorpay)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AiAssistantDrawer />
    </div>
  );
}
