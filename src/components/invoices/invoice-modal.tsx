'use client';

import { Invoice } from '@/types/rental';
import { useRentalStore } from '@/hooks/use-rental-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface InvoiceModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ invoice, isOpen, onClose }: InvoiceModalProps) {
  const store = useRentalStore();
  const settings = store.getSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] p-6 max-h-[90vh] overflow-y-auto print:max-w-none print:w-full print:h-full print:p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 print:hidden">
          <div>
            <DialogTitle className="text-xl font-bold">TAX INVOICE: {invoice.id}</DialogTitle>
            <DialogDescription className="text-xs">
              Order Ref: {invoice.orderId} | Status: <span className="uppercase font-semibold text-emerald-600">{invoice.status}</span>
            </DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="w-4 h-4" /> Print / Export PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="bg-white dark:bg-slate-950 p-6 space-y-6 text-slate-900 dark:text-slate-100 text-xs font-sans">
          {/* Top Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  RF
                </div>
                <span className="text-lg font-extrabold tracking-tight">{settings.companyName}</span>
              </div>
              <p className="text-slate-500">GSTIN: <strong className="text-slate-800 dark:text-slate-200">{settings.gstin}</strong></p>
              <p className="text-slate-500">Odoo Rental Operations Center, Gandhinagar, Gujarat</p>
            </div>

            <div className="text-right space-y-1">
              <Badge className="bg-purple-600 text-white text-xs px-3 py-1 uppercase">Tax Invoice</Badge>
              <p className="font-mono font-bold text-sm text-purple-700 dark:text-purple-400">{invoice.id}</p>
              <p className="text-slate-500">Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
              <p className="text-slate-500">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Billed To / Bill From */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border">
            <div className="space-y-1">
              <span className="font-semibold text-slate-400 uppercase text-[10px]">BILLED TO (CUSTOMER):</span>
              <p className="font-bold text-sm">{invoice.customerName}</p>
              {invoice.companyName && <p className="text-slate-600 dark:text-slate-300">Company: {invoice.companyName}</p>}
              <p className="font-mono font-semibold text-purple-600">GSTIN: {invoice.gstin || '24AAACO1234M1Z5'}</p>
            </div>

            <div className="space-y-1 text-right">
              <span className="font-semibold text-slate-400 uppercase text-[10px]">PAYMENT INFORMATION:</span>
              <p className="font-semibold">Payment Terms: <span className="capitalize">{invoice.paymentType.replace('_', ' ')}</span></p>
              <p className="font-semibold text-emerald-600">Payment Status: <span className="uppercase">{invoice.status}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold border-b text-[11px]">
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Rate</th>
                  <th className="p-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.productName}</p>
                      {item.variantName && <p className="text-[10px] text-purple-600">{item.variantName}</p>}
                    </td>
                    <td className="p-2.5 text-center">{item.quantity}</td>
                    <td className="p-2.5 text-right">₹{item.effectiveDailyRate}</td>
                    <td className="p-2.5 text-right font-semibold">₹{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax & Late Fee Calculations */}
          <div className="flex flex-col items-end space-y-1.5 text-right text-xs pt-2">
            <div className="flex justify-between w-64 text-slate-600 dark:text-slate-300">
              <span>Rental Subtotal:</span>
              <span>₹{invoice.subtotal}</span>
            </div>
            <div className="flex justify-between w-64 text-slate-600 dark:text-slate-300">
              <span>GST Tax ({settings.gstPercentage}%):</span>
              <span>₹{invoice.taxAmount}</span>
            </div>
            <div className="flex justify-between w-64 text-slate-500">
              <span>Security Deposit:</span>
              <span>₹{invoice.securityDeposit}</span>
            </div>
            {invoice.lateFeeAmount > 0 && (
              <div className="flex justify-between w-64 text-red-600 font-bold">
                <span>Late Fee / Penalties:</span>
                <span>+₹{invoice.lateFeeAmount}</span>
              </div>
            )}
            <div className="flex justify-between w-64 text-sm font-extrabold border-t pt-2 text-purple-700 dark:text-purple-400">
              <span>Total Invoice Amount:</span>
              <span>₹{invoice.totalAmount}</span>
            </div>
            <div className="flex justify-between w-64 text-xs font-bold text-emerald-600">
              <span>Amount Paid:</span>
              <span>₹{invoice.paidAmount}</span>
            </div>
            {invoice.balanceDue > 0 && (
              <div className="flex justify-between w-64 text-xs font-bold text-red-600">
                <span>Balance Due:</span>
                <span>₹{invoice.balanceDue}</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4 text-center text-[10px] text-slate-400 space-y-1">
            <p>This is a computer-generated tax invoice under GST laws.</p>
            <p>Odoo Rental Management System • Hackathon Edition 2026</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
