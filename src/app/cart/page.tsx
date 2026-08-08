"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Money } from "@/components/shared/Money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { Calendar, ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { items, startAt, endAt, setDateRange, updateQuantity, removeItem, couponCode, setCouponCode } =
    useCartStore();

  const [inputCoupon, setInputCoupon] = useState(couponCode);

  const start = new Date(startAt);
  const end = new Date(endAt);
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const days = Math.max(1, Math.ceil(diffMs / (1000 * 3600 * 24)));

  const subtotal = items.reduce((acc, item) => acc + item.dailyPrice * days * item.quantity, 0);
  const totalDeposit = items.reduce((acc, item) => acc + item.securityDeposit * item.quantity, 0);

  let discountAmount = 0;
  if (couponCode.toUpperCase() === "WELCOME10" && subtotal >= 100000) {
    discountAmount = Math.min(50000, Math.round(subtotal * 0.1));
  } else if (couponCode.toUpperCase() === "HACKATHON20" && subtotal >= 200000) {
    discountAmount = Math.round(subtotal * 0.2);
  }

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableSubtotal * 18) / 100);
  const grandTotal = taxableSubtotal + taxAmount + totalDeposit;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.toUpperCase() === "WELCOME10" || inputCoupon.toUpperCase() === "HACKATHON20") {
      setCouponCode(inputCoupon.toUpperCase());
      toast.success(`Coupon code ${inputCoupon.toUpperCase()} applied!`);
    } else {
      toast.error("Invalid coupon code. Try WELCOME10 or HACKATHON20.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">Your Rental Cart</h1>

        {items.length === 0 ? (
          <Card className="text-center py-16 space-y-4">
            <CardContent>
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-bold">Your cart is empty</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                Explore our catalog of cameras, audio systems, generators, and tools available for rental.
              </p>
              <Link href="/products">
                <Button>Browse Catalog</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items List */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-4 bg-muted/40 border">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  Selected Rental Period ({days} Days):
                  <span className="font-mono text-primary">{startAt} to {endAt}</span>
                </div>
              </Card>

              {items.map((item) => (
                <Card key={item.productId} className="flex flex-col sm:flex-row items-center p-4 gap-4">
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border bg-muted"
                  />
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    <div className="text-xs text-muted-foreground">
                      Rate: <Money amountPaise={item.dailyPrice} /> / day | Deposit: <Money amountPaise={item.securityDeposit} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="font-mono text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>

                  <div className="text-right sm:min-w-[100px]">
                    <Money amountPaise={item.dailyPrice * days * item.quantity} className="font-bold text-sm" />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>

            {/* Price Summary */}
            <div className="lg:col-span-5">
              <Card className="sticky top-24 shadow-lg border-border">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg font-bold">Quotation Summary</CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-4 text-xs">
                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="WELCOME10 or HACKATHON20"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        className="pl-9 text-xs"
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm">
                      Apply
                    </Button>
                  </form>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({days} days)</span>
                      <Money amountPaise={subtotal} />
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Coupon Discount ({couponCode})</span>
                        <span>-<Money amountPaise={discountAmount} /></span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <Money amountPaise={taxAmount} />
                    </div>

                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Refundable Deposit
                      </span>
                      <Money amountPaise={totalDeposit} className="font-semibold" />
                    </div>

                    <div className="flex justify-between pt-3 border-t text-base font-bold text-foreground">
                      <span>Grand Total</span>
                      <Money amountPaise={grandTotal} className="text-primary" />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Link href="/checkout" className="w-full">
                    <Button className="w-full py-6 text-base font-semibold gap-2 shadow-md">
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>

      <AiAssistantDrawer />
    </div>
  );
}
