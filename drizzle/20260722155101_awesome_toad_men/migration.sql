CREATE TABLE "coupons" (
	"id" text PRIMARY KEY,
	"code" varchar(50) NOT NULL UNIQUE,
	"discount_percent" numeric DEFAULT '10' NOT NULL,
	"max_discount" numeric DEFAULT '2000' NOT NULL,
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY,
	"order_id" text NOT NULL,
	"invoice_number" varchar(100) NOT NULL UNIQUE,
	"customer_id" text NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"gstin" varchar(100),
	"vendor_id" text NOT NULL,
	"issue_date" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"subtotal" numeric DEFAULT '0' NOT NULL,
	"tax_amount" numeric DEFAULT '0' NOT NULL,
	"security_deposit" numeric DEFAULT '0' NOT NULL,
	"discount_amount" numeric DEFAULT '0' NOT NULL,
	"total_amount" numeric DEFAULT '0' NOT NULL,
	"amount_paid" numeric DEFAULT '0' NOT NULL,
	"payment_status" varchar(50) DEFAULT 'unpaid' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pickup_documents" (
	"id" text PRIMARY KEY,
	"order_id" text NOT NULL,
	"pickup_date" timestamp NOT NULL,
	"picked_up_by" varchar(255) NOT NULL,
	"notes" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"vendor_id" text NOT NULL,
	"vendor_name" varchar(255) NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"rentable" boolean DEFAULT true NOT NULL,
	"quantity_on_hand" integer DEFAULT 1 NOT NULL,
	"cost_price" numeric DEFAULT '0' NOT NULL,
	"hourly_rate" numeric DEFAULT '0' NOT NULL,
	"daily_rate" numeric DEFAULT '0' NOT NULL,
	"weekly_rate" numeric DEFAULT '0' NOT NULL,
	"security_deposit_amount" numeric DEFAULT '0' NOT NULL,
	"image_url" text,
	"attributes" jsonb DEFAULT '[]',
	"variants" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rental_orders" (
	"id" text PRIMARY KEY,
	"customer_id" text NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(50),
	"company_name" varchar(255),
	"gstin" varchar(100),
	"vendor_id" text NOT NULL,
	"vendor_name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"duration_days" integer DEFAULT 1 NOT NULL,
	"duration_hours" integer DEFAULT 24 NOT NULL,
	"subtotal" numeric DEFAULT '0' NOT NULL,
	"security_deposit" numeric DEFAULT '0' NOT NULL,
	"tax_rate" numeric DEFAULT '18' NOT NULL,
	"tax_amount" numeric DEFAULT '0' NOT NULL,
	"discount_amount" numeric DEFAULT '0' NOT NULL,
	"coupon_code" varchar(50),
	"total_amount" numeric DEFAULT '0' NOT NULL,
	"notes" text,
	"items" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "return_documents" (
	"id" text PRIMARY KEY,
	"order_id" text NOT NULL,
	"return_date" timestamp NOT NULL,
	"returned_by" varchar(255) NOT NULL,
	"condition" varchar(50) DEFAULT 'good' NOT NULL,
	"damage_fee" numeric DEFAULT '0' NOT NULL,
	"late_fee" numeric DEFAULT '0' NOT NULL,
	"notes" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" text PRIMARY KEY,
	"company_name" varchar(255) NOT NULL,
	"gstin" varchar(100) NOT NULL,
	"tax_rate" numeric DEFAULT '18' NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"hourly_period_enabled" boolean DEFAULT true NOT NULL,
	"daily_period_enabled" boolean DEFAULT true NOT NULL,
	"weekly_period_enabled" boolean DEFAULT true NOT NULL,
	"auto_late_fee_per_day" numeric DEFAULT '500' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "clerk_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "company_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gstin" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "age";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_key" UNIQUE("clerk_id");