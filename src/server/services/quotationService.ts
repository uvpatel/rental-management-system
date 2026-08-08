import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculateRentalQuote } from "./pricingService";
import { checkAvailability } from "./availabilityService";
import { ActorContext } from "@/lib/actor";

export type CreateQuotationInput = {
  organizationId?: string;
  startAt: Date;
  endAt: Date;
  couponCode?: string;
  fulfilmentMethod?: "PICKUP" | "DELIVERY";
  billingAddressJson?: string;
  deliveryAddressJson?: string;
  lines: { productId: string; productVariantId?: string; quantity: number }[];
};

export async function createQuotation(input: CreateQuotationInput, actor: ActorContext) {
  const orgId = input.organizationId || actor.organizationId || "org_apex";

  const pricing = await calculateRentalQuote({
    startAt: input.startAt,
    endAt: input.endAt,
    couponCode: input.couponCode,
    lines: input.lines,
  });

  const quotationId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const quotationNumber = `QUO-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  await db.insert(schema.quotations).values({
    id: quotationId,
    organizationId: orgId,
    customerId: actor.userId,
    quotationNumber,
    status: "DRAFT",
    startAt: new Date(input.startAt),
    endAt: new Date(input.endAt),
    fulfilmentMethod: input.fulfilmentMethod || "PICKUP",
    billingAddressJson: input.billingAddressJson,
    deliveryAddressJson: input.deliveryAddressJson,
    couponCode: input.couponCode,
    subtotal: pricing.subtotal,
    discountAmount: pricing.discountAmount,
    taxAmount: pricing.taxAmount,
    securityDepositAmount: pricing.securityDepositAmount,
    totalAmount: pricing.totalAmount,
    currency: "INR",
  });

  for (const line of pricing.lines) {
    const lineId = `qline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(schema.quotationLines).values({
      id: lineId,
      quotationId,
      productId: line.productId,
      productVariantId: line.productVariantId,
      productNameSnapshot: line.productName,
      skuSnapshot: line.sku,
      quantity: line.quantity,
      startAt: line.startAt,
      endAt: line.endAt,
      pricingUnit: line.pricingUnit,
      durationUnits: line.durationUnits,
      unitPrice: line.unitPrice,
      subtotal: line.subtotal,
      discountAmount: line.discountAmount,
      taxRateSnapshot: line.taxRate,
      taxAmount: line.taxAmount,
      securityDepositAmount: line.securityDepositAmount,
      totalAmount: line.totalAmount,
    });
  }

  return { quotationId, quotationNumber, pricing };
}

export async function confirmQuotation(quotationId: string, actor: ActorContext) {
  const quoteRows = await db.select().from(schema.quotations).where(eq(schema.quotations.id, quotationId));
  const quote = quoteRows[0];

  if (!quote) {
    throw new Error("Quotation not found.");
  }

  if (quote.status === "CONFIRMED") {
    const existingOrders = await db.select().from(schema.rentalOrders).where(eq(schema.rentalOrders.quotationId, quotationId));
    const existingOrder = existingOrders[0];
    if (existingOrder) {
      return { orderId: existingOrder.id, orderNumber: existingOrder.orderNumber };
    }
  }

  const lines = await db
    .select()
    .from(schema.quotationLines)
    .where(eq(schema.quotationLines.quotationId, quotationId));

  if (!lines || lines.length === 0) {
    throw new Error("Quotation has no line items.");
  }

  const avail = await checkAvailability(
    quote.startAt,
    quote.endAt,
    lines.map((l) => ({
      productId: l.productId,
      productVariantId: l.productVariantId || undefined,
      requestedQuantity: l.quantity,
    }))
  );

  if (!avail.available) {
    const unavailableNames = avail.items
      .filter((i) => !i.available)
      .map((i) => `${i.productName} (Requested: ${i.requestedQuantity}, Available: ${i.availableQuantity})`)
      .join(", ");
    const err = new Error(`Rental period unavailable for: ${unavailableNames}`);
    (err as any).code = "RENTAL_PERIOD_UNAVAILABLE";
    throw err;
  }

  const orderId = `ro_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const orderNumber = `RO-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  await db.insert(schema.rentalOrders).values({
    id: orderId,
    organizationId: quote.organizationId,
    customerId: quote.customerId,
    quotationId: quote.id,
    orderNumber,
    status: "CONFIRMED",
    startAt: quote.startAt,
    endAt: quote.endAt,
    returnDueAt: quote.endAt,
    subtotal: quote.subtotal,
    discountAmount: quote.discountAmount,
    taxAmount: quote.taxAmount,
    securityDepositAmount: quote.securityDepositAmount,
    totalAmount: quote.totalAmount,
    paidAmount: 0,
    outstandingAmount: quote.totalAmount,
    currency: "INR",
  });

  for (const qline of lines) {
    const orderLineId = `rol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(schema.rentalOrderLines).values({
      id: orderLineId,
      rentalOrderId: orderId,
      productId: qline.productId,
      productVariantId: qline.productVariantId,
      productNameSnapshot: qline.productNameSnapshot,
      skuSnapshot: qline.skuSnapshot,
      quantity: qline.quantity,
      fulfilledQuantity: 0,
      returnedQuantity: 0,
      unitPrice: qline.unitPrice,
      subtotal: qline.subtotal,
      taxAmount: qline.taxAmount,
      securityDepositAmount: qline.securityDepositAmount,
      totalAmount: qline.totalAmount,
    });

    const resId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(schema.reservations).values({
      id: resId,
      organizationId: quote.organizationId,
      rentalOrderId: orderId,
      rentalOrderLineId: orderLineId,
      productId: qline.productId,
      productVariantId: qline.productVariantId,
      quantity: qline.quantity,
      startAt: quote.startAt,
      endAt: quote.endAt,
      status: "CONFIRMED",
    });
  }

  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const invoiceNumber = `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  await db.insert(schema.invoices).values({
    id: invoiceId,
    organizationId: quote.organizationId,
    customerId: quote.customerId,
    rentalOrderId: orderId,
    invoiceNumber,
    status: "ISSUED",
    issuedAt: new Date(),
    dueAt: quote.startAt,
    subtotal: quote.subtotal,
    discountAmount: quote.discountAmount,
    taxAmount: quote.taxAmount,
    securityDepositAmount: quote.securityDepositAmount,
    totalAmount: quote.totalAmount,
    paidAmount: 0,
    outstandingAmount: quote.totalAmount,
    currency: "INR",
  });

  await db
    .update(schema.quotations)
    .set({ status: "CONFIRMED", confirmedAt: new Date() })
    .where(eq(schema.quotations.id, quotationId));

  await db.insert(schema.auditLogs).values({
    id: `audit_${Date.now()}`,
    organizationId: quote.organizationId,
    actorUserId: actor.userId,
    action: "QUOTATION_CONFIRMED",
    entityType: "rental_orders",
    entityId: orderId,
    afterJson: JSON.stringify({ orderId, orderNumber, totalAmount: quote.totalAmount }),
  });

  return { orderId, orderNumber, invoiceId, paymentRequired: quote.totalAmount };
}
