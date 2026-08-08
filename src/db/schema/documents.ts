import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { user } from "./auth-schema";
import { products, productVariants } from "./catalog";

export const quotations = pgTable("quotations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  quotationNumber: text("quotation_number").notNull(),
  status: text("status").default("DRAFT").notNull(), // DRAFT | SENT | CONFIRMED | EXPIRED | CANCELLED
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  fulfilmentMethod: text("fulfilment_method").default("PICKUP").notNull(), // PICKUP | DELIVERY
  billingAddressJson: text("billing_address_json"),
  deliveryAddressJson: text("delivery_address_json"),
  couponId: text("coupon_id"),
  couponCode: text("coupon_code"),
  subtotal: integer("subtotal").default(0).notNull(), // paise
  discountAmount: integer("discount_amount").default(0).notNull(),
  taxAmount: integer("tax_amount").default(0).notNull(),
  securityDepositAmount: integer("security_deposit_amount").default(0).notNull(),
  totalAmount: integer("total_amount").default(0).notNull(),
  currency: text("currency").default("INR").notNull(),
  expiresAt: timestamp("expires_at"),
  sentAt: timestamp("sent_at"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("quotations_org_num_idx").on(table.organizationId, table.quotationNumber),
  index("quotations_customer_idx").on(table.customerId),
]);

export const quotationLines = pgTable("quotation_lines", {
  id: text("id").primaryKey(),
  quotationId: text("quotation_id").notNull().references(() => quotations.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id),
  productVariantId: text("product_variant_id").references(() => productVariants.id),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  skuSnapshot: text("sku_snapshot"),
  descriptionSnapshot: text("description_snapshot"),
  quantity: integer("quantity").default(1).notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  pricingUnit: text("pricing_unit").default("DAY").notNull(),
  durationUnits: integer("duration_units").default(1).notNull(),
  unitPrice: integer("unit_price").notNull(), // paise
  subtotal: integer("subtotal").notNull(),
  discountAmount: integer("discount_amount").default(0).notNull(),
  taxRateSnapshot: integer("tax_rate_snapshot").default(18).notNull(), // e.g. 18
  taxAmount: integer("tax_amount").default(0).notNull(),
  securityDepositAmount: integer("security_deposit_amount").default(0).notNull(),
  totalAmount: integer("total_amount").notNull(),
});

export const rentalOrders = pgTable("rental_orders", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  quotationId: text("quotation_id").references(() => quotations.id),
  orderNumber: text("order_number").notNull(),
  status: text("status").default("CONFIRMED").notNull(),
  // CONFIRMED | AWAITING_PAYMENT | PARTIALLY_PAID | PAID | READY_FOR_PICKUP | WITH_CUSTOMER | RETURN_DUE | OVERDUE | RETURNED | COMPLETED | CANCELLED
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  returnDueAt: timestamp("return_due_at"),
  pickedUpAt: timestamp("picked_up_at"),
  returnedAt: timestamp("returned_at"),
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
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("rental_orders_org_num_idx").on(table.organizationId, table.orderNumber),
  index("rental_orders_customer_idx").on(table.customerId),
  index("rental_orders_status_idx").on(table.status),
]);

export const rentalOrderLines = pgTable("rental_order_lines", {
  id: text("id").primaryKey(),
  rentalOrderId: text("rental_order_id").notNull().references(() => rentalOrders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id),
  productVariantId: text("product_variant_id").references(() => productVariants.id),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  skuSnapshot: text("sku_snapshot"),
  quantity: integer("quantity").notNull(),
  fulfilledQuantity: integer("fulfilled_quantity").default(0).notNull(),
  returnedQuantity: integer("returned_quantity").default(0).notNull(),
  unitPrice: integer("unit_price").notNull(),
  subtotal: integer("subtotal").notNull(),
  taxAmount: integer("tax_amount").default(0).notNull(),
  securityDepositAmount: integer("security_deposit_amount").default(0).notNull(),
  lateFeeAmount: integer("late_fee_amount").default(0).notNull(),
  damageChargeAmount: integer("damage_charge_amount").default(0).notNull(),
  totalAmount: integer("total_amount").notNull(),
});

export const reservations = pgTable("reservations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  rentalOrderId: text("rental_order_id").notNull().references(() => rentalOrders.id, { onDelete: "cascade" }),
  rentalOrderLineId: text("rental_order_line_id").notNull().references(() => rentalOrderLines.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id),
  productVariantId: text("product_variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  status: text("status").default("CONFIRMED").notNull(),
  // HELD | CONFIRMED | ACTIVE | RELEASED | EXPIRED | CANCELLED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("reservations_variant_overlap_idx").on(table.productVariantId, table.startAt, table.endAt, table.status),
  index("reservations_product_overlap_idx").on(table.productId, table.startAt, table.endAt, table.status),
]);

export const pickups = pgTable("pickups", {
  id: text("id").primaryKey(),
  rentalOrderId: text("rental_order_id").notNull().references(() => rentalOrders.id, { onDelete: "cascade" }),
  documentNumber: text("document_number").notNull(),
  status: text("status").default("COMPLETED").notNull(), // SCHEDULED | COMPLETED | CANCELLED
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  handledByUserId: text("handled_by_user_id").references(() => user.id),
  instructions: text("instructions"),
  customerSignatureUrl: text("customer_signature_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pickupLines = pgTable("pickup_lines", {
  id: text("id").primaryKey(),
  pickupId: text("pickup_id").notNull().references(() => pickups.id, { onDelete: "cascade" }),
  rentalOrderLineId: text("rental_order_line_id").notNull().references(() => rentalOrderLines.id),
  quantity: integer("quantity").notNull(),
  condition: text("condition").default("GOOD").notNull(), // EXCELLENT | GOOD | FAIR
  notes: text("notes"),
});

export const returns = pgTable("returns", {
  id: text("id").primaryKey(),
  rentalOrderId: text("rental_order_id").notNull().references(() => rentalOrders.id, { onDelete: "cascade" }),
  documentNumber: text("document_number").notNull(),
  status: text("status").default("COMPLETED").notNull(),
  expectedAt: timestamp("expected_at").notNull(),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  inspectedAt: timestamp("inspected_at").defaultNow().notNull(),
  handledByUserId: text("handled_by_user_id").references(() => user.id),
  lateFeeAmount: integer("late_fee_amount").default(0).notNull(),
  damageChargeAmount: integer("damage_charge_amount").default(0).notNull(),
  depositRefundAmount: integer("deposit_refund_amount").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const returnLines = pgTable("return_lines", {
  id: text("id").primaryKey(),
  returnId: text("return_id").notNull().references(() => returns.id, { onDelete: "cascade" }),
  rentalOrderLineId: text("rental_order_line_id").notNull().references(() => rentalOrderLines.id),
  expectedQuantity: integer("expected_quantity").notNull(),
  returnedQuantity: integer("returned_quantity").notNull(),
  condition: text("condition").default("GOOD").notNull(), // GOOD | MINOR_DAMAGE | MAJOR_DAMAGE | DAMAGED
  damageChargeAmount: integer("damage_charge_amount").default(0).notNull(),
  notes: text("notes"),
});
