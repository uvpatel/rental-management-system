import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  parentId: text("parent_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taxRates = pgTable("tax_rates", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  ratePercent: integer("rate_percent").notNull(), // e.g. 18 for 18%
  code: text("code").default("GST_18").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  sku: text("sku"),
  isRentable: boolean("is_rentable").default(true).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  quantityOnHand: integer("quantity_on_hand").default(1).notNull(),
  costPrice: integer("cost_price").default(0).notNull(), // minor units (paise)
  salesPrice: integer("sales_price").default(0).notNull(), // minor units (paise)
  securityDeposit: integer("security_deposit").default(0).notNull(), // minor units
  taxRateId: text("tax_rate_id").references(() => taxRates.id),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("products_org_pub_idx").on(table.organizationId, table.isPublished),
  index("products_slug_idx").on(table.slug),
]);

export const productImages = pgTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const attributes = pgTable("attributes", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  code: text("code").notNull(),
});

export const attributeValues = pgTable("attribute_values", {
  id: text("id").primaryKey(),
  attributeId: text("attribute_id").notNull().references(() => attributes.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  quantityOnHand: integer("quantity_on_hand").default(1).notNull(),
  securityDeposit: integer("security_deposit").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productVariantValues = pgTable("product_variant_values", {
  id: text("id").primaryKey(),
  productVariantId: text("product_variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
  attributeValueId: text("attribute_value_id").notNull().references(() => attributeValues.id, { onDelete: "cascade" }),
});

export const pricingRules = pgTable("pricing_rules", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  productVariantId: text("product_variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
  unit: text("unit").notNull(), // HOUR | DAY | WEEK | CUSTOM
  unitCount: integer("unit_count").default(1).notNull(),
  price: integer("price").notNull(), // in paise (e.g. 150000 = ₹1,500.00)
  minimumUnits: integer("minimum_units").default(1).notNull(),
  maximumUnits: integer("maximum_units"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  priority: integer("priority").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});
