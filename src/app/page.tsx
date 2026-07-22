'use client';

import Link from 'next/link';
import { Layers, Store, Building2, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur py-4 px-6">
        <div className="container max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span>Rental<span className="text-purple-400">Flow</span></span>
            <Badge variant="outline" className="text-[10px] border-purple-800 text-purple-400">
              Odoo ERP Hackathon
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/store">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs">
                Launch Online Storefront
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container max-w-6xl mx-auto py-16 px-4 flex-1 flex flex-col justify-center space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs px-3 py-1 gap-1.5 inline-flex">
            <Sparkles className="w-3.5 h-3.5" /> End-to-End Enterprise Rental ERP Solution
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
            Rental Management System
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Prevent double-booking, manage flexible time-based rates (hourly/daily/weekly), process pick-ups and returns, calculate late fees automatically, and generate GST tax invoices.
          </p>
        </div>

        {/* Multi-Role Quick Entry Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {/* Card 1: Customer Storefront */}
          <Card className="bg-slate-900/80 border-slate-800 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between p-6 space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <Badge className="bg-purple-950 text-purple-300 border-purple-800 text-[10px] mb-1">Customer Portal</Badge>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Online Storefront</h3>
                <p className="text-xs text-slate-400 pt-1">
                  Browse rentable products, pick dates with real-time stock availability, select variants, create quotations, and checkout with security deposit.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Date-range availability check</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Quotation cart & checkout</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Order status tracking stepper</li>
              </ul>
            </div>
            <Link href="/store">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs gap-1.5">
                Enter Storefront <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>

          {/* Card 2: Vendor Portal */}
          <Card className="bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between p-6 space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px] mb-1">Vendor Portal</Badge>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Orders & Warehouse Operations</h3>
                <p className="text-xs text-slate-400 pt-1">
                  Manage inventory, process pick-up handovers, inspect returned equipment condition, auto-calculate late fees, and manage products.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pickup & Return handovers</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automatic late return penalties</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Product variants & pricing</li>
              </ul>
            </div>
            <Link href="/admin/orders">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5">
                Vendor Operations <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>

          {/* Card 3: Admin Backoffice */}
          <Card className="bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between p-6 space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px] mb-1">Admin Backoffice</Badge>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Settings & Analytics Reports</h3>
                <p className="text-xs text-slate-400 pt-1">
                  Full control over GST configuration, user role permissions, printable tax invoices, Recharts analytics, and CSV exports.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Interactive charts & dashboards</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Printable PDF GST Invoices</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> One-click CSV/Excel export</li>
              </ul>
            </div>
            <Link href="/admin/reports">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5">
                Admin Reports & Config <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
