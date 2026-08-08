"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Truck, RotateCcw, CheckCircle2, ShieldCheck, Sparkles, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function DashboardOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pickup Modal state
  const [pickupOpen, setPickupOpen] = useState(false);
  const [pickupNotes, setPickupNotes] = useState("Equipment handed over in excellent condition with battery fully charged.");
  const [submittingPickup, setSubmittingPickup] = useState(false);

  // Return Modal state
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnedAt, setReturnedAt] = useState(new Date().toISOString().slice(0, 16));
  const [returnCondition, setReturnCondition] = useState<"GOOD" | "MINOR_DAMAGE" | "MAJOR_DAMAGE">("GOOD");
  const [damageChargeRupees, setDamageChargeRupees] = useState(0);
  const [returnNotes, setReturnNotes] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

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

  const handleMarkReady = async () => {
    try {
      await fetch(`/api/v1/rental-orders/${id}/ready-for-pickup`, { method: "POST" });
      toast.success("Order marked ready for pickup!");
      fetchOrder();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleRecordPickup = async () => {
    if (!order?.lines?.length) return;
    setSubmittingPickup(true);

    try {
      const res = await fetch(`/api/v1/rental-orders/${id}/pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: pickupNotes,
          items: order.lines.map((l: any) => ({
            orderLineId: l.id,
            quantity: l.quantity,
            condition: "GOOD",
          })),
        }),
      });

      if (res.ok) {
        toast.success("Pickup recorded! Order status changed to WITH_CUSTOMER.");
        setPickupOpen(false);
        fetchOrder();
      } else {
        toast.error("Failed to record pickup");
      }
    } catch (e) {
      toast.error("Error recording pickup");
    } finally {
      setSubmittingPickup(false);
    }
  };

  const handleAiEnhanceNotes = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch("/api/v1/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "return_notes", notes: returnNotes }),
      });
      const data = await res.json();
      if (data.data?.text) {
        setReturnNotes(data.data.text);
        toast.success("Notes enhanced with AI inspection wording!");
      }
    } catch (e) {
      toast.error("AI Assistant error");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleProcessReturn = async () => {
    if (!order?.lines?.length) return;
    setSubmittingReturn(true);

    try {
      const res = await fetch(`/api/v1/rental-orders/${id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnedAt: new Date(returnedAt).toISOString(),
          notes: returnNotes,
          items: order.lines.map((l: any) => ({
            orderLineId: l.id,
            returnedQuantity: l.quantity,
            condition: returnCondition,
            damageCharge: Math.round(Number(damageChargeRupees) * 100),
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Return processed! Late fee: ₹${(data.data.lateFeeAmount / 100).toLocaleString()}`);
        setReturnOpen(false);
        fetchOrder();
      } else {
        toast.error(data.error?.message || "Failed to process return");
      }
    } catch (e) {
      toast.error("Error processing return");
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center py-24">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center py-24 space-y-3">
        <h2 className="text-lg font-bold">Order not found</h2>
        <Link href="/dashboard/rental-orders"><Button variant="outline">Back to Orders</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <Link href="/dashboard/rental-orders" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Rental Orders
      </Link>

      {/* Header & Primary Operational Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-primary">{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Customer ID: {order.customerId} | Due Date: {new Date(order.returnDueAt || order.endAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(order.status === "CONFIRMED" || order.status === "PAID") && (
            <Button size="sm" onClick={handleMarkReady} variant="outline">
              Mark Ready for Pickup
            </Button>
          )}

          {(order.status === "CONFIRMED" || order.status === "READY_FOR_PICKUP" || order.status === "PAID") && (
            <Button size="sm" onClick={() => setPickupOpen(true)} className="gap-1.5 shadow-sm">
              <Truck className="w-4 h-4" />
              Record Pickup
            </Button>
          )}

          {(order.status === "WITH_CUSTOMER" || order.status === "OVERDUE") && (
            <Button size="sm" onClick={() => setReturnOpen(true)} className="gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
              <RotateCcw className="w-4 h-4" />
              Process Equipment Return
            </Button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Items Card */}
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/30 p-4">
              <CardTitle className="text-sm font-bold">Rental Line Items & Stock Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                {order.lines?.map((line: any) => (
                  <div key={line.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">{line.productNameSnapshot}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">SKU: {line.skuSnapshot || "N/A"}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Fulfilled: {line.fulfilledQuantity}/{line.quantity} | Returned: {line.returnedQuantity}/{line.quantity}
                      </div>
                    </div>
                    <div className="text-right font-bold">
                      <Money amountPaise={line.totalAmount} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pickup & Return Records */}
          {order.pickup && (
            <Card className="p-4 border text-xs space-y-1">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-500" /> Dispatch Record #{order.pickup.documentNumber}
              </div>
              <p className="text-muted-foreground">{order.pickup.notes}</p>
            </Card>
          )}

          {order.returnDoc && (
            <Card className="p-4 border text-xs space-y-1">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-emerald-500" /> Return Inspection #{order.returnDoc.documentNumber}
              </div>
              <div className="flex gap-4 pt-1">
                <span>Late Fee: <Money amountPaise={order.returnDoc.lateFeeAmount} className="font-semibold text-destructive" /></span>
                <span>Damage Charge: <Money amountPaise={order.returnDoc.damageChargeAmount} className="font-semibold text-destructive" /></span>
              </div>
              <p className="text-muted-foreground pt-1">{order.returnDoc.notes}</p>
            </Card>
          )}
        </div>

        {/* Financial Summary */}
        <div className="lg:col-span-4">
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/30 p-4">
              <CardTitle className="text-sm font-bold">Financial Summary</CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
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
                <span className="text-muted-foreground">Security Deposit</span>
                <Money amountPaise={order.securityDepositAmount} className="font-semibold" />
              </div>

              {order.lateFeeAmount > 0 && (
                <div className="flex justify-between text-destructive font-semibold pt-1 border-t">
                  <span>Late Fee</span>
                  <Money amountPaise={order.lateFeeAmount} />
                </div>
              )}

              {order.damageChargeAmount > 0 && (
                <div className="flex justify-between text-destructive font-semibold">
                  <span>Damage Charge</span>
                  <Money amountPaise={order.damageChargeAmount} />
                </div>
              )}

              <div className="flex justify-between pt-2 border-t font-bold text-sm">
                <span>Grand Total</span>
                <Money amountPaise={order.totalAmount} />
              </div>

              <div className="flex justify-between text-xs font-semibold text-emerald-600">
                <span>Paid Amount</span>
                <Money amountPaise={order.paidAmount} />
              </div>

              <div className="flex justify-between text-sm font-extrabold text-foreground pt-2 border-t">
                <span>Outstanding</span>
                <Money amountPaise={order.outstandingAmount} className="text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pickup Dialog */}
      <Dialog open={pickupOpen} onOpenChange={setPickupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Equipment Pickup</DialogTitle>
            <DialogDescription className="text-xs">
              Hand over equipment items to customer and confirm dispatch notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div>
              <label className="font-semibold block mb-1">Pickup Notes & Checklist</label>
              <Input
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPickupOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPickup} disabled={submittingPickup} className="gap-2">
              {submittingPickup && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Inspection Dialog */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Process Equipment Return & Inspection</DialogTitle>
            <DialogDescription className="text-xs">
              Calculate late fees based on actual return timestamp and record damage charges.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div>
              <label className="font-semibold block mb-1">Actual Return Date & Time *</label>
              <Input
                type="datetime-local"
                value={returnedAt}
                onChange={(e) => setReturnedAt(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Item Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e: any) => setReturnCondition(e.target.value)}
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                >
                  <option value="GOOD">Good / Normal Wear</option>
                  <option value="MINOR_DAMAGE">Minor Damage (Scratches)</option>
                  <option value="MAJOR_DAMAGE">Major Damage / Repair Needed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Damage Charge (₹)</label>
                <Input
                  type="number"
                  min={0}
                  value={damageChargeRupees}
                  onChange={(e) => setDamageChargeRupees(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold block">Inspection Notes</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAiEnhanceNotes}
                  disabled={aiGenerating}
                  className="h-6 text-[10px] text-primary gap-1 px-2"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Enhance with AI
                </Button>
              </div>
              <Input
                placeholder="Inspected cables, lenses, and battery levels."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button onClick={handleProcessReturn} disabled={submittingReturn} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {submittingReturn && <Loader2 className="w-4 h-4 animate-spin" />}
              Complete Return & Settle Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AiAssistantDrawer />
    </div>
  );
}
