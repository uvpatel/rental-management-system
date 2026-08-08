import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { checkAvailability } from "@/server/services/availabilityService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  const prodRows = await db.select().from(schema.products).where(or(eq(schema.products.id, productId), eq(schema.products.slug, productId)));
  const prod = prodRows[0];

  if (!prod) {
    return NextResponse.json(
      { error: { code: "RESOURCE_NOT_FOUND", message: "Product not found" } },
      { status: 404 }
    );
  }

  const images = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, prod.id));

  const pricingRules = await db
    .select()
    .from(schema.pricingRules)
    .where(eq(schema.pricingRules.productId, prod.id));

  const variants = await db
    .select()
    .from(schema.productVariants)
    .where(eq(schema.productVariants.productId, prod.id));

  const { searchParams } = new URL(req.url);
  const startAtParam = searchParams.get("startAt");
  const endAtParam = searchParams.get("endAt");

  let availability = { available: true, availableQuantity: prod.quantityOnHand };
  if (startAtParam && endAtParam) {
    const res = await checkAvailability(new Date(startAtParam), new Date(endAtParam), [
      { productId: prod.id, requestedQuantity: 1 },
    ]);
    if (res.items[0]) {
      availability = { available: res.available, availableQuantity: res.items[0].availableQuantity };
    }
  }

  return NextResponse.json({
    data: {
      ...prod,
      images,
      pricingRules,
      variants,
      availability,
    },
  });
}
