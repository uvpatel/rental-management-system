'use client';

import { useState, useEffect } from 'react';
import { useRentalStore } from '@/hooks/use-rental-store';
import { RentalProduct, PricingPeriod } from '@/types/rental';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  ShieldCheck,
  Building,
  Tag,
  Info
} from 'lucide-react';

interface ProductDetailModalProps {
  product: RentalProduct | null;
  isOpen: boolean;
  onClose: () => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  defaultStartDate,
  defaultEndDate
}: ProductDetailModalProps) {
  const store = useRentalStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [rateType, setRateType] = useState<PricingPeriod>('daily');

  // Default dates: tomorrow 9AM to +3 days 6PM
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const defaultEnd = new Date(tomorrow);
  defaultEnd.setDate(defaultEnd.getDate() + 3);
  defaultEnd.setHours(18, 0, 0, 0);

  const [startDate, setStartDate] = useState(
    defaultStartDate || tomorrow.toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    defaultEndDate || defaultEnd.toISOString().slice(0, 16)
  );

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId(undefined);
    }
  }, [product]);

  if (!product) return null;

  // Check Availability for selected date range
  const availability = store.checkAvailability(
    product.id,
    quantity,
    startDate,
    endDate
  );

  // Calculate pricing
  const priceCalc = store.calculateItemPrice(
    product,
    quantity,
    startDate,
    endDate,
    selectedVariantId,
    rateType
  );

  const handleAddToCart = () => {
    if (!availability.available) {
      toast.error(
        `Cannot add to cart: Overbooking protection activated! Only ${availability.remaining} units available for these dates (${availability.reserved} currently reserved).`
      );
      return;
    }

    try {
      const cartItem = {
        productId: product.id,
        variantId: selectedVariantId,
        quantity,
        startDate,
        endDate,
        rateType
      };

      const existingCartStr = localStorage.getItem('odoo_rental_cart');
      const existingCart = existingCartStr ? JSON.parse(existingCartStr) : [];
      existingCart.push(cartItem);
      localStorage.setItem('odoo_rental_cart', JSON.stringify(existingCart));

      window.dispatchEvent(new Event('cart-updated'));
      toast.success(
        `Added ${quantity}x "${product.name}" to your Quotation Cart!`
      );
      onClose();
    } catch {
      toast.error('Failed to add item to cart.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-6 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[11px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {product.category}
            </Badge>
            <span className="text-xs text-muted-foreground">Vendor: <strong>{product.vendorName}</strong></span>
          </div>
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            SKU: {product.sku}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
          {/* Left Column: Product Image & Attributes */}
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 right-2">
                {availability.available ? (
                  <Badge className="bg-emerald-600 text-white font-medium text-[11px] gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {availability.remaining} Available
                  </Badge>
                ) : (
                  <Badge className="bg-red-600 text-white font-medium text-[11px] gap-1">
                    <AlertTriangle className="w-3 h-3" /> Overbooked
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Variants Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-semibold">Select Configuration / Variant:</Label>
                <div className="space-y-1.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs flex items-center justify-between transition-all ${
                        selectedVariantId === v.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-100 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span>{v.name}</span>
                      </div>
                      {v.extraPricePerDay > 0 && (
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          +₹{v.extraPricePerDay}/day
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Date Picker & Pricing Engine */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rental Period Selector
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={rateType === 'daily' ? 'default' : 'ghost'}
                  onClick={() => setRateType('daily')}
                  className="h-6 text-[11px] px-2"
                >
                  Daily
                </Button>
                <Button
                  size="sm"
                  variant={rateType === 'hourly' ? 'default' : 'ghost'}
                  onClick={() => setRateType('hourly')}
                  className="h-6 text-[11px] px-2"
                >
                  Hourly
                </Button>
                <Button
                  size="sm"
                  variant={rateType === 'weekly' ? 'default' : 'ghost'}
                  onClick={() => setRateType('weekly')}
                  className="h-6 text-[11px] px-2"
                >
                  Weekly
                </Button>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="start-date" className="text-xs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" /> Start Date & Time
                </Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="end-date" className="text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" /> End Date & Time
                </Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="req-qty" className="text-xs">Quantity</Label>
                <Input
                  id="req-qty"
                  type="number"
                  min={1}
                  max={product.quantityOnHand}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Availability Warning */}
            {!availability.available && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Double-Booking Conflict</p>
                  <p className="text-[11px]">
                    {availability.reserved} items are already reserved by other rental orders for these dates. Max available: {availability.remaining}.
                  </p>
                </div>
              </div>
            )}

            {/* Price Summary Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Calculated Duration:</span>
                <span className="font-medium text-foreground">{priceCalc.durationDays} Days ({priceCalc.durationHours} Hours)</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Unit Rate:</span>
                <span className="font-medium text-foreground">₹{priceCalc.unitRate} / {rateType === 'hourly' ? 'hr' : rateType === 'weekly' ? 'wk' : 'day'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Refundable Security Deposit:</span>
                <span className="font-medium text-foreground">₹{product.securityDepositAmount * quantity}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-2 border-t text-purple-700 dark:text-purple-400">
                <span>Rental Subtotal:</span>
                <span>₹{priceCalc.subtotal}</span>
              </div>
            </div>

            {/* Add to Cart Action */}
            <Button
              onClick={handleAddToCart}
              disabled={!availability.available}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 py-5"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Rental Quotation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
