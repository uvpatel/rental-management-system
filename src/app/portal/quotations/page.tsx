"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomerQuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      const res = await fetch("/api/v1/quotations");
      const data = await res.json();
      setQuotations(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleConfirmQuotation = async (quotationId: string) => {
    setConfirmingId(quotationId);
    try {
      const res = await fetch(`/api/v1/quotations/${quotationId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.data?.orderId) {
        toast.success("Quotation confirmed into Rental Order!");
        router.push(`/portal/rentals/${data.data.orderId}`);
      } else {
        toast.error(data.error?.message || "Confirmation failed");
      }
    } catch (e) {
      toast.error("Error confirming quotation");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">My Quotations</h1>
          <p className="text-xs text-muted-foreground">
            Review and confirm draft quotations into binding equipment rental orders.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : quotations.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-3">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold">No draft quotations</h3>
              <p className="text-xs text-muted-foreground">
                Add equipment items to your cart to create draft quotations.
              </p>
              <Link href="/products"><Button>Browse Catalog</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quotations.map((q) => (
              <Card key={q.id} className="p-5 border-border/80">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base text-primary">{q.quotationNumber}</span>
                      <StatusBadge status={q.status} />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(q.startAt).toLocaleDateString()} to {new Date(q.endAt).toLocaleDateString()}
                      </span>
                      {q.couponCode && <span>Coupon: <strong className="text-foreground">{q.couponCode}</strong></span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold text-right">Quotation Total</div>
                      <Money amountPaise={q.totalAmount} className="text-lg font-bold text-foreground" />
                    </div>

                    {q.status === "DRAFT" || q.status === "SENT" ? (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmQuotation(q.id)}
                        disabled={confirmingId === q.id}
                        className="gap-1.5 shadow-sm"
                      >
                        {confirmingId === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Confirm & Reserve
                      </Button>
                    ) : (
                      <Badge variant="outline">Confirmed</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AiAssistantDrawer />
    </div>
  );
}
