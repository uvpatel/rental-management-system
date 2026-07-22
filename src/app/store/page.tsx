'use client';

import { useState, useMemo } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { RentalProduct } from '@/types/rental';
import { ProductDetailModal } from '@/components/store/product-detail-modal';
import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Building2,
  Tag
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function StorefrontPage() {
  const store = useRentalStore();
  const products = store.getProducts().filter((p) => p.published && p.rentable);
  const categories = store.getSettings().productCategories;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Global Rental Dates for Live Availability Filter
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const defaultEnd = new Date(tomorrow);
  defaultEnd.setDate(defaultEnd.getDate() + 3);
  defaultEnd.setHours(18, 0, 0, 0);

  const [globalStart, setGlobalStart] = useState(tomorrow.toISOString().slice(0, 16));
  const [globalEnd, setGlobalEnd] = useState(defaultEnd.toISOString().slice(0, 16));

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<RentalProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search match
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category match
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      <SiteHeaderNav />

      {/* Hero Banner with Global Date Availability Picker */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white py-12 px-4 border-b">
        <div className="container max-w-6xl mx-auto space-y-6">
          <div className="max-w-2xl space-y-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs gap-1.5 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Enterprise Rental ERP
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Online Rental Store & Reservation System
            </h1>
            <p className="text-sm text-slate-300">
              Select your rental dates to verify real-time stock availability and prevent double-booking.
            </p>
          </div>

          {/* Interactive Global Rental Date Picker & Search Bar */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-2xl">
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs text-slate-200 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-purple-400" /> Search Equipment
              </Label>
              <div className="relative">
                <Input
                  placeholder="Search cameras, tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-xs h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-200 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> Rental Start Date
              </Label>
              <Input
                type="datetime-local"
                value={globalStart}
                onChange={(e) => setGlobalStart(e.target.value)}
                className="bg-white/10 border-white/20 text-white text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Rental End Date
              </Label>
              <Input
                type="datetime-local"
                value={globalEnd}
                onChange={(e) => setGlobalEnd(e.target.value)}
                className="bg-white/10 border-white/20 text-white text-xs h-10"
              />
            </div>

            <div className="md:col-span-1">
              <Button
                onClick={() => setSearchQuery('')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-10 shadow-lg"
              >
                <Filter className="w-4 h-4 mr-1" /> Apply Date Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills & Main Grid */}
      <main className="container max-w-6xl mx-auto py-8 px-4 flex-1 space-y-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button
            size="sm"
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className="rounded-full text-xs shrink-0"
          >
            All Categories ({products.length})
          </Button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className="rounded-full text-xs shrink-0"
              >
                {cat} ({count})
              </Button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed text-muted-foreground space-y-3">
            <Layers className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-semibold">No rentable products match your search filters.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const availability = store.checkAvailability(
                product.id,
                1,
                globalStart,
                globalEnd
              );

              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col bg-white dark:bg-slate-900"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-slate-900/80 backdrop-blur text-white text-[10px]">
                        {product.category}
                      </Badge>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-2 right-2">
                      {availability.available ? (
                        <Badge className="bg-emerald-600/90 text-white font-medium text-[10px] gap-1 shadow">
                          <CheckCircle2 className="w-3 h-3" /> {availability.remaining} Available
                        </Badge>
                      ) : (
                        <Badge className="bg-red-600/90 text-white font-medium text-[10px] gap-1 shadow">
                          <AlertTriangle className="w-3 h-3" /> Reserved / Overbooked
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <Building2 className="w-3 h-3 text-purple-600" /> {product.vendorName}
                        </span>
                        <span>SKU: {product.sku}</span>
                      </div>
                      <h3 className="font-bold text-base line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Pricing Tiers */}
                    <div className="pt-2 border-t flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Daily Rate</span>
                        <span className="text-lg font-extrabold text-purple-700 dark:text-purple-400">
                          ₹{product.dailyRate}
                          <span className="text-xs font-normal text-muted-foreground"> / day</span>
                        </span>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4"
                      >
                        Configure & Rent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Detail & Date Config Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultStartDate={globalStart}
        defaultEndDate={globalEnd}
      />
    </div>
  );
}
