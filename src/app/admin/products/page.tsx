'use client';

import { useState } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { RentalProduct } from '@/types/rental';
import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  Search,
  Building,
  CheckCircle2
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

export default function AdminProductsPage() {
  const store = useRentalStore();
  const products = store.getProducts();
  const categories = store.getSettings().productCategories;

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New product form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Cameras & Optics');
  const [description, setDescription] = useState('');
  const [quantityOnHand, setQuantityOnHand] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [dailyRate, setDailyRate] = useState(150);
  const [weeklyRate, setWeeklyRate] = useState(750);
  const [securityDeposit, setSecurityDeposit] = useState(300);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTogglePublish = (productId: string, current: boolean) => {
    store.updateProduct(productId, { published: !current });
    toast.success(`Product ${!current ? 'published to website' : 'unpublished'}.`);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) {
      toast.error('Please enter Product Name and SKU.');
      return;
    }

    const currentUser = store.getCurrentUser();

    store.addProduct({
      name,
      sku: sku.toUpperCase(),
      category,
      description,
      vendorId: currentUser?.id || 'usr-vendor-1',
      vendorName: currentUser?.name || 'Apex Motion Gear',
      published: true,
      rentable: true,
      quantityOnHand,
      costPrice: dailyRate * 15,
      hourlyRate,
      dailyRate,
      weeklyRate,
      securityDepositAmount: securityDeposit,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      attributes: [],
      variants: []
    });

    toast.success(`Product "${name}" added to rental catalog!`);
    setIsAddOpen(false);
    // Reset
    setName('');
    setSku('');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      <SiteHeaderNav />

      <main className="container max-w-7xl mx-auto py-8 px-4 flex-1 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Rental Product Inventory</h1>
            <p className="text-xs text-muted-foreground">
              Manage rentable products, time-based pricing rules (hourly/daily/weekly), quantity on hand, and publication status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 w-64"
              />
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Stock on Hand</th>
                  <th className="p-3">Rental Pricing</th>
                  <th className="p-3">Deposit</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="font-bold">{prod.name}</p>
                          <p className="text-[10px] text-muted-foreground">SKU: {prod.sku}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">{prod.category}</Badge>
                    </td>

                    <td className="p-3 font-medium">{prod.vendorName}</td>

                    <td className="p-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{prod.quantityOnHand} units</span>
                    </td>

                    <td className="p-3 space-y-0.5">
                      <p className="font-extrabold text-purple-700 dark:text-purple-400">₹{prod.dailyRate} / day</p>
                      <p className="text-[10px] text-muted-foreground">₹{prod.hourlyRate}/hr | ₹{prod.weeklyRate}/wk</p>
                    </td>

                    <td className="p-3 font-semibold text-slate-600">₹{prod.securityDepositAmount}</td>

                    <td className="p-3">
                      {prod.published ? (
                        <Badge className="bg-emerald-600">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Unpublished</Badge>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePublish(prod.id, prod.published)}
                        className="h-7 w-7 p-0"
                      >
                        {prod.published ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => store.deleteProduct(prod.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Add Product Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[550px] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add New Rentable Product</DialogTitle>
            <DialogDescription className="text-xs">
              Configure product details, time-based rental pricing, and stock on hand.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>Product Name *</Label>
              <Input placeholder="e.g. Sony FX3 Cinema Camera" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>SKU Code *</Label>
                <Input placeholder="CAM-SONY-001" value={sku} onChange={(e) => setSku(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Input placeholder="Key features and specs..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Quantity on Hand *</Label>
                <Input type="number" min={1} value={quantityOnHand} onChange={(e) => setQuantityOnHand(parseInt(e.target.value) || 1)} required />
              </div>
              <div className="space-y-1">
                <Label>Security Deposit (₹)</Label>
                <Input type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(parseFloat(e.target.value) || 0)} required />
              </div>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-lg space-y-2 border border-purple-200">
              <Label className="font-bold text-purple-900 dark:text-purple-100">Flexible Time-Based Rates (₹)</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px]">Hourly Rate</Label>
                  <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label className="text-[10px]">Daily Rate</Label>
                  <Input type="number" value={dailyRate} onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label className="text-[10px]">Weekly Rate</Label>
                  <Input type="number" value={weeklyRate} onChange={(e) => setWeeklyRate(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Product Image URL</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold pt-2">
              Save & Publish Product
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
