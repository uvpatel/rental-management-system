import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { ActorContext } from "@/lib/actor";

export async function markReadyForPickup(orderId: string, actor: ActorContext) {
  const orderRows = await db.select().from(schema.rentalOrders).where(eq(schema.rentalOrders.id, orderId));
  const order = orderRows[0];
  if (!order) throw new Error("Order not found");

  await db
    .update(schema.rentalOrders)
    .set({ status: "READY_FOR_PICKUP", updatedAt: new Date() })
    .where(eq(schema.rentalOrders.id, orderId));

  return { success: true, status: "READY_FOR_PICKUP" };
}

export type RecordPickupInput = {
  orderId: string;
  pickedUpAt?: Date;
  instructions?: string;
  notes?: string;
  items: {
    orderLineId: string;
    quantity: number;
    condition: "EXCELLENT" | "GOOD" | "FAIR";
    notes?: string;
  }[];
};

export async function recordPickup(input: RecordPickupInput, actor: ActorContext) {
  const orderRows = await db.select().from(schema.rentalOrders).where(eq(schema.rentalOrders.id, input.orderId));
  const order = orderRows[0];
  if (!order) throw new Error("Order not found");

  const pickupId = `pk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const documentNumber = `PK-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  await db.insert(schema.pickups).values({
    id: pickupId,
    rentalOrderId: input.orderId,
    documentNumber,
    status: "COMPLETED",
    completedAt: input.pickedUpAt ? new Date(input.pickedUpAt) : new Date(),
    handledByUserId: actor.userId,
    instructions: input.instructions,
    notes: input.notes,
  });

  for (const item of input.items) {
    await db.insert(schema.pickupLines).values({
      id: `pkl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pickupId,
      rentalOrderLineId: item.orderLineId,
      quantity: item.quantity,
      condition: item.condition,
      notes: item.notes,
    });

    const lineRows = await db.select().from(schema.rentalOrderLines).where(eq(schema.rentalOrderLines.id, item.orderLineId));
    const line = lineRows[0];
    if (line) {
      await db
        .update(schema.rentalOrderLines)
        .set({ fulfilledQuantity: (line.fulfilledQuantity || 0) + item.quantity })
        .where(eq(schema.rentalOrderLines.id, item.orderLineId));
    }
  }

  await db
    .update(schema.rentalOrders)
    .set({
      status: "WITH_CUSTOMER",
      pickedUpAt: input.pickedUpAt ? new Date(input.pickedUpAt) : new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.rentalOrders.id, input.orderId));

  await db.insert(schema.auditLogs).values({
    id: `audit_${Date.now()}`,
    organizationId: order.organizationId,
    actorUserId: actor.userId,
    action: "PICKUP_RECORDED",
    entityType: "rental_orders",
    entityId: input.orderId,
    afterJson: JSON.stringify({ pickupId, documentNumber }),
  });

  return { pickupId, documentNumber, status: "WITH_CUSTOMER" };
}

export type ProcessReturnInput = {
  orderId: string;
  returnedAt?: Date;
  notes?: string;
  items: {
    orderLineId: string;
    returnedQuantity: number;
    condition: "GOOD" | "MINOR_DAMAGE" | "MAJOR_DAMAGE" | "DAMAGED";
    damageCharge?: number;
    notes?: string;
  }[];
};

export async function processReturn(input: ProcessReturnInput, actor: ActorContext) {
  const orderRows = await db.select().from(schema.rentalOrders).where(eq(schema.rentalOrders.id, input.orderId));
  const order = orderRows[0];
  if (!order) throw new Error("Order not found");

  const returnTime = input.returnedAt ? new Date(input.returnedAt) : new Date();
  const dueTime = order.returnDueAt || order.endAt;

  let lateFeeAmount = 0;
  const gracePeriodMs = 1 * 3600 * 1000;
  if (returnTime.getTime() > dueTime.getTime() + gracePeriodMs) {
    const overdueMs = returnTime.getTime() - dueTime.getTime();
    const overdueDays = Math.ceil(overdueMs / (24 * 3600 * 1000));
    lateFeeAmount = Math.round((order.subtotal * 0.1 * overdueDays));
  }

  let totalDamageCharge = 0;
  const returnId = `ret_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const documentNumber = `RET-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  for (const item of input.items) {
    const damageCharge = item.damageCharge || 0;
    totalDamageCharge += damageCharge;

    const lineRows = await db.select().from(schema.rentalOrderLines).where(eq(schema.rentalOrderLines.id, item.orderLineId));
    const line = lineRows[0];

    await db.insert(schema.returnLines).values({
      id: `retl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      returnId,
      rentalOrderLineId: item.orderLineId,
      expectedQuantity: line?.quantity || item.returnedQuantity,
      returnedQuantity: item.returnedQuantity,
      condition: item.condition,
      damageChargeAmount: damageCharge,
      notes: item.notes,
    });

    if (line) {
      await db
        .update(schema.rentalOrderLines)
        .set({
          returnedQuantity: (line.returnedQuantity || 0) + item.returnedQuantity,
          damageChargeAmount: (line.damageChargeAmount || 0) + damageCharge,
        })
        .where(eq(schema.rentalOrderLines.id, item.orderLineId));
    }
  }

  await db.insert(schema.returns).values({
    id: returnId,
    rentalOrderId: input.orderId,
    documentNumber,
    status: "COMPLETED",
    expectedAt: dueTime,
    receivedAt: returnTime,
    inspectedAt: new Date(),
    handledByUserId: actor.userId,
    lateFeeAmount,
    damageChargeAmount: totalDamageCharge,
    notes: input.notes,
  });

  await db
    .update(schema.reservations)
    .set({ status: "RELEASED", updatedAt: new Date() })
    .where(eq(schema.reservations.rentalOrderId, input.orderId));

  const newTotal = order.totalAmount + lateFeeAmount + totalDamageCharge;
  const newOutstanding = Math.max(0, newTotal - order.paidAmount);

  await db
    .update(schema.rentalOrders)
    .set({
      status: "COMPLETED",
      returnedAt: returnTime,
      lateFeeAmount,
      damageChargeAmount: totalDamageCharge,
      totalAmount: newTotal,
      outstandingAmount: newOutstanding,
      updatedAt: new Date(),
    })
    .where(eq(schema.rentalOrders.id, input.orderId));

  const invRows = await db.select().from(schema.invoices).where(eq(schema.invoices.rentalOrderId, input.orderId));
  const inv = invRows[0];
  if (inv) {
    const invTotal = inv.totalAmount + lateFeeAmount + totalDamageCharge;
    const invOutstanding = Math.max(0, invTotal - inv.paidAmount);
    await db
      .update(schema.invoices)
      .set({
        lateFeeAmount,
        damageChargeAmount: totalDamageCharge,
        totalAmount: invTotal,
        outstandingAmount: invOutstanding,
        status: invOutstanding === 0 ? "PAID" : "PARTIALLY_PAID",
        updatedAt: new Date(),
      })
      .where(eq(schema.invoices.id, inv.id));
  }

  await db.insert(schema.auditLogs).values({
    id: `audit_${Date.now()}`,
    organizationId: order.organizationId,
    actorUserId: actor.userId,
    action: "RETURN_PROCESSED",
    entityType: "rental_orders",
    entityId: input.orderId,
    afterJson: JSON.stringify({ returnId, documentNumber, lateFeeAmount, damageChargeAmount: totalDamageCharge }),
  });

  return {
    returnId,
    documentNumber,
    lateFeeAmount,
    damageChargeAmount: totalDamageCharge,
    newTotal,
    newOutstanding,
    status: "COMPLETED",
  };
}
