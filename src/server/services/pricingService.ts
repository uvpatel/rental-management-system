import { db } from "@/db";
import { pricingRules, products, coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type PriceBreakdownLine = {
  productId: string;
  productVariantId?: string;
  productName: string;
  sku?: string;
  quantity: number;
  startAt: Date;
  endAt: Date;
  pricingUnit: "HOUR" | "DAY" | "WEEK";
  durationUnits: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  securityDepositAmount: number;
  totalAmount: number;
};

export type PricingResult = {
  lines: PriceBreakdownLine[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  securityDepositAmount: number;
  totalAmount: number;
  couponCode?: string;
};

export async function calculateRentalQuote(input: {
  startAt: Date;
  endAt: Date;
  couponCode?: string;
  lines: { productId: string; productVariantId?: string; quantity: number }[];
}): Promise<PricingResult> {
  const start = new Date(input.startAt);
  const end = new Date(input.endAt);

  if (end <= start) {
    throw new Error("Rental end time must be after start time.");
  }

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 3600 * 24)));

  let overallSubtotal = 0;
  let overallDeposit = 0;
  const calculatedLines: PriceBreakdownLine[] = [];

  for (const line of input.lines) {
    const prodRows = await db.select().from(products).where(eq(products.id, line.productId));
    const prod = prodRows[0];

    if (!prod) {
      throw new Error(`Product not found: ${line.productId}`);
    }

    const rules = await db
      .select()
      .from(pricingRules)
      .where(
        and(
          eq(pricingRules.productId, line.productId),
          eq(pricingRules.isActive, true)
        )
      );

    let pricingUnit: "HOUR" | "DAY" | "WEEK" = "DAY";
    let durationUnits = diffDays;
    let unitPrice = prod.salesPrice || 250000;

    const dayRule = rules.find((r) => r.unit === "DAY");
    const weekRule = rules.find((r) => r.unit === "WEEK");

    if (diffDays >= 7 && weekRule) {
      pricingUnit = "WEEK";
      durationUnits = Math.ceil(diffDays / 7);
      unitPrice = weekRule.price;
    } else if (dayRule) {
      pricingUnit = "DAY";
      durationUnits = diffDays;
      unitPrice = dayRule.price;
    }

    const lineSubtotal = unitPrice * durationUnits * line.quantity;
    const lineDeposit = (prod.securityDeposit || 0) * line.quantity;

    overallSubtotal += lineSubtotal;
    overallDeposit += lineDeposit;

    calculatedLines.push({
      productId: line.productId,
      productVariantId: line.productVariantId,
      productName: prod.name,
      sku: prod.sku || undefined,
      quantity: line.quantity,
      startAt: start,
      endAt: end,
      pricingUnit,
      durationUnits,
      unitPrice,
      subtotal: lineSubtotal,
      discountAmount: 0,
      taxRate: 18,
      taxAmount: 0,
      securityDepositAmount: lineDeposit,
      totalAmount: 0,
    });
  }

  let overallDiscount = 0;
  if (input.couponCode) {
    const couponRows = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, input.couponCode.toUpperCase()), eq(coupons.isActive, true)));
    const coupon = couponRows[0];

    if (coupon) {
      if (overallSubtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === "PERCENTAGE") {
          overallDiscount = Math.round((overallSubtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount && overallDiscount > coupon.maxDiscountAmount) {
            overallDiscount = coupon.maxDiscountAmount;
          }
        } else {
          overallDiscount = coupon.discountValue;
        }
      }
    }
  }

  const taxableSubtotal = Math.max(0, overallSubtotal - overallDiscount);
  const overallTax = Math.round((taxableSubtotal * 18) / 100);
  const grandTotal = taxableSubtotal + overallTax + overallDeposit;

  calculatedLines.forEach((l) => {
    const ratio = overallSubtotal > 0 ? l.subtotal / overallSubtotal : 0;
    l.discountAmount = Math.round(overallDiscount * ratio);
    const lineTaxable = Math.max(0, l.subtotal - l.discountAmount);
    l.taxAmount = Math.round((lineTaxable * 18) / 100);
    l.totalAmount = lineTaxable + l.taxAmount + l.securityDepositAmount;
  });

  return {
    lines: calculatedLines,
    subtotal: overallSubtotal,
    discountAmount: overallDiscount,
    taxAmount: overallTax,
    securityDepositAmount: overallDeposit,
    totalAmount: grandTotal,
    couponCode: input.couponCode,
  };
}
