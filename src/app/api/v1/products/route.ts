import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, ilike, gte, lte, sql } from "drizzle-orm";
import { getActorContext } from "@/lib/actor";
import { checkAvailability } from "@/server/services/availabilityService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const categoryId = searchParams.get("categoryId");
  const startAtParam = searchParams.get("startAt");
  const endAtParam = searchParams.get("endAt");

  const conditions = [
    eq(schema.products.isPublished, true),
    eq(schema.products.isRentable, true),
  ];

  if (search) {
    conditions.push(ilike(schema.products.name, `%${search}%`));
  }

  if (categoryId && categoryId !== "all") {
    conditions.push(eq(schema.products.categoryId, categoryId));
  }

  const prodList = await db.select().from(schema.products).where(and(...conditions));

  // Attach images and pricing
  const result = [];
  for (const prod of prodList) {
    const images = await db
      .select()
      .from(schema.productImages)
      .where(eq(schema.productImages.productId, prod.id));

    const rules = await db
      .select()
      .from(schema.pricingRules)
      .where(eq(schema.pricingRules.productId, prod.id));

    let available = true;
    let availableQuantity = prod.quantityOnHand;

    if (startAtParam && endAtParam) {
      const avail = await checkAvailability(new Date(startAtParam), new Date(endAtParam), [
        { productId: prod.id, requestedQuantity: 1 },
      ]);
      available = avail.available;
      if (avail.items[0]) {
        availableQuantity = avail.items[0].availableQuantity;
      }
    }

    result.push({
      ...prod,
      images,
      pricingRules: rules,
      available,
      availableQuantity,
    });
  }

  return NextResponse.json({
    data: result,
    meta: { count: result.length, timestamp: new Date().toISOString() },
  });
}

export async function POST(req: NextRequest) {
  const actor = await getActorContext();
  if (!actor || (actor.role !== "VENDOR" && actor.role !== "ADMIN")) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only vendors or admins can create products" } },
      { status: 403 }
    );
  }

  const body = await req.json();
  const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  await db.insert(schema.products).values({
    id: productId,
    organizationId: actor.organizationId || "org_apex",
    categoryId: body.categoryId || null,
    name: body.name,
    slug,
    description: body.description,
    sku: body.sku || `SKU-${Date.now()}`,
    isRentable: true,
    isPublished: body.isPublished ?? true,
    quantityOnHand: Number(body.quantityOnHand || 1),
    costPrice: Number(body.costPrice || 0),
    salesPrice: Number(body.salesPrice || 0),
    securityDeposit: Number(body.securityDeposit || 0),
    taxRateId: "tax_gst18",
  });

  if (body.imageUrl) {
    await db.insert(schema.productImages).values({
      id: `img_${productId}`,
      productId,
      url: body.imageUrl,
      altText: body.name,
      sortOrder: 0,
    });
  }

  // Daily pricing rule
  await db.insert(schema.pricingRules).values({
    id: `price_${productId}`,
    organizationId: actor.organizationId || "org_apex",
    productId,
    unit: "DAY",
    unitCount: 1,
    price: Number(body.dailyPrice || 250000),
    priority: 1,
    isActive: true,
  });

  return NextResponse.json({ data: { productId, name: body.name, slug } }, { status: 201 });
}
