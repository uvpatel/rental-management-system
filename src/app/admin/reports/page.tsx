'use client';

import { useState, useMemo } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import { toast } from 'sonner';
import {
  TrendingUp,
  Download,
  DollarSign,
  Package,
  Users,
  Calendar,
  Layers,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#9333ea', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function ReportsAnalyticsPage() {
  const store = useRentalStore();
  const orders = store.getOrders();
  const products = store.getProducts();
  const invoices = store.getInvoices();

  // Metrics calculations
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalBookedValue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const activeRentalsCount = orders.filter((o) => o.status === 'picked_up').length;
  const completedCount = orders.filter((o) => o.status === 'returned').length;

  // Chart Data: Most Rented Products
  const productRentalsMap: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!productRentalsMap[item.productId]) {
        productRentalsMap[item.productId] = { name: item.productName, count: 0, revenue: 0 };
      }
      productRentalsMap[item.productId].count += item.quantity;
      productRentalsMap[item.productId].revenue += item.subtotal;
    });
  });
  const topProductsData = Object.values(productRentalsMap).sort((a, b) => b.revenue - a.revenue);

  // Chart Data: Vendor-wise Performance
  const vendorMap: Record<string, number> = {};
  orders.forEach((ord) => {
    vendorMap[ord.vendorName] = (vendorMap[ord.vendorName] || 0) + ord.totalAmount;
  });
  const vendorChartData = Object.keys(vendorMap).map((vendor) => ({
    name: vendor,
    value: vendorMap[vendor]
  }));

  // Chart Data: Status Breakdown
  const statusCounts = {
    Draft: orders.filter((o) => o.status === 'draft').length,
    Confirmed: orders.filter((o) => o.status === 'confirmed').length,
    Active: orders.filter((o) => o.status === 'picked_up').length,
    Completed: orders.filter((o) => o.status === 'returned').length
  };
  const statusChartData = Object.keys(statusCounts).map((key) => ({
    name: key,
    count: (statusCounts as any)[key]
  }));

  // Export CSV function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Order ID,Customer,Company,GSTIN,Vendor,Status,Total Amount,Paid Amount,Created Date\n';
    orders.forEach((o) => {
      csvContent += `${o.id},"${o.customerName}","${o.companyName || ''}","${o.gstin || ''}","${o.vendorName}",${o.status},${o.totalAmount},${o.paidAmount},${o.createdAt}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rental_Management_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rental report exported to CSV successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      <SiteHeaderNav />

      <main className="container max-w-7xl mx-auto py-8 px-4 flex-1 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Reports & Business Intelligence</h1>
            <p className="text-xs text-muted-foreground">
              Real-time analytics for revenue, stock utilization, top rented equipment, and vendor performance.
            </p>
          </div>

          <Button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-semibold">
            <Download className="w-4 h-4" /> Export Report (CSV / Excel)
          </Button>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Total Revenue Collected</p>
                <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">₹{totalRevenue}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Booked Pipeline: ₹{totalBookedValue}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Active Equipment Rentals</p>
                <p className="text-2xl font-extrabold text-amber-600">{activeRentalsCount}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Currently with Customers</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Completed Orders</p>
                <p className="text-2xl font-extrabold text-emerald-600">{completedCount}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Returned & Restored</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Catalog Products</p>
                <p className="text-2xl font-extrabold text-blue-600">{products.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Across all categories</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Rented Products Bar Chart */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" /> Revenue Generated by Top Products
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(0, 15) + '...'} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#9333ea" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Vendor-wise Revenue Pie Chart */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" /> Vendor Performance Revenue Share
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vendorChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    >
                      {vendorChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `₹${val}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Lifecycle Status Bar */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Rental Orders Volume by Status Stage</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
