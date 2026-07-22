'use client';

import { useState } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { OrderStatus } from '@/types/rental';
import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import { toast } from 'sonner';
import {
  Package,
  CheckCircle2,
  Clock,
  Filter,
  FileText,
  Truck,
  RotateCcw,
  Search,
  Building,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminOrdersPage() {
  const store = useRentalStore();
  const orders = store.getOrders();
  const currentUser = store.getCurrentUser();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    // If vendor role, show only their products/orders
    if (currentUser?.role === 'vendor' && order.vendorId !== currentUser.id) {
      return false;
    }
    const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleConfirmOrder = (orderId: string) => {
    const res = store.confirmOrder(orderId, 'full');
    if (res.success) {
      toast.success(res.message);
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
            <h1 className="text-2xl font-extrabold tracking-tight">Rental Orders & Quotations</h1>
            <p className="text-xs text-muted-foreground">
              Manage quotations, confirm rental orders, reserve inventory, and track customer lifecycles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 w-64"
              />
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['all', 'draft', 'confirmed', 'picked_up', 'returned'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className="capitalize text-xs rounded-full"
            >
              {status === 'all' ? 'All Orders' : status.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Customer & Company</th>
                  <th className="p-3">Rental Dates & Duration</th>
                  <th className="p-3">Items Rented</th>
                  <th className="p-3">Total / Paid</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No rental orders found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-purple-700 dark:text-purple-400">
                        {order.id}
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-3">
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{order.companyName || 'Independent'}</p>
                        {order.gstin && (
                          <span className="text-[10px] font-mono text-purple-600 block">GST: {order.gstin}</span>
                        )}
                      </td>

                      <td className="p-3">
                        <p>{new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}</p>
                        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                          {order.durationDays} Days ({order.durationHours} hrs)
                        </Badge>
                      </td>

                      <td className="p-3 max-w-[200px]">
                        {order.items.map((i) => (
                          <div key={i.id} className="truncate">
                            • {i.quantity}x {i.productName}
                          </div>
                        ))}
                      </td>

                      <td className="p-3 font-semibold">
                        ₹{order.totalAmount}
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          Paid: ₹{order.paidAmount}
                        </span>
                      </td>

                      <td className="p-3">
                        {order.status === 'draft' && <Badge variant="outline">Draft Quotation</Badge>}
                        {order.status === 'confirmed' && <Badge className="bg-blue-600">Stock Reserved</Badge>}
                        {order.status === 'picked_up' && <Badge className="bg-amber-600">With Customer</Badge>}
                        {order.status === 'returned' && <Badge className="bg-emerald-600">Returned & Completed</Badge>}
                      </td>

                      <td className="p-3 text-right space-x-2">
                        {order.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmOrder(order.id)}
                            className="h-7 text-[11px] bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Confirm & Reserve Stock
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = '/admin/operations'}
                            className="h-7 text-[11px] border-amber-500 text-amber-700 hover:bg-amber-50"
                          >
                            Go to Pickup
                          </Button>
                        )}
                        {order.status === 'picked_up' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = '/admin/operations'}
                            className="h-7 text-[11px] border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                          >
                            Process Return
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
