import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { user } from "./auth-schema";

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").default("PERCENTAGE").notNull(), // PERCENTAGE | FIXED
  discountValue: integer("discount_value").notNull(), // e.g. 10 for 10% or 50000 for ₹500
  minOrderAmount: integer("min_order_amount").default(0).notNull(),
  maxDiscountAmount: integer("max_discount_amount"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0).notNull(),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lateFeePolicies = pgTable("late_fee_policies", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").default("Standard Late Fee").notNull(),
  gracePeriodHours: integer("grace_period_hours").default(1).notNull(),
  feeType: text("fee_type").default("DAILY_PERCENTAGE").notNull(), // DAILY_PERCENTAGE | HOURLY_FIXED | DAILY_FIXED
  feeValue: integer("fee_value").default(10).notNull(), // e.g. 10% per day late
  maxFeeCapAmount: integer("max_fee_cap_amount"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organizations.id),
  actorUserId: text("actor_user_id").references(() => user.id),
  action: text("action").notNull(), // e.g. QUOTATION_CONFIRMED, PICKUP_RECORDED, RETURN_PROCESSED
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  beforeJson: text("before_json"),
  afterJson: text("after_json"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestId: text("request_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("audit_logs_org_idx").on(table.organizationId),
  index("audit_logs_entity_idx").on(table.entityType, table.entityId),
]);
