"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Money } from "@/components/shared/Money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { Calendar, CheckCircle2, XCircle, ShieldCheck, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { startAt, endAt, setDateRange, addItem } = useCartStore();

  const [availability, setAvailability] = useState<{ available: boolean; availableQuantity: number }>({
    available: true,
    availableQuantity: 1,
  });
  const [checkingAvail, setCheckingAvail] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/v1/products/${slug}?startAt=${startAt}&endAt=${endAt}`);
        const data = await res.json();
        if (data.data) {
          setProduct(data.data);
          if (data.data.availability) {
            setAvailability(data.data.availability);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug, startAt, endAt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container max-w-6xl mx-auto py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading rental item...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container max-w-6xl mx-auto py-20 text-center space-y-4">
          <XCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Equipment not found</h2>
          <Link href="/products">
            <Button variant="outline">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const dailyRule = product.pricingRules?.find((r: any) => r.unit === "DAY");
  const dailyPrice = dailyRule ? dailyRule.price : 250000;

  const start = new Date(startAt);
  const end = new Date(endAt);
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const days = Math.max(1, Math.ceil(diffMs / (1000 * 3600 * 24)));

  const subtotal = dailyPrice * days * quantity;
  const taxAmount = Math.round((subtotal * 18) / 100);
  const depositAmount = (product.securityDeposit || 0) * quantity;
  const grandTotal = subtotal + taxAmount + depositAmount;

  const handleAddToCart = () => {
    if (!availability.available || availability.availableQuantity < quantity) {
      toast.error("Requested quantity exceeds available stock for selected dates.");
      return;
    }

    addItem(
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        imageUrl: product.images?.[0]?.url,
        dailyPrice,
        securityDeposit: product.securityDeposit || 0,
      },
      quantity
    );

    toast.success("Added to rental quotation!");
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Equipment Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border bg-muted aspect-video shadow-md">
              <img
                src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-xs">
                  {product.sku || "SKU-CAMERA"}
                </Badge>
                {availability.available ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> In Stock ({availability.availableQuantity} Units Available)
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Fully Reserved
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div className="bg-muted/40 p-3 rounded-xl border text-center">
                  <div className="text-[11px] text-muted-foreground font-medium">Daily Rate</div>
                  <Money amountPaise={dailyPrice} className="text-base font-bold text-primary" />
                </div>
                <div className="bg-muted/40 p-3 rounded-xl border text-center">
                  <div className="text-[11px] text-muted-foreground font-medium">Security Deposit</div>
                  <Money amountPaise={product.securityDeposit} className="text-base font-semibold" />
                </div>
                <div className="bg-muted/40 p-3 rounded-xl border text-center col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-muted-foreground font-medium">GST Tax</div>
                  <div className="text-base font-semibold text-foreground">18% Standard</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Configurator */}
          <div className="lg:col-span-5">
            <Card className="sticky top-24 border-border/80 shadow-xl">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                  <span>Rental Configurator</span>
                  <Badge variant="secondary" className="font-normal text-xs">
                    Deterministic Pricing
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {/* Date Interval Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Select Rental Dates *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Start Date</span>
                      <Input
                        type="date"
                        value={startAt}
                        onChange={(e) => setDateRange(e.target.value, endAt)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">End Date</span>
                      <Input
                        type="date"
                        value={endAt}
                        onChange={(e) => setDateRange(startAt, e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Quantity Required</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="font-mono font-bold text-lg w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(availability.availableQuantity || 1, quantity + 1))}
                    >
                      +
                    </Button>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Max: {availability.availableQuantity} units
                    </span>
                  </div>
                </div>

                {/* Live Calculated Price Breakdown Card */}
                <div className="bg-muted/50 p-4 rounded-xl border space-y-2 text-xs">
                  <div className="font-semibold text-foreground text-sm pb-1 border-b flex justify-between">
                    <span>Price Breakdown</span>
                    <span className="text-primary font-mono">{days} Billable Day(s)</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rental Subtotal</span>
                    <Money amountPaise={subtotal} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <Money amountPaise={taxAmount} />
                  </div>
                  <div className="flex justify-between pt-1 border-t">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Refundable Security Deposit
                    </span>
                    <Money amountPaise={depositAmount} className="font-semibold" />
                  </div>

                  <div className="flex justify-between pt-2 border-t text-sm font-bold text-foreground">
                    <span>Total Payable</span>
                    <Money amountPaise={grandTotal} className="text-primary" />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  onClick={handleAddToCart}
                  disabled={!availability.available || availability.availableQuantity < quantity}
                  className="w-full py-6 text-base font-semibold shadow-md shadow-primary/20 gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Quotation
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <AiAssistantDrawer />
    </div>
  );
}
