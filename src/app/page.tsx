"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { Search, Calendar, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Layers, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { startAt, endAt, setDateRange, addItem } = useCartStore();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/v1/products", window.location.origin);
      if (searchQuery) url.searchParams.set("search", searchQuery);
      if (selectedCategory !== "all") url.searchParams.set("categoryId", selectedCategory);
      if (startAt && endAt) {
        url.searchParams.set("startAt", new Date(startAt).toISOString());
        url.searchParams.set("endAt", new Date(endAt).toISOString());
      }

      const res = await fetch(url.toString());
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
  }, [selectedCategory, startAt, endAt]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background py-12 md:py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Enterprise Rental Lifecycle Management Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto">
            Rent Premium Equipment with{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Zero Overbooking
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Automated reservation locks, time-based pricing, GST invoicing, instant pickup/return inspection, and deposit tracking.
          </p>

          {/* Search & Date Filter Bar */}
          <div className="max-w-3xl mx-auto bg-card border rounded-2xl p-3 sm:p-4 shadow-xl shadow-primary/5 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search cameras, audio, generator, tools..."
                  className="pl-10 h-11 text-sm bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 border rounded-md px-3 bg-background h-11">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div className="flex items-center gap-1 text-xs font-medium">
                  <input
                    type="date"
                    value={startAt}
                    onChange={(e) => setDateRange(e.target.value, endAt)}
                    className="bg-transparent outline-none cursor-pointer"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endAt}
                    onChange={(e) => setDateRange(startAt, e.target.value)}
                    className="bg-transparent outline-none cursor-pointer"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="h-11 px-6">
                Check Dates
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {[
            { id: "all", name: "All Categories" },
            { id: "cat_cameras", name: "Cameras & Cinema" },
            { id: "cat_audio", name: "Audio & Microphones" },
            { id: "cat_furniture", name: "Event Furniture" },
            { id: "cat_tools", name: "Power & Heavy Tools" },
          ].map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full shrink-0 text-xs px-4"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Card key={n} className="h-96 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <XCircle className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No equipment found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your dates or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {products.map((prod) => {
              const dailyRule = prod.pricingRules?.find((r: any) => r.unit === "DAY");
              const dailyPrice = dailyRule ? dailyRule.price : 250000;
              const imgUrl = prod.images?.[0]?.url || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";

              return (
                <Card key={prod.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all group border-border/70">
                  <div className="relative h-52 w-full overflow-hidden bg-muted">
                    <img
                      src={imgUrl}
                      alt={prod.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      {prod.available ? (
                        <Badge className="bg-emerald-500/90 text-white border-0 shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Available ({prod.availableQuantity})
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Reserved for Dates
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <div className="text-xs text-muted-foreground font-mono">{prod.sku || "SKU-PROD"}</div>
                    <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {prod.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-5 py-2 flex-1 space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">{prod.description}</p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t">
                      <span className="text-muted-foreground">Security Deposit:</span>
                      <Money amountPaise={prod.securityDeposit} className="font-semibold text-foreground" />
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-3 border-t bg-muted/20 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">Rental Rate</div>
                      <div className="flex items-baseline gap-1">
                        <Money amountPaise={dailyPrice} className="text-lg font-bold text-primary" />
                        <span className="text-xs text-muted-foreground">/ day</span>
                      </div>
                    </div>

                    <Link href={`/products/${prod.slug || prod.id}`}>
                      <Button size="sm" className="gap-1.5 shadow-sm">
                        Rent Now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <AiAssistantDrawer />
    </div>
  );
}
