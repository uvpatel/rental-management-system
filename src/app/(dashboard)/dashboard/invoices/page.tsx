"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Loader2 } from "lucide-react";

export default function DashboardInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/invoices")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data) => setInvoices(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Ledger</h1>
          <p className="text-xs text-muted-foreground">
            Tax invoices, GST compliance records, paid balances, and outstanding amounts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : (
        <Card className="border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b font-semibold text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Invoice Number</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Subtotal</th>
                  <th className="p-3.5">GST Tax (18%)</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Paid Amount</th>
                  <th className="p-3.5">Outstanding</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20">
                    <td className="p-3.5 font-mono font-bold text-primary">{inv.invoiceNumber}</td>
                    <td className="p-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="p-3.5">
                      <Money amountPaise={inv.subtotal} />
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      <Money amountPaise={inv.taxAmount} />
                    </td>
                    <td className="p-3.5 font-bold">
                      <Money amountPaise={inv.totalAmount} />
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-600">
                      <Money amountPaise={inv.paidAmount} />
                    </td>
                    <td className="p-3.5 font-semibold text-destructive">
                      <Money amountPaise={inv.outstandingAmount} />
                    </td>
                    <td className="p-3.5 text-right">
                      {inv.rentalOrderId && (
                        <Link href={`/dashboard/rental-orders/${inv.rentalOrderId}`}>
                          <Button size="sm" variant="outline" className="gap-1 text-xs">
                            <FileText className="w-3.5 h-3.5" />
                            View Invoice
                          </Button>
                        </Link>
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
