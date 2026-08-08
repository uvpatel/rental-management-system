"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Calendar, ArrowRight, Loader2 } from "lucide-react";

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/v1/rental-orders")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data) => setOrders(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") return true;
    return o.status === statusFilter;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rental Orders Management</h1>
          <p className="text-xs text-muted-foreground">
            Process pickups, inspections, late return fees, and invoice settlements.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {["ALL", "CONFIRMED", "READY_FOR_PICKUP", "WITH_CUSTOMER", "COMPLETED", "OVERDUE"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="rounded-full text-xs px-3.5"
          >
            {s.replace(/_/g, " ")}
          </Button>
        ))}
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
                  <th className="p-3.5">Order No</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Rental Period</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Outstanding</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/20">
                    <td className="p-3.5 font-mono font-bold text-primary">{ord.orderNumber}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-foreground">{ord.customerName || "Customer"}</div>
                      <div className="text-[11px] text-muted-foreground">{ord.customerEmail}</div>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        {new Date(ord.startAt).toLocaleDateString()} to {new Date(ord.endAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="p-3.5 font-bold">
                      <Money amountPaise={ord.totalAmount} />
                    </td>
                    <td className="p-3.5 font-semibold text-destructive">
                      <Money amountPaise={ord.outstandingAmount} />
                    </td>
                    <td className="p-3.5 text-right">
                      <Link href={`/dashboard/rental-orders/${ord.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          Manage Order
                          <ArrowRight className="w-3.5 h-3.5" />
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
