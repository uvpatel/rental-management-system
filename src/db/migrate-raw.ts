import "dotenv/config";
import { sql } from "./index";

async function migrate() {
  console.log("🛠️ Running DDL migration...");

  const queries = [
    `CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified BOOLEAN DEFAULT FALSE NOT NULL,
      image TEXT,
      role TEXT DEFAULT 'user' NOT NULL,
      banned BOOLEAN DEFAULT FALSE,
      ban_reason TEXT,
      ban_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "session" (
      id TEXT PRIMARY KEY,
      expires_at TIMESTAMP NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "account" (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      access_token_expires_at TIMESTAMP,
      refresh_token_expires_at TIMESTAMP,
      scope TEXT,
      password TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "verification" (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "organizations" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      legal_name TEXT,
      gstin TEXT,
      email TEXT,
      phone TEXT,
      address_json TEXT,
      currency TEXT DEFAULT 'INR' NOT NULL,
      timezone TEXT DEFAULT 'Asia/Kolkata' NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "user_memberships" (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      organization_id TEXT REFERENCES "organizations"(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE' NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "customer_profiles" (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
      company_name TEXT,
      gstin TEXT,
      phone TEXT,
      address_json TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "categories" (
      id TEXT PRIMARY KEY,
      organization_id TEXT REFERENCES "organizations"(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      parent_id TEXT,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "tax_rates" (
      id TEXT PRIMARY KEY,
      organization_id TEXT REFERENCES "organizations"(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      rate_percent INT NOT NULL,
      code TEXT DEFAULT 'GST_18' NOT NULL,
      is_default BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "products" (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES "organizations"(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES "categories"(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      sku TEXT,
      is_rentable BOOLEAN DEFAULT TRUE NOT NULL,
      is_published BOOLEAN DEFAULT TRUE NOT NULL,
      quantity_on_hand INT DEFAULT 1 NOT NULL,
      cost_price INT DEFAULT 0 NOT NULL,
      sales_price INT DEFAULT 0 NOT NULL,
      security_deposit INT DEFAULT 0 NOT NULL,
      tax_rate_id TEXT REFERENCES "tax_rates"(id),
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "product_images" (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES "products"(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt_text TEXT,
      sort_order INT DEFAULT 0 NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "attributes" (
      id TEXT PRIMARY KEY,
      organization_id TEXT REFERENCES "organizations"(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      code TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "attribute_values" (
      id TEXT PRIMARY KEY,
      attribute_id TEXT NOT NULL REFERENCES "attributes"(id) ON DELETE CASCADE,
      value TEXT NOT NULL,
      sort_order INT DEFAULT 0 NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "product_variants" (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES "products"(id) ON DELETE CASCADE,
      sku TEXT NOT NULL,
      quantity_on_hand INT DEFAULT 1 NOT NULL,
      security_deposit INT DEFAULT 0 NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "product_variant_values" (
      id TEXT PRIMARY KEY,
      product_variant_id TEXT NOT NULL REFERENCES "product_variants"(id) ON DELETE CASCADE,
      attribute_value_id TEXT NOT NULL REFERENCES "attribute_values"(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "pricing_rules" (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES "organizations"(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES "products"(id) ON DELETE CASCADE,
      product_variant_id TEXT REFERENCES "product_variants"(id) ON DELETE CASCADE,
      unit TEXT NOT NULL,
      unit_count INT DEFAULT 1 NOT NULL,
      price INT NOT NULL,
      minimum_units INT DEFAULT 1 NOT NULL,
      maximum_units INT,
      starts_at TIMESTAMP,
      ends_at TIMESTAMP,
      priority INT DEFAULT 0 NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "quotations" (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES "organizations"(id) ON DELETE CASCADE,
      customer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      quotation_number TEXT NOT NULL,
      status TEXT DEFAULT 'DRAFT' NOT NULL,
      start_at TIMESTAMP NOT NULL,
      end_at TIMESTAMP NOT NULL,
      fulfilment_method TEXT DEFAULT 'PICKUP' NOT NULL,
      billing_address_json TEXT,
      delivery_address_json TEXT,
      coupon_id TEXT,
      coupon_code TEXT,
      subtotal INT DEFAULT 0 NOT NULL,
      discount_amount INT DEFAULT 0 NOT NULL,
      tax_amount INT DEFAULT 0 NOT NULL,
      security_deposit_amount INT DEFAULT 0 NOT NULL,
      total_amount INT DEFAULT 0 NOT NULL,
      currency TEXT DEFAULT 'INR' NOT NULL,
      expires_at TIMESTAMP,
      sent_at TIMESTAMP,
      confirmed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "quotation_lines" (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL REFERENCES "quotations"(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES "products"(id),
      product_variant_id TEXT REFERENCES "product_variants"(id),
      product_name_snapshot TEXT NOT NULL,
      sku_snapshot TEXT,
      description_snapshot TEXT,
      quantity INT DEFAULT 1 NOT NULL,
      start_at TIMESTAMP NOT NULL,
      end_at TIMESTAMP NOT NULL,
      pricing_unit TEXT DEFAULT 'DAY' NOT NULL,
      duration_units INT DEFAULT 1 NOT NULL,
      unit_price INT NOT NULL,
      subtotal INT NOT NULL,
      discount_amount INT DEFAULT 0 NOT NULL,
      tax_rate_snapshot INT DEFAULT 18 NOT NULL,
      tax_amount INT DEFAULT 0 NOT NULL,
      security_deposit_amount INT DEFAULT 0 NOT NULL,
      total_amount INT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "rental_orders" (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES "organizations"(id) ON DELETE CASCADE,
      customer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      quotation_id TEXT REFERENCES "quotations"(id),
      order_number TEXT NOT NULL,
      status TEXT DEFAULT 'CONFIRMED' NOT NULL,
      start_at TIMESTAMP NOT NULL,
      end_at TIMESTAMP NOT NULL,
      return_due_at TIMESTAMP,
      picked_up_at TIMESTAMP,
      returned_at TIMESTAMP,
      subtotal INT DEFAULT 0 NOT NULL,
      discount_amount INT DEFAULT 0 NOT NULL,
      tax_amount INT DEFAULT 0 NOT NULL,
      security_deposit_amount INT DEFAULT 0 NOT NULL,
      late_fee_amount INT DEFAULT 0 NOT NULL,
      damage_charge_amount INT DEFAULT 0 NOT NULL,
      total_amount INT DEFAULT 0 NOT NULL,
      paid_amount INT DEFAULT 0 NOT NULL,
      outstanding_amount INT DEFAULT 0 NOT NULL,
      currency TEXT DEFAULT 'INR' NOT NULL,
      cancellation_reason TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "rental_order_lines" (
      id TEXT PRIMARY KEY,
      rental_order_id TEXT NOT NULL REFERENCES "rental_orders"(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES "products"(id),
      product_variant_id TEXT REFERENCES "product_variants"(id),
      product_name_snapshot TEXT NOT NULL,
      sku_snapshot TEXT,
      quantity INT NOT NULL,
      fulfilled_quantity INT DEFAULT 0 NOT NULL,
      returned_quantity INT DEFAULT 0 NOT NULL,
      unit_price INT NOT NULL,
      subtotal INT NOT NULL,
      tax_amount INT DEFAULT 0 NOT NULL,
      security_deposit_amount INT DEFAULT 0 NOT NULL,
      late_fee_amount INT DEFAULT 0 NOT NULL,
      damage_charge_amount INT DEFAULT 0 NOT NULL,
      total_amount INT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "reservations" (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES "organizations"(id) ON DELETE CASCADE,
      rental_order_id TEXT NOT NULL REFERENCES "rental_orders"(id) ON DELETE CASCADE,
      rental_order_line_id TEXT NOT NULL REFERENCES "rental_order_lines"(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES "products"(id),
      product_variant_id TEXT REFERENCES "product_variants"(id),
      quantity INT NOT NULL,
      start_at TIMESTAMP NOT NULL,
      end_at TIMESTAMP NOT NULL,
      status TEXT DEFAULT 'CONFIRMED' NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "pickups" (
      id TEXT PRIMARY KEY,
      rental_order_id TEXT NOT NULL REFERENCES "rental_orders"(id) ON DELETE CASCADE,
      document_number TEXT NOT NULL,
      status TEXT DEFAULT 'COMPLETED' NOT NULL,
      scheduled_at TIMESTAMP,
      completed_at TIMESTAMP DEFAULT NOW() NOT NULL,
      handled_by_user_id TEXT REFERENCES "user"(id),
      instructions TEXT,
      customer_signature_url TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "pickup_lines" (
      id TEXT PRIMARY KEY,
      pickup_id TEXT NOT NULL REFERENCES "pickups"(id) ON DELETE CASCADE,
      rental_order_line_id TEXT NOT NULL REFERENCES "rental_order_lines"(id),
      quantity INT NOT NULL,
      condition TEXT DEFAULT 'GOOD' NOT NULL,
      notes TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS "returns" (
      id TEXT PRIMARY KEY,
      rental_order_id TEXT NOT NULL REFERENCES "rental_orders"(id) ON DELETE CASCADE,
      document_number TEXT NOT NULL,
      status TEXT DEFAULT 'COMPLETED' NOT NULL,
      expected_at TIMESTAMP NOT NULL,
      received_at TIMESTAMP DEFAULT NOW() NOT NULL,
      inspected_at TIMESTAMP DEFAULT NOW() NOT NULL,
      handled_by_user_id TEXT REFERENCES "user"(id),
      late_fee_amount INT DEFAULT 0 NOT NULL,
      damage_charge_amount INT DEFAULT 0 NOT NULL,
      deposit_refund_amount INT DEFAULT 0 NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "return_lines" (
      id TEXT PRIMARY KEY,
      return_id TEXT NOT NULL REFERENCES "returns"(id) ON DELETE CASCADE,
      rental_order_line_id TEXT NOT NULL REFERENCES "rental_order_lines"(id),
      expected_quantity INT NOT NULL,
      returned_quantity INT NOT NULL,
      condition TEXT DEFAULT 'GOOD' NOT NULL,
      damage_charge_amount INT DEFAULT 0 NOT NULL,
      notes TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS "invoices" (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES "organizations"(id) ON DELETE CASCADE,
      customer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      rental_order_id TEXT REFERENCES "rental_orders"(id),
      invoice_number TEXT NOT NULL,
      status TEXT DEFAULT 'DRAFT' NOT NULL,
      issued_at TIMESTAMP,
      due_at TIMESTAMP,
      subtotal INT DEFAULT 0 NOT NULL,
      discount_amount INT DEFAULT 0 NOT NULL,
      tax_amount INT DEFAULT 0 NOT NULL,
      security_deposit_amount INT DEFAULT 0 NOT NULL,
      late_fee_amount INT DEFAULT 0 NOT NULL,
      damage_charge_amount INT DEFAULT 0 NOT NULL,
      total_amount INT DEFAULT 0 NOT NULL,
      paid_amount INT DEFAULT 0 NOT NULL,
      outstanding_amount INT DEFAULT 0 NOT NULL,
      currency TEXT DEFAULT 'INR' NOT NULL,
      supplier_snapshot_json TEXT,
      customer_snapshot_json TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "invoice_lines" (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES "invoices"(id) ON DELETE CASCADE,
      type TEXT DEFAULT 'RENTAL' NOT NULL,
      description TEXT NOT NULL,
      quantity INT DEFAULT 1 NOT NULL,
      unit_price INT NOT NULL,
      tax_rate INT DEFAULT 18 NOT NULL,
      tax_amount INT DEFAULT 0 NOT NULL,
      line_total INT NOT NULL,
      rental_order_line_id TEXT REFERENCES "rental_order_lines"(id)
    );`,
    `CREATE TABLE IF NOT EXISTS "payments" (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES "organizations"(id) ON DELETE CASCADE,
      customer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      gateway TEXT DEFAULT 'RAZORPAY' NOT NULL,
      gateway_order_id TEXT,
      gateway_payment_id TEXT,
      gateway_signature TEXT,
      status TEXT DEFAULT 'CREATED' NOT NULL,
      amount INT NOT NULL,
      refunded_amount INT DEFAULT 0 NOT NULL,
      currency TEXT DEFAULT 'INR' NOT NULL,
      purpose TEXT DEFAULT 'RENTAL_FULL' NOT NULL,
      idempotency_key TEXT,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "payment_allocations" (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL REFERENCES "payments"(id) ON DELETE CASCADE,
      invoice_id TEXT NOT NULL REFERENCES "invoices"(id) ON DELETE CASCADE,
      amount INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "webhook_events" (
      id TEXT PRIMARY KEY,
      provider TEXT DEFAULT 'RAZORPAY' NOT NULL,
      external_event_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT DEFAULT 'PROCESSED' NOT NULL,
      processed_at TIMESTAMP DEFAULT NOW() NOT NULL,
      error TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "coupons" (
      id TEXT PRIMARY KEY,
      organization_id TEXT REFERENCES "organizations"(id) ON DELETE CASCADE,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT DEFAULT 'PERCENTAGE' NOT NULL,
      discount_value INT NOT NULL,
      min_order_amount INT DEFAULT 0 NOT NULL,
      max_discount_amount INT,
      usage_limit INT,
      usage_count INT DEFAULT 0 NOT NULL,
      starts_at TIMESTAMP,
      expires_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "late_fee_policies" (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES "organizations"(id) ON DELETE CASCADE,
      name TEXT DEFAULT 'Standard Late Fee' NOT NULL,
      grace_period_hours INT DEFAULT 1 NOT NULL,
      fee_type TEXT DEFAULT 'DAILY_PERCENTAGE' NOT NULL,
      fee_value INT DEFAULT 10 NOT NULL,
      max_fee_cap_amount INT,
      is_active BOOLEAN DEFAULT TRUE NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "audit_logs" (
      id TEXT PRIMARY KEY,
      organization_id TEXT REFERENCES "organizations"(id),
      actor_user_id TEXT REFERENCES "user"(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      before_json TEXT,
      after_json TEXT,
      ip_address TEXT,
      user_agent TEXT,
      request_id TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`
  ];

  for (const q of queries) {
    // @ts-ignore
    await sql.query(q);
  }

  console.log("✅ Raw DDL Migration completed successfully!");
}

migrate()
  .catch((e) => {
    console.error("❌ Migration error:", e);
    process.exit(1);
  })
  .then(() => process.exit(0));
