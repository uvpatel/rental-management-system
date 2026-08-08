"use client";

import React, { useState, useEffect } from "react";
import { Money } from "@/components/shared/Money";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Package, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    quantityOnHand: 1,
    dailyPriceRupees: 2500,
    securityDepositRupees: 10000,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/v1/products${search ? `?search=${search}` : ""}`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          sku: formData.sku || `SKU-${Date.now()}`,
          quantityOnHand: Number(formData.quantityOnHand),
          dailyPrice: Math.round(Number(formData.dailyPriceRupees) * 100),
          securityDeposit: Math.round(Number(formData.securityDepositRupees) * 100),
          imageUrl: formData.imageUrl,
        }),
      });

      if (res.ok) {
        toast.success("Rentable product created!");
        setDialogOpen(false);
        fetchProducts();
      } else {
        const err = await res.json();
        toast.error(err.error?.message || "Failed to create product");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rentable Inventory Catalog</h1>
          <p className="text-xs text-muted-foreground">
            Manage rentable products, stock quantities, pricing rules, and deposits.
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Add Rentable Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search catalog by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs"
        />
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
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Quantity on Hand</th>
                  <th className="p-3.5">Daily Rate</th>
                  <th className="p-3.5">Security Deposit</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((prod) => {
                  const dailyRule = prod.pricingRules?.find((r: any) => r.unit === "DAY");
                  const dailyPrice = dailyRule ? dailyRule.price : 250000;
                  return (
                    <tr key={prod.id} className="hover:bg-muted/20">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={prod.images?.[0]?.url || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg border bg-muted"
                        />
                        <div>
                          <div className="font-bold text-foreground">{prod.name}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">{prod.description}</div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">{prod.sku || "N/A"}</td>
                      <td className="p-3.5 font-bold font-mono text-foreground">{prod.quantityOnHand} units</td>
                      <td className="p-3.5">
                        <Money amountPaise={dailyPrice} className="font-bold text-primary" />
                      </td>
                      <td className="p-3.5">
                        <Money amountPaise={prod.securityDeposit} />
                      </td>
                      <td className="p-3.5">
                        {prod.isPublished ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Product Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Rentable Product</DialogTitle>
            <DialogDescription className="text-xs">
              Configure product details, stock count, daily rates, and security deposit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProduct} className="space-y-3 text-xs py-2">
            <div>
              <label className="font-semibold block mb-1">Product Name *</label>
              <Input
                required
                placeholder="Canon EOS R5 Mark II Cinema Kit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Description</label>
              <Input
                placeholder="Full-frame camera kit with 24-70mm f/2.8 L lens and batteries."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">SKU Code</label>
                <Input
                  placeholder="CAM-CANON-R5"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Quantity on Hand *</label>
                <Input
                  type="number"
                  min={1}
                  required
                  value={formData.quantityOnHand}
                  onChange={(e) => setFormData({ ...formData, quantityOnHand: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Daily Rate (₹) *</label>
                <Input
                  type="number"
                  required
                  value={formData.dailyPriceRupees}
                  onChange={(e) => setFormData({ ...formData, dailyPriceRupees: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Security Deposit (₹) *</label>
                <Input
                  type="number"
                  required
                  value={formData.securityDepositRupees}
                  onChange={(e) => setFormData({ ...formData, securityDepositRupees: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Image URL</label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AiAssistantDrawer />
    </div>
  );
}
