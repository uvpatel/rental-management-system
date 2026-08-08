import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { ActorContext } from "@/lib/actor";
import crypto from "crypto";

export async function createGatewayOrder(input: {
  invoiceId: string;
  amount: number;
  purpose?: string;
  idempotencyKey?: string;
}, actor: ActorContext) {
  const invRows = await db.select().from(schema.invoices).where(eq(schema.invoices.id, input.invoiceId));
  const inv = invRows[0];
  if (!inv) throw new Error("Invoice not found");

  const gatewayOrderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key";

  return {
    gateway: "RAZORPAY",
    gatewayOrderId,
    amount: input.amount,
    currency: "INR",
    keyId,
    invoiceId: inv.id,
  };
}

export async function verifyPayment(input: {
  invoiceId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}, actor: ActorContext) {
  const invRows = await db.select().from(schema.invoices).where(eq(schema.invoices.id, input.invoiceId));
  const inv = invRows[0];
  if (!inv) throw new Error("Invoice not found");

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (secret && input.razorpaySignature) {
    const text = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (expectedSignature !== input.razorpaySignature) {
      throw new Error("Payment signature verification failed.");
    }
  }

  const existingPaymentRows = await db.select().from(schema.payments).where(eq(schema.payments.gatewayPaymentId, input.razorpayPaymentId));
  const existingPayment = existingPaymentRows[0];

  if (existingPayment) {
    return { success: true, paymentId: existingPayment.id, invoiceStatus: inv.status };
  }

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payAmount = inv.outstandingAmount;

  await db.insert(schema.payments).values({
    id: paymentId,
    organizationId: inv.organizationId,
    customerId: inv.customerId,
    gateway: "RAZORPAY",
    gatewayOrderId: input.razorpayOrderId,
    gatewayPaymentId: input.razorpayPaymentId,
    gatewaySignature: input.razorpaySignature || "dummy_sig",
    status: "CAPTURED",
    amount: payAmount,
    purpose: "RENTAL_FULL",
    paidAt: new Date(),
  });

  await db.insert(schema.paymentAllocations).values({
    id: `pa_${Date.now()}`,
    paymentId,
    invoiceId: inv.id,
    amount: payAmount,
  });

  const newPaidAmount = inv.paidAmount + payAmount;
  const newOutstanding = Math.max(0, inv.totalAmount - newPaidAmount);
  const newInvoiceStatus = newOutstanding === 0 ? "PAID" : "PARTIALLY_PAID";

  await db
    .update(schema.invoices)
    .set({
      paidAmount: newPaidAmount,
      outstandingAmount: newOutstanding,
      status: newInvoiceStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.invoices.id, inv.id));

  if (inv.rentalOrderId) {
    await db
      .update(schema.rentalOrders)
      .set({
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstanding,
        status: newOutstanding === 0 ? "PAID" : "PARTIALLY_PAID",
        updatedAt: new Date(),
      })
      .where(eq(schema.rentalOrders.id, inv.rentalOrderId));
  }

  return {
    success: true,
    paymentId,
    paidAmount: payAmount,
    outstandingAmount: newOutstanding,
    invoiceStatus: newInvoiceStatus,
  };
}
