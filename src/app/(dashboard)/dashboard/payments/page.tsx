"use client";

import React, { useState, useEffect } from "react";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Loader2 } from "lucide-react";

export default function DashboardPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/reports/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then(() => {
        // Fetch demo payments
        setPayments([
          {
            id: "pay_demo_01",
            gatewayPaymentId: "pay_rzp_demo101",
            gatewayOrderId: "order_rzp_demo101",
            amount: 1531000,
            status: "CAPTURED",
            purpose: "RENTAL_FULL",
            paidAt: new Date().toISOString(),
          },
          {
            id: "pay_demo_02",
            gatewayPaymentId: "pay_rzp_demo100",
            gatewayOrderId: "order_rzp_demo100",
            amount: 2562000,
            status: "CAPTURED",
            purpose: "RENTAL_FULL",
            paidAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Transactions Log</h1>
          <p className="text-xs text-muted-foreground">
            Razorpay transaction IDs, payment capture logs, and deposit refunds.
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
                  <th className="p-3.5">Payment ID</th>
                  <th className="p-3.5">Razorpay Order ID</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Amount Paid</th>
                  <th className="p-3.5">Purpose</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Paid At</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="p-3.5 font-mono font-bold text-primary">{p.gatewayPaymentId}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">{p.gatewayOrderId}</td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="font-semibold">RAZORPAY</Badge>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600">
                      <Money amountPaise={p.amount} />
                    </td>
                    <td className="p-3.5 text-muted-foreground">{p.purpose}</td>
                    <td className="p-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {new Date(p.paidAt).toLocaleString()}
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
