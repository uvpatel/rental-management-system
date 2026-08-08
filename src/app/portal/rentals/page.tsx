"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight, Calendar, ShoppingBag, Loader2 } from "lucide-react";

export default function CustomerRentalsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/rental-orders")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data) => setOrders(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Rental Orders</h1>
            <p className="text-xs text-muted-foreground">
              Track your active equipment rentals, return deadlines, and invoices.
            </p>
          </div>
          <Link href="/products">
            <Button size="sm" className="gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              Rent Equipment
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-3">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold">No rental orders yet</h3>
              <p className="text-xs text-muted-foreground">
                Browse our rentable inventory and place your first quotation order.
              </p>
              <Link href="/products"><Button>Explore Catalog</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <Card key={ord.id} className="p-5 hover:shadow-md transition-all border-border/80">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base text-primary">{ord.orderNumber}</span>
                      <StatusBadge status={ord.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(ord.startAt).toLocaleDateString()} to {new Date(ord.endAt).toLocaleDateString()}
                      </span>
                      <span>
                        Items: <strong className="text-foreground">{ord.lines?.length || 1}</strong>
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {ord.lines?.map((l: any) => `${l.quantity}x ${l.productNameSnapshot}`).join(", ")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold text-right">Total Amount</div>
                      <Money amountPaise={ord.totalAmount} className="text-lg font-bold text-foreground" />
                    </div>

                    <Link href={`/portal/rentals/${ord.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <FileText className="w-3.5 h-3.5" />
                        Order Details & Invoice
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
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
