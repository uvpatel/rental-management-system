'use client';

import { useState } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { RentalOrder, Invoice } from '@/types/rental';
import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import { InvoiceModal } from '@/components/invoices/invoice-modal';
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Truck,
  RotateCcw,
  BadgeAlert,
  ArrowRight,
  Printer,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerPortalPage() {
  const store = useRentalStore();
  const currentUser = store.getCurrentUser();

  const orders = store.getOrders().filter(
    (o) => o.customerId === currentUser?.id || currentUser?.role === 'admin'
  );
  const invoices = store.getInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const handleOpenInvoice = (invoiceId?: string) => {
    if (!invoiceId) return;
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      setSelectedInvoice(inv);
      setIsInvoiceOpen(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-slate-600">Quotation Draft</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-600 text-white">Confirmed & Reserved</Badge>;
      case 'picked_up':
        return <Badge className="bg-amber-600 text-white">With Customer (Active)</Badge>;
      case 'returned':
        return <Badge className="bg-emerald-600 text-white">Completed & Restored</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      <SiteHeaderNav />

      <main className="container max-w-6xl mx-auto py-8 px-4 flex-1 space-y-6">
        {/* Customer Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-1">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs">
              Customer Portal
            </Badge>
            <h1 className="text-2xl font-extrabold tracking-tight">Welcome, {currentUser?.name}</h1>
            <p className="text-xs text-muted-foreground">
              Company: <strong>{currentUser?.companyName || 'Independent'}</strong> | GSTIN: <strong>{currentUser?.gstin || 'Not configured'}</strong>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.location.href = '/store'} className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
              + New Rental Quotation
            </Button>
          </div>
        </div>

        {/* Rental Orders List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" /> My Rental Orders & Lifecycle
          </h2>

          {orders.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <CardContent className="space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-medium">No rental orders placed yet.</p>
                <Button onClick={() => window.location.href = '/store'} variant="outline" size="sm">
                  Browse Products & Rent
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-950/50 p-4 border-b flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-purple-700 dark:text-purple-400">{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vendor: <strong>{order.vendorName}</strong> | Placed: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.invoiceId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenInvoice(order.invoiceId)}
                          className="h-8 text-xs gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5 text-purple-600" /> View/Print Invoice
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* Order Status Lifecycle Stepper */}
                    <div className="py-2 border-b">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-2">Order Lifecycle Status</p>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className={`p-2 rounded-lg border ${order.status === 'draft' ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-slate-200 text-slate-500'}`}>
                          1. Quotation Draft
                        </div>
                        <div className={`p-2 rounded-lg border ${order.status === 'confirmed' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : order.status === 'picked_up' || order.status === 'returned' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>
                          2. Reserved & Confirmed
                        </div>
                        <div className={`p-2 rounded-lg border ${order.status === 'picked_up' ? 'border-amber-600 bg-amber-50 text-amber-700 font-bold' : order.status === 'returned' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>
                          3. Picked Up (Active)
                        </div>
                        <div className={`p-2 rounded-lg border ${order.status === 'returned' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 text-slate-500'}`}>
                          4. Returned & Restored
                        </div>
                      </div>
                    </div>

                    {/* Rental Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 space-y-1">
                        <span className="font-semibold text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" /> Start & End Dates
                        </span>
                        <p>From: <strong>{new Date(order.startDate).toLocaleString()}</strong></p>
                        <p>To: <strong>{new Date(order.endDate).toLocaleString()}</strong></p>
                        <p className="text-purple-600 font-semibold">Total Duration: {order.durationDays} Days</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 space-y-1">
                        <span className="font-semibold text-muted-foreground flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-purple-600" /> Payment & Deposit Summary
                        </span>
                        <p>Subtotal: ₹{order.subtotal}</p>
                        <p>Tax (18% GST): ₹{order.taxAmount}</p>
                        <p>Security Deposit: ₹{order.securityDeposit}</p>
                        <p className="font-bold text-foreground">Total Paid: ₹{order.paidAmount} / ₹{order.totalAmount}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 space-y-1">
                        <span className="font-semibold text-muted-foreground">Order Items ({order.items.length}):</span>
                        {order.items.map((i) => (
                          <div key={i.id} className="truncate">
                            • {i.quantity}x {i.productName} ({i.variantName || 'Standard'})
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}
    </div>
  );
}
