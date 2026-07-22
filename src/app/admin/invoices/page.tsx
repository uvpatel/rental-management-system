'use client';

import { useState } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { Invoice } from '@/types/rental';
import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import { InvoiceModal } from '@/components/invoices/invoice-modal';
import { toast } from 'sonner';
import {
  FileText,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Search,
  DollarSign
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

export default function AdminInvoicesPage() {
  const store = useRentalStore();
  const invoices = store.getInvoices();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Manual payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetInvoiceId, setTargetInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const filteredInvoices = invoices.filter((inv) =>
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenPayment = (inv: Invoice) => {
    setTargetInvoiceId(inv.id);
    setPaymentAmount(inv.balanceDue);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInvoiceId || paymentAmount <= 0) return;

    const res = store.recordPayment(targetInvoiceId, paymentAmount);
    if (res.success) {
      toast.success(res.message);
      setIsPaymentModalOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      <SiteHeaderNav />

      <main className="container max-w-7xl mx-auto py-8 px-4 flex-1 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Invoices & Financial Ledger</h1>
            <p className="text-xs text-muted-foreground">
              Manage GST tax invoices, partial payments, security deposits, and customer ledger balances.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search invoice #, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 w-64"
              />
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="p-3">Invoice Ref</th>
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Customer & GSTIN</th>
                  <th className="p-3">Issue / Due Date</th>
                  <th className="p-3">Subtotal & Tax</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Paid / Balance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-purple-700 dark:text-purple-400">
                      {inv.id}
                    </td>

                    <td className="p-3 font-medium">{inv.orderId}</td>

                    <td className="p-3">
                      <p className="font-semibold">{inv.customerName}</p>
                      <p className="text-[10px] text-purple-600 font-mono">GST: {inv.gstin || '24AAACO1234M1Z5'}</p>
                    </td>

                    <td className="p-3 text-muted-foreground">
                      <p>Issue: {new Date(inv.issueDate).toLocaleDateString()}</p>
                      <p>Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                    </td>

                    <td className="p-3">
                      <p>Subtotal: ₹{inv.subtotal}</p>
                      <p className="text-[10px] text-muted-foreground">GST (18%): ₹{inv.taxAmount}</p>
                    </td>

                    <td className="p-3 font-extrabold text-sm text-foreground">
                      ₹{inv.totalAmount}
                    </td>

                    <td className="p-3">
                      <p className="font-semibold text-emerald-600">Paid: ₹{inv.paidAmount}</p>
                      {inv.balanceDue > 0 && (
                        <p className="font-semibold text-red-600 text-[10px]">Due: ₹{inv.balanceDue}</p>
                      )}
                    </td>

                    <td className="p-3">
                      {inv.status === 'paid' ? (
                        <Badge className="bg-emerald-600">Fully Paid</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-400">
                          Balance Pending
                        </Badge>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-2">
                      {inv.balanceDue > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenPayment(inv)}
                          className="h-7 text-[11px] bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Record Payment
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsInvoiceModalOpen(true);
                        }}
                        className="h-7 text-[11px] gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Record Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Record Customer Payment</DialogTitle>
            <DialogDescription className="text-xs">
              Enter payment received against Invoice {targetInvoiceId}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>Payment Amount (₹)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              Post Payment & Update Ledger
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}
    </div>
  );
}
