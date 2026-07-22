'use client';

import { useState } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { ReturnCondition } from '@/types/rental';
import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import { toast } from 'sonner';
import {
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  User,
  ShieldAlert
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OperationsPage() {
  const store = useRentalStore();
  const pickups = store.getPickups();
  const returns = store.getReturns();
  const orders = store.getOrders();

  // Pickup Action Form state
  const [pickupNotes, setPickupNotes] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('Vendor Ops Lead');

  // Return Action Form state
  const [selectedCondition, setSelectedCondition] = useState<ReturnCondition>('excellent');
  const [damageFee, setDamageFee] = useState(0);
  const [returnNotes, setReturnNotes] = useState('');
  const [actualReturnDate, setActualReturnDate] = useState(new Date().toISOString().slice(0, 16));

  const handleProcessPickup = (pickupId: string) => {
    const res = store.processPickup(pickupId, pickupNotes, verifiedBy);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleProcessReturn = (returnId: string) => {
    const res = store.processReturn(returnId, selectedCondition, damageFee, actualReturnDate, returnNotes);
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
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Warehouse Pickups & Returns Operations</h1>
          <p className="text-xs text-muted-foreground">
            Manage equipment handovers, return condition inspections, and automatic late return penalty fee calculations.
          </p>
        </div>

        <Tabs defaultValue="pickups" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="pickups" className="gap-2">
              <Truck className="w-4 h-4" /> Pickups & Handovers ({pickups.length})
            </TabsTrigger>
            <TabsTrigger value="returns" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Returns & Inspection ({returns.length})
            </TabsTrigger>
          </TabsList>

          {/* PICKUPS TAB */}
          <TabsContent value="pickups" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pickups.length === 0 ? (
                <Card className="col-span-2 py-12 text-center text-muted-foreground">
                  No pickup documents generated yet.
                </Card>
              ) : (
                pickups.map((pu) => {
                  const order = orders.find((o) => o.id === pu.orderId);
                  return (
                    <Card key={pu.id} className="border-slate-200 dark:border-slate-800">
                      <CardHeader className="bg-slate-50/50 dark:bg-slate-950 p-4 border-b flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold">{pu.id}</CardTitle>
                          <p className="text-xs text-muted-foreground">Order Ref: <strong>{pu.orderId}</strong></p>
                        </div>
                        <Badge className={pu.status === 'completed' ? 'bg-emerald-600' : 'bg-amber-600'}>
                          {pu.status === 'completed' ? 'Picked Up (Active)' : 'Pending Pickup'}
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-4 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span>Customer:</span>
                          <span className="font-semibold">{pu.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Scheduled Pickup:</span>
                          <span>{new Date(pu.scheduledPickupDate).toLocaleString()}</span>
                        </div>

                        {order && (
                          <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded space-y-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Items to Hand Over:</span>
                            {order.items.map((i) => (
                              <p key={i.id}>• {i.quantity}x {i.productName}</p>
                            ))}
                          </div>
                        )}

                        {pu.status === 'pending' ? (
                          <div className="pt-2 space-y-2 border-t">
                            <div className="space-y-1">
                              <Label className="text-[11px]">Handover Notes / Serial Numbers</Label>
                              <Input
                                placeholder="Verified ID proof and serial #..."
                                value={pickupNotes}
                                onChange={(e) => setPickupNotes(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                            <Button
                              onClick={() => handleProcessPickup(pu.id)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                            >
                              Confirm Handover (Move Stock to Customer)
                            </Button>
                          </div>
                        ) : (
                          <div className="p-2 rounded bg-emerald-50 text-emerald-800 text-[11px] space-y-1">
                            <p>Handover Completed at: {new Date(pu.actualPickupDate!).toLocaleString()}</p>
                            <p>Verified by: {pu.verifiedBy}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* RETURNS TAB */}
          <TabsContent value="returns" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {returns.length === 0 ? (
                <Card className="col-span-2 py-12 text-center text-muted-foreground">
                  No return inspection documents pending.
                </Card>
              ) : (
                returns.map((ret) => {
                  const order = orders.find((o) => o.id === ret.orderId);
                  return (
                    <Card key={ret.id} className="border-slate-200 dark:border-slate-800">
                      <CardHeader className="bg-slate-50/50 dark:bg-slate-950 p-4 border-b flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold">{ret.id}</CardTitle>
                          <p className="text-xs text-muted-foreground">Order Ref: <strong>{ret.orderId}</strong></p>
                        </div>
                        <Badge className={ret.status === 'returned' ? 'bg-emerald-600' : 'bg-blue-600'}>
                          {ret.status === 'returned' ? 'Returned & Verified' : 'Awaiting Customer Return'}
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-4 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span>Customer:</span>
                          <span className="font-semibold">{ret.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Scheduled End Date:</span>
                          <span>{new Date(ret.scheduledReturnDate).toLocaleString()}</span>
                        </div>

                        {ret.status === 'pending' ? (
                          <div className="pt-2 space-y-3 border-t">
                            <div className="space-y-1">
                              <Label className="text-[11px]">Actual Return Date & Time</Label>
                              <Input
                                type="datetime-local"
                                value={actualReturnDate}
                                onChange={(e) => setActualReturnDate(e.target.value)}
                                className="text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px]">Item Condition</Label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {(['excellent', 'good', 'damaged'] as ReturnCondition[]).map((cond) => (
                                  <button
                                    key={cond}
                                    type="button"
                                    onClick={() => setSelectedCondition(cond)}
                                    className={`py-1 text-[11px] rounded border capitalize font-medium ${
                                      selectedCondition === cond
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    {cond}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {selectedCondition === 'damaged' && (
                              <div className="space-y-1">
                                <Label className="text-[11px] text-red-600">Damage Repair Charge (Deducted from Deposit)</Label>
                                <Input
                                  type="number"
                                  value={damageFee}
                                  onChange={(e) => setDamageFee(parseFloat(e.target.value) || 0)}
                                  className="text-xs"
                                />
                              </div>
                            )}

                            <Button
                              onClick={() => handleProcessReturn(ret.id)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                            >
                              Process Return & Restore Inventory
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 rounded bg-slate-100 dark:bg-slate-900 text-[11px] space-y-1.5 border">
                            <p>Actual Return Date: <strong>{new Date(ret.actualReturnDate!).toLocaleString()}</strong></p>
                            <p>Condition: <strong className="capitalize">{ret.condition}</strong></p>
                            {ret.lateHours > 0 && (
                              <div className="p-2 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                                ⚠️ Late Return Penalty: {ret.lateHours} hours overdue (+₹{ret.lateFeeAmount})
                              </div>
                            )}
                            <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                              Deposit Refund Balance: ₹{ret.refundDepositAmount}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
