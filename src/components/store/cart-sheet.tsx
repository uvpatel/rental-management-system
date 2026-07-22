'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRentalStore } from '@/hooks/use-rental-store';
import { PricingPeriod } from '@/types/rental';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Calendar } from 'lucide-react';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  startDate: string;
  endDate: string;
  rateType?: PricingPeriod;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const router = useRouter();
  const store = useRentalStore();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const loadCart = () => {
    try {
      const raw = localStorage.getItem('odoo_rental_cart');
      if (raw) setCartItems(JSON.parse(raw));
      else setCartItems([]);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cart-updated', loadCart);
    return () => window.removeEventListener('cart-updated', loadCart);
  }, [isOpen]);

  const handleRemove = (index: number) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    localStorage.setItem('odoo_rental_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
    toast.info('Item removed from quotation draft.');
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    const coupons = store.getCoupons();
    const matched = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (matched) {
      setDiscountPercent(matched.discountPercentage);
      toast.success(`Coupon "${matched.code}" applied: ${matched.discountPercentage}% discount!`);
    } else {
      toast.error(`Invalid coupon code. Try 'HACKATHON10' or 'ODOO20'.`);
    }
  };

  // Detailed totals calculation
  const products = store.getProducts();
  const settings = store.getSettings();

  let subtotal = 0;
  let totalDeposit = 0;

  const itemDetails = cartItems.map((ci) => {
    const prod = products.find((p) => p.id === ci.productId);
    if (!prod) return null;
    const variant = prod.variants.find((v) => v.id === ci.variantId);
    const priceCalc = store.calculateItemPrice(
      prod,
      ci.quantity,
      ci.startDate,
      ci.endDate,
      ci.variantId,
      ci.rateType || 'daily'
    );
    subtotal += priceCalc.subtotal;
    totalDeposit += prod.securityDepositAmount * ci.quantity;

    return {
      ...ci,
      product: prod,
      variant,
      priceCalc
    };
  }).filter(Boolean);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableSubtotal * settings.gstPercentage) / 100);
  const totalAmount = taxableSubtotal + taxAmount;

  const handleProceedCheckout = () => {
    if (cartItems.length === 0) return;

    const currentUser = store.getCurrentUser();
    // Create Quotation in Store
    const res = store.createQuotation({
      customerId: currentUser?.id || 'usr-cust-1',
      customerName: currentUser?.name || 'Sarah Connor',
      customerEmail: currentUser?.email || 'sarah@skynetmedia.com',
      companyName: currentUser?.companyName || 'Skynet Media',
      gstin: currentUser?.gstin || '24BBBCS9876Q1Z2',
      startDate: cartItems[0].startDate,
      endDate: cartItems[0].endDate,
      items: cartItems,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined
    });

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    // Clear Cart
    localStorage.removeItem('odoo_rental_cart');
    window.dispatchEvent(new Event('cart-updated'));
    onClose();
    toast.success(`Quotation ${res.orderId} created! Proceeding to Checkout.`);
    router.push(`/checkout?orderId=${res.orderId}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-6 overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-600" />
            Rental Quotation Draft
          </SheetTitle>
          <SheetDescription className="text-xs">
            Review items, dates, security deposits, and taxes before order confirmation.
          </SheetDescription>
        </SheetHeader>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {itemDetails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">Your Quotation Cart is empty</p>
              <p className="text-xs">Browse products and pick dates to add rental items.</p>
            </div>
          ) : (
            itemDetails.map((item: any, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold line-clamp-1">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-[11px] text-purple-600 font-medium">{item.variant.name}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} unit(s)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-white dark:bg-slate-950 p-1.5 rounded border">
                  <Calendar className="w-3 h-3 text-purple-600 shrink-0" />
                  <span className="truncate">{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</span>
                  <span className="font-semibold text-foreground ml-auto">({item.priceCalc.durationDays}d)</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t">
                  <span className="text-muted-foreground">Rental Rate:</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-400">
                    ₹{item.priceCalc.subtotal}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Totals */}
        {itemDetails.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            {/* Coupon Code Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Coupon Code (e.g. HACKATHON10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-8 text-xs h-9 uppercase"
                />
              </div>
              <Button size="sm" variant="outline" onClick={handleApplyCoupon} className="h-9 text-xs">
                Apply
              </Button>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Rental Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({discountPercent}%):</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST Tax ({settings.gstPercentage}%):</span>
                <span>₹{taxAmount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Refundable Security Deposit:</span>
                <span>₹{totalDeposit}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground border-t pt-2">
                <span>Estimated Total:</span>
                <span className="text-purple-700 dark:text-purple-400">₹{totalAmount}</span>
              </div>
            </div>

            <Button
              onClick={handleProceedCheckout}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 py-5"
            >
              Confirm Quotation & Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
