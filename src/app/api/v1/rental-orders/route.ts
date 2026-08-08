import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const actor = await getActorContext();
  if (!actor) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  let orders;
  if (actor.role === "CUSTOMER") {
    orders = await db
      .select()
      .from(schema.rentalOrders)
      .where(eq(schema.rentalOrders.customerId, actor.userId))
      .orderBy(desc(schema.rentalOrders.createdAt));
  } else {
    orders = await db
      .select()
      .from(schema.rentalOrders)
      .orderBy(desc(schema.rentalOrders.createdAt));
  }

  const result = [];
  for (const ord of orders) {
    const lines = await db
      .select()
      .from(schema.rentalOrderLines)
      .where(eq(schema.rentalOrderLines.rentalOrderId, ord.id));

    const userRows = await db.select().from(schema.user).where(eq(schema.user.id, ord.customerId));
    const customerUser = userRows[0];

    result.push({
      ...ord,
      lines,
      customerName: customerUser?.name || "Customer",
      customerEmail: customerUser?.email || "",
    });
  }

  return NextResponse.json({ data: result });
}
