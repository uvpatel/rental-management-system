import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const actor = await getActorContext();
  if (!actor) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const { orderId } = await params;
  const orderRows = await db.select().from(schema.rentalOrders).where(eq(schema.rentalOrders.id, orderId));
  const order = orderRows[0];

  if (!order) {
    return NextResponse.json(
      { error: { code: "RESOURCE_NOT_FOUND", message: "Order not found" } },
      { status: 404 }
    );
  }

  if (actor.role === "CUSTOMER" && order.customerId !== actor.userId) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Cannot view another customer's order" } },
      { status: 403 }
    );
  }

  const lines = await db
    .select()
    .from(schema.rentalOrderLines)
    .where(eq(schema.rentalOrderLines.rentalOrderId, order.id));

  const invoiceRows = await db.select().from(schema.invoices).where(eq(schema.invoices.rentalOrderId, order.id));
  const invoice = invoiceRows[0];

  const pickupRows = await db.select().from(schema.pickups).where(eq(schema.pickups.rentalOrderId, order.id));
  const pickup = pickupRows[0];

  const returnRows = await db.select().from(schema.returns).where(eq(schema.returns.rentalOrderId, order.id));
  const returnDoc = returnRows[0];

  return NextResponse.json({
    data: {
      ...order,
      lines,
      invoice,
      pickup,
      returnDoc,
    },
  });
}
