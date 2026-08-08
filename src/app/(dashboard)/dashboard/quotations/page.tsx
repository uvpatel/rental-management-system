"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardQuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
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
        toast.success("Quotation confirmed & inventory reserved!");
        router.push(`/dashboard/rental-orders/${data.data.orderId}`);
      } else {
        toast.error(data.error?.message || "Confirmation failed");
      }
    } catch (e) {
      toast.error("Error processing quotation confirmation");
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    if (statusFilter === "ALL") return true;
    return q.status === statusFilter;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotations & Proposals</h1>
          <p className="text-xs text-muted-foreground">
            Review draft quotes, verify stock availability, and confirm quotes into rental orders.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {["ALL", "DRAFT", "SENT", "CONFIRMED", "EXPIRED"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="rounded-full text-xs px-3.5"
          >
            {s}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : filteredQuotations.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-bold">No quotations found</h3>
          <p className="text-xs text-muted-foreground">Draft quotations will appear here when items are checked out.</p>
        </Card>
      ) : (
        <Card className="border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b font-semibold text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Quotation No</th>
                  <th className="p-3.5">Rental Period</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Subtotal</th>
                  <th className="p-3.5">Tax (GST 18%)</th>
                  <th className="p-3.5">Security Deposit</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/20">
                    <td className="p-3.5 font-mono font-bold text-primary">{q.quotationNumber}</td>
                    <td className="p-3.5 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        {new Date(q.startAt).toLocaleDateString()} to {new Date(q.endAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="p-3.5">
                      <Money amountPaise={q.subtotal} />
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      <Money amountPaise={q.taxAmount} />
                    </td>
                    <td className="p-3.5">
                      <Money amountPaise={q.securityDepositAmount} />
                    </td>
                    <td className="p-3.5 font-bold text-foreground">
                      <Money amountPaise={q.totalAmount} />
                    </td>
                    <td className="p-3.5 text-right">
                      {q.status === "DRAFT" || q.status === "SENT" ? (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmQuotation(q.id)}
                          disabled={confirmingId === q.id}
                          className="gap-1.5 shadow-sm text-xs"
                        >
                          {confirmingId === q.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Confirm Order
                        </Button>
                      ) : (
                        <Badge variant="outline">Confirmed</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AiAssistantDrawer />
    </div>
  );
}
