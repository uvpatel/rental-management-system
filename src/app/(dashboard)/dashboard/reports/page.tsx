"use client";

import React, { useState, useEffect } from "react";
import { Money } from "@/components/shared/Money";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/reports/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res?.data) {
          setData(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    const summary = data?.summary || {};
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Metric,Value", `Total Revenue,₹${(summary.totalRevenue || 0) / 100}`, `Outstanding Balance,₹${(summary.outstandingAmount || 0) / 100}`, `Active Rentals,${summary.activeRentals || 0}`, `Overdue Rentals,${summary.overdueRentals || 0}`, `Utilization Rate,${summary.utilizationRate || 0}%`].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rental_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Report exported successfully!");
  };

  if (loading) {
    return (
      <div className="p-8 text-center py-24">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const topProducts = data?.topProducts || [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Financial Reports</h1>
          <p className="text-xs text-muted-foreground">
            Auditable business analytics, revenue breakdowns, and downloadable CSV reports.
          </p>
        </div>

        <Button onClick={handleExportCSV} className="gap-2 shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground">Total Platform Revenue</div>
          <Money amountPaise={summary.totalRevenue || 0} className="text-2xl font-bold text-primary" />
        </Card>
        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground">Outstanding Invoices</div>
          <Money amountPaise={summary.outstandingAmount || 0} className="text-2xl font-bold text-foreground" />
        </Card>
        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground">Inventory Utilization Rate</div>
          <div className="text-2xl font-bold text-emerald-600">{summary.utilizationRate || 0}%</div>
        </Card>
      </div>

      <Card className="p-6 border shadow-sm">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-bold">Top Performing Rental Products</CardTitle>
          <CardDescription className="text-xs">Ranked by total historical rental revenue</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-xs">
            {topProducts.map((p: any) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">SKU: {p.sku || "N/A"}</div>
                </div>
                <div className="text-right font-bold text-primary">
                  ₹{p.totalRevenueRupees?.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AiAssistantDrawer />
    </div>
  );
}
