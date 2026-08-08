"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Calendar, ArrowRight, Loader2 } from "lucide-react";

export default function DashboardPickupsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/rental-orders")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data) => {
        const pickupOrders = (data.data || []).filter(
          (o: any) => o.status === "CONFIRMED" || o.status === "READY_FOR_PICKUP" || o.status === "WITH_CUSTOMER"
        );
        setOrders(pickupOrders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pickups & Dispatch Management</h1>
          <p className="text-xs text-muted-foreground">
            Track scheduled equipment dispatches and record customer handovers.
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
                  <th className="p-3.5">Order Number</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Pickup Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/20">
                    <td className="p-3.5 font-mono font-bold text-primary">{ord.orderNumber}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-foreground">{ord.customerName || "Customer"}</div>
                      <div className="text-[11px] text-muted-foreground">{ord.customerEmail}</div>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        {new Date(ord.startAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {ord.lines?.map((l: any) => `${l.quantity}x ${l.productNameSnapshot}`).join(", ")}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link href={`/dashboard/rental-orders/${ord.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          <Truck className="w-3.5 h-3.5" />
                          Process Pickup
                        </Button>
                      </Link>
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
