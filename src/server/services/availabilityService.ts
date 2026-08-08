import { db } from "@/db";
import { reservations, products, productVariants } from "@/db/schema";
import { eq, and, lt, gt, inArray, sql } from "drizzle-orm";

export type AvailabilityCheckItem = {
  productId: string;
  productVariantId?: string;
  requestedQuantity: number;
};

export type AvailabilityCheckResult = {
  available: boolean;
  items: {
    productId: string;
    productVariantId?: string;
    productName: string;
    requestedQuantity: number;
    availableQuantity: number;
    available: boolean;
  }[];
};

export async function checkAvailability(
  startAt: Date,
  endAt: Date,
  items: AvailabilityCheckItem[]
): Promise<AvailabilityCheckResult> {
  const itemResults = [];
  let allAvailable = true;

  for (const item of items) {
    const prodRows = await db.select().from(products).where(eq(products.id, item.productId));
    const prod = prodRows[0];

    if (!prod) {
      itemResults.push({
        productId: item.productId,
        productVariantId: item.productVariantId,
        productName: "Unknown Product",
        requestedQuantity: item.requestedQuantity,
        availableQuantity: 0,
        available: false,
      });
      allAvailable = false;
      continue;
    }

    let quantityOnHand = prod.quantityOnHand;
    let variantId = item.productVariantId;

    if (variantId) {
      const varRows = await db.select().from(productVariants).where(eq(productVariants.id, variantId));
      const variant = varRows[0];
      if (variant) {
        quantityOnHand = variant.quantityOnHand;
      }
    }

    const blockingStatuses = ["HELD", "CONFIRMED", "ACTIVE"];

    const conditions = [
      eq(reservations.productId, item.productId),
      inArray(reservations.status, blockingStatuses),
      lt(reservations.startAt, endAt),
      gt(reservations.endAt, startAt),
    ];

    if (variantId) {
      conditions.push(eq(reservations.productVariantId, variantId));
    }

    const reservedRows = await db
      .select({
        totalReserved: sql<number>`COALESCE(SUM(${reservations.quantity}), 0)`,
      })
      .from(reservations)
      .where(and(...conditions));

    const totalReserved = Number(reservedRows[0]?.totalReserved || 0);
    const availableQuantity = Math.max(0, quantityOnHand - totalReserved);
    const itemAvailable = availableQuantity >= item.requestedQuantity;

    if (!itemAvailable) {
      allAvailable = false;
    }

    itemResults.push({
      productId: item.productId,
      productVariantId: item.productVariantId,
      productName: prod.name,
      requestedQuantity: item.requestedQuantity,
      availableQuantity,
      available: itemAvailable,
    });
  }

  return {
    available: allAvailable,
    items: itemResults,
  };
}
