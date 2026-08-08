"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Loader2 } from "lucide-react";

export default function CustomerInvoicesPage() {
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
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Tax Invoices</h1>
          <p className="text-xs text-muted-foreground">
            Downloadable GST compliant invoices with supplier snapshots and payment history.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : invoices.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-3">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold">No invoices generated yet</h3>
              <p className="text-xs text-muted-foreground">Invoices are issued automatically when orders are confirmed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => (
              <Card key={inv.id} className="p-5 border-border/80">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base text-primary">{inv.invoiceNumber}</span>
                      <StatusBadge status={inv.status} />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Issued: {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : "Draft"} | Outstanding: <Money amountPaise={inv.outstandingAmount} className="font-semibold text-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold text-right">Invoice Total</div>
                      <Money amountPaise={inv.totalAmount} className="text-lg font-bold text-foreground" />
                    </div>

                    {inv.rentalOrderId && (
                      <Link href={`/portal/rentals/${inv.rentalOrderId}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <FileText className="w-3.5 h-3.5" />
                          View Full Invoice
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
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
