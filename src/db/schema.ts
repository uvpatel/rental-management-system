import { pgTable, text, varchar, integer, boolean, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";

// Users Table
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).notNull().default("customer"), // 'customer' | 'vendor' | 'admin'
  companyName: varchar("company_name", { length: 255 }),
  gstin: varchar("gstin", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products Table
export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  vendorId: text("vendor_id").notNull(),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  published: boolean("published").notNull().default(true),
  rentable: boolean("rentable").notNull().default(true),
  quantityOnHand: integer("quantity_on_hand").notNull().default(1),
  costPrice: numeric("cost_price").notNull().default("0"),
  hourlyRate: numeric("hourly_rate").notNull().default("0"),
  dailyRate: numeric("daily_rate").notNull().default("0"),
  weeklyRate: numeric("weekly_rate").notNull().default("0"),
  securityDepositAmount: numeric("security_deposit_amount").notNull().default("0"),
  imageUrl: text("image_url"),
  attributes: jsonb("attributes").default([]),
  variants: jsonb("variants").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rental Orders & Quotations Table
export const rentalOrdersTable = pgTable("rental_orders", {
  id: text("id").primaryKey(), // e.g. RENT-2026-001
  customerId: text("customer_id").notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  companyName: varchar("company_name", { length: 255 }),
  gstin: varchar("gstin", { length: 100 }),
  vendorId: text("vendor_id").notNull(),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"), // 'draft' | 'sent' | 'confirmed' | 'picked_up' | 'returned' | 'cancelled'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  durationDays: integer("duration_days").notNull().default(1),
  durationHours: integer("duration_hours").notNull().default(24),
  subtotal: numeric("subtotal").notNull().default("0"),
  securityDeposit: numeric("security_deposit").notNull().default("0"),
  taxRate: numeric("tax_rate").notNull().default("18"),
  taxAmount: numeric("tax_amount").notNull().default("0"),
  discountAmount: numeric("discount_amount").notNull().default("0"),
  couponCode: varchar("coupon_code", { length: 50 }),
  totalAmount: numeric("total_amount").notNull().default("0"),
  notes: text("notes"),
  items: jsonb("items").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pickup Documents Table
export const pickupDocumentsTable = pgTable("pickup_documents", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  pickupDate: timestamp("pickup_date").notNull(),
  pickedUpBy: varchar("picked_up_by", { length: 255 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Return Documents Table
export const returnDocumentsTable = pgTable("return_documents", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  returnDate: timestamp("return_date").notNull(),
  returnedBy: varchar("returned_by", { length: 255 }).notNull(),
  condition: varchar("condition", { length: 50 }).notNull().default("good"), // 'good' | 'minor_damage' | 'major_damage' | 'lost'
  damageFee: numeric("damage_fee").notNull().default("0"),
  lateFee: numeric("late_fee").notNull().default("0"),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices Table
export const invoicesTable = pgTable("invoices", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  customerId: text("customer_id").notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  gstin: varchar("gstin", { length: 100 }),
  vendorId: text("vendor_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: numeric("subtotal").notNull().default("0"),
  taxAmount: numeric("tax_amount").notNull().default("0"),
  securityDeposit: numeric("security_deposit").notNull().default("0"),
  discountAmount: numeric("discount_amount").notNull().default("0"),
  totalAmount: numeric("total_amount").notNull().default("0"),
  amountPaid: numeric("amount_paid").notNull().default("0"),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("unpaid"), // 'unpaid' | 'partially_paid' | 'paid'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Settings Table
export const settingsTable = pgTable("system_settings", {
  id: text("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  gstin: varchar("gstin", { length: 100 }).notNull(),
  taxRate: numeric("tax_rate").notNull().default("18"),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  hourlyPeriodEnabled: boolean("hourly_period_enabled").notNull().default(true),
  dailyPeriodEnabled: boolean("daily_period_enabled").notNull().default(true),
  weeklyPeriodEnabled: boolean("weekly_period_enabled").notNull().default(true),
  autoLateFeePerDay: numeric("auto_late_fee_per_day").notNull().default("500"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupons Table
export const couponsTable = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercent: numeric("discount_percent").notNull().default("10"),
  maxDiscount: numeric("max_discount").notNull().default("2000"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
