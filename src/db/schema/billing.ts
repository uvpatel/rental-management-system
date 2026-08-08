import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { user } from "./auth-schema";
import { rentalOrders, rentalOrderLines } from "./documents";

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  rentalOrderId: text("rental_order_id").references(() => rentalOrders.id),
  invoiceNumber: text("invoice_number").notNull(),
  status: text("status").default("DRAFT").notNull(), // DRAFT | ISSUED | PARTIALLY_PAID | PAID | OVERDUE | VOID
  issuedAt: timestamp("issued_at"),
  dueAt: timestamp("due_at"),
  subtotal: integer("subtotal").default(0).notNull(),
  discountAmount: integer("discount_amount").default(0).notNull(),
  taxAmount: integer("tax_amount").default(0).notNull(),
  securityDepositAmount: integer("security_deposit_amount").default(0).notNull(),
  lateFeeAmount: integer("late_fee_amount").default(0).notNull(),
  damageChargeAmount: integer("damage_charge_amount").default(0).notNull(),
  totalAmount: integer("total_amount").default(0).notNull(),
  paidAmount: integer("paid_amount").default(0).notNull(),
  outstandingAmount: integer("outstanding_amount").default(0).notNull(),
  currency: text("currency").default("INR").notNull(),
  supplierSnapshotJson: text("supplier_snapshot_json"),
  customerSnapshotJson: text("customer_snapshot_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("invoices_org_num_idx").on(table.organizationId, table.invoiceNumber),
  index("invoices_customer_idx").on(table.customerId),
]);

export const invoiceLines = pgTable("invoice_lines", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  type: text("type").default("RENTAL").notNull(), // RENTAL | DEPOSIT | LATE_FEE | DAMAGE_CHARGE | DISCOUNT
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").notNull(),
  taxRate: integer("tax_rate").default(18).notNull(),
  taxAmount: integer("tax_amount").default(0).notNull(),
  lineTotal: integer("line_total").notNull(),
  rentalOrderLineId: text("rental_order_line_id").references(() => rentalOrderLines.id),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  gateway: text("gateway").default("RAZORPAY").notNull(), // RAZORPAY | OFFLINE
  gatewayOrderId: text("gateway_order_id"),
  gatewayPaymentId: text("gateway_payment_id"),
  gatewaySignature: text("gateway_signature"),
  status: text("status").default("CREATED").notNull(), // CREATED | PENDING | AUTHORIZED | CAPTURED | FAILED | REFUNDED
  amount: integer("amount").notNull(), // paise
  refundedAmount: integer("refunded_amount").default(0).notNull(),
  currency: text("currency").default("INR").notNull(),
  purpose: text("purpose").default("RENTAL_FULL").notNull(), // FULL | PARTIAL | DEPOSIT | LATE_FEE
  idempotencyKey: text("idempotency_key"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("payments_idempotency_idx").on(table.idempotencyKey),
]);

export const paymentAllocations = pgTable("payment_allocations", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  provider: text("provider").default("RAZORPAY").notNull(),
  externalEventId: text("external_event_id").notNull(),
  eventType: text("event_type").notNull(),
  payloadJson: text("payload_json").notNull(),
  status: text("status").default("PROCESSED").notNull(), // PROCESSED | FAILED
  processedAt: timestamp("processed_at").defaultNow().notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
