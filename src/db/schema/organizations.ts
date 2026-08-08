import { pgTable, text, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  legalName: text("legal_name"),
  gstin: text("gstin"),
  email: text("email"),
  phone: text("phone"),
  addressJson: text("address_json"), // JSON string
  currency: text("currency").default("INR").notNull(),
  timezone: text("timezone").default("Asia/Kolkata").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userMemberships = pgTable("user_memberships", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // ADMIN | VENDOR | CUSTOMER
  status: text("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customerProfiles = pgTable("customer_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  gstin: text("gstin"),
  phone: text("phone"),
  addressJson: text("address_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
