import "dotenv/config";
import { db } from "./index";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";

async function seed() {
  console.log("🌱 Starting database seeding...");

  // 1. Create Organization
  const orgId = "org_apex";
  await db.insert(schema.organizations).values({
    id: orgId,
    name: "Apex Rental Solutions",
    slug: "apex-rentals",
    legalName: "Apex Rental Private Limited",
    gstin: "24ABCDE1234F1Z5",
    email: "contact@apexrentals.com",
    phone: "+91 98765 43210",
    addressJson: JSON.stringify({
      street: "101 Commercial Hub, S.G. Highway",
      city: "Ahmedabad",
      state: "Gujarat",
      zip: "380054",
      country: "India",
    }),
    currency: "INR",
    timezone: "Asia/Kolkata",
    isActive: true,
  }).onConflictDoNothing();

  // 2. Create Users via Better Auth API
  const adminEmail = "admin@rental.local";
  const vendorEmail = "vendor@rental.local";
  const customerEmail = "customer@rental.local";

  let adminUserRows = await db.select().from(schema.user).where(eq(schema.user.email, adminEmail));
  let adminUser = adminUserRows[0];

  if (!adminUser) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: "Admin@123",
          name: "System Admin",
        },
      });
      if (res?.user) {
        adminUser = res.user as any;
        await db.update(schema.user).set({ role: "admin" }).where(eq(schema.user.id, res.user.id));
      }
    } catch (e) {
      console.log("Admin note:", e);
    }
  }

  let vendorUserRows = await db.select().from(schema.user).where(eq(schema.user.email, vendorEmail));
  let vendorUser = vendorUserRows[0];

  if (!vendorUser) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: vendorEmail,
          password: "Vendor@123",
          name: "Apex Ops Vendor",
        },
      });
      if (res?.user) {
        vendorUser = res.user as any;
        await db.update(schema.user).set({ role: "vendor" }).where(eq(schema.user.id, res.user.id));
      }
    } catch (e) {
      console.log("Vendor note:", e);
    }
  }

  let customerUserRows = await db.select().from(schema.user).where(eq(schema.user.email, customerEmail));
  let customerUser = customerUserRows[0];

  if (!customerUser) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: customerEmail,
          password: "Customer@123",
          name: "Rajesh Kumar",
        },
      });
      if (res?.user) {
        customerUser = res.user as any;
        await db.update(schema.user).set({ role: "user" }).where(eq(schema.user.id, res.user.id));
      }
    } catch (e) {
      console.log("Customer note:", e);
    }
  }

  // Re-fetch users
  adminUser = (await db.select().from(schema.user).where(eq(schema.user.email, adminEmail)))[0];
  vendorUser = (await db.select().from(schema.user).where(eq(schema.user.email, vendorEmail)))[0];
  customerUser = (await db.select().from(schema.user).where(eq(schema.user.email, customerEmail)))[0];

  if (adminUser) {
    await db.insert(schema.userMemberships).values({
      id: "mem_admin",
      userId: adminUser.id,
      organizationId: orgId,
      role: "ADMIN",
    }).onConflictDoNothing();
  }

  if (vendorUser) {
    await db.insert(schema.userMemberships).values({
      id: "mem_vendor",
      userId: vendorUser.id,
      organizationId: orgId,
      role: "VENDOR",
    }).onConflictDoNothing();
  }

  if (customerUser) {
    await db.insert(schema.customerProfiles).values({
      id: "prof_customer",
      userId: customerUser.id,
      companyName: "Kinetix Media Ltd",
      gstin: "24AAACK1234F2Z8",
      phone: "+91 99887 76655",
      addressJson: JSON.stringify({
        street: "45 Film City Road",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400065",
      }),
    }).onConflictDoNothing();
  }

  // 3. Tax Rates & Policies
  const taxId = "tax_gst18";
  await db.insert(schema.taxRates).values({
    id: taxId,
    organizationId: orgId,
    name: "GST 18%",
    ratePercent: 18,
    code: "GST_18",
    isDefault: true,
  }).onConflictDoNothing();

  await db.insert(schema.lateFeePolicies).values({
    id: "late_policy_std",
    organizationId: orgId,
    name: "Standard 10% Daily Late Fee",
    gracePeriodHours: 1,
    feeType: "DAILY_PERCENTAGE",
    feeValue: 10,
    isActive: true,
  }).onConflictDoNothing();

  await db.insert(schema.coupons).values([
    {
      id: "coup_welcome",
      organizationId: orgId,
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 100000,
      maxDiscountAmount: 500000,
      isActive: true,
    },
    {
      id: "coup_hackathon",
      organizationId: orgId,
      code: "HACKATHON20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderAmount: 200000,
      isActive: true,
    },
  ]).onConflictDoNothing();

  // 4. Categories
  const catCameras = "cat_cameras";
  const catAudio = "cat_audio";
  const catFurniture = "cat_furniture";
  const catTools = "cat_tools";

  await db.insert(schema.categories).values([
    { id: catCameras, organizationId: orgId, name: "Cameras & Cinema", slug: "cameras-cinema" },
    { id: catAudio, organizationId: orgId, name: "Audio & Microphones", slug: "audio-mics" },
    { id: catFurniture, organizationId: orgId, name: "Event Furniture & Staging", slug: "furniture-staging" },
    { id: catTools, organizationId: orgId, name: "Power & Heavy Tools", slug: "power-tools" },
  ]).onConflictDoNothing();

  // 5. Products & Pricing Rules
  const productsData = [
    {
      id: "prod_canon_r5",
      organizationId: orgId,
      categoryId: catCameras,
      name: "Canon EOS R5 Mark II Cinema Kit",
      slug: "canon-eos-r5-mark-ii",
      description: "Full-frame mirrorless camera kit including 24-70mm f/2.8 L lens, 3x CFexpress cards, dual batteries, and waterproof hard case.",
      sku: "CAM-CANON-R5M2",
      isRentable: true,
      isPublished: true,
      quantityOnHand: 2,
      costPrice: 28000000,
      salesPrice: 35000000,
      securityDeposit: 1000000,
      taxRateId: taxId,
      dailyPrice: 250000,
      weeklyPrice: 1400000,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "prod_red_vraptor",
      organizationId: orgId,
      categoryId: catCameras,
      name: "RED V-Raptor 8K VV Cinema System",
      slug: "red-v-raptor-8k-vv",
      description: "8K Large Format sensor cinema camera package with V-Lock batteries, Production Monitor, and Cine Lenses.",
      sku: "CAM-RED-VRAPTOR",
      isRentable: true,
      isPublished: true,
      quantityOnHand: 1,
      costPrice: 180000000,
      salesPrice: 220000000,
      securityDeposit: 3000000,
      taxRateId: taxId,
      dailyPrice: 850000,
      weeklyPrice: 4800000,
      imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "prod_sennheiser_mic",
      organizationId: orgId,
      categoryId: catAudio,
      name: "Sennheiser EW-DP Wireless Lavalier Set",
      slug: "sennheiser-ew-dp-lavalier",
      description: "Digital UHF wireless microphone system with omnidirectional lav mic, camera mount receiver, and rechargeable battery packs.",
      sku: "AUD-SENN-EWDP",
      isRentable: true,
      isPublished: true,
      quantityOnHand: 5,
      costPrice: 4500000,
      salesPrice: 6000000,
      securityDeposit: 200000,
      taxRateId: taxId,
      dailyPrice: 80000,
      weeklyPrice: 450000,
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "prod_jbl_sound",
      organizationId: orgId,
      categoryId: catAudio,
      name: "JBL PRX800 Powered Line Array PA Package",
      slug: "jbl-prx800-pa-package",
      description: "2000W active PA system with dual 18-inch subwoofers, 2 top speakers, 16-channel digital mixer, and cable trunk.",
      sku: "AUD-JBL-PRX800",
      isRentable: true,
      isPublished: true,
      quantityOnHand: 2,
      costPrice: 25000000,
      salesPrice: 32000000,
      securityDeposit: 1500000,
      taxRateId: taxId,
      dailyPrice: 450000,
      weeklyPrice: 2400000,
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "prod_dji_ronin4d",
      organizationId: orgId,
      categoryId: catCameras,
      name: "DJI Ronin 4D 6K Cinema Combo",
      slug: "dji-ronin-4d-6k",
      description: "4-Axis stabilized cinema camera system with LiDAR focusing, wireless video transmitter, and master handles.",
      sku: "CAM-DJI-RONIN4D",
      isRentable: true,
      isPublished: true,
      quantityOnHand: 3,
      costPrice: 65000000,
      salesPrice: 80000000,
      securityDeposit: 1200000,
      taxRateId: taxId,
      dailyPrice: 350000,
      weeklyPrice: 2000000,
      imageUrl: "https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "prod_generator_10kw",
      organizationId: orgId,
      categoryId: catTools,
      name: "Industrial Silent 10kW Diesel Generator",
      slug: "industrial-10kw-generator",
      description: "Heavy-duty soundproof diesel generator with electric start, dual 230V outlets, and ATS connection capability.",
      sku: "TL-GEN-10KW",
      isRentable: true,
      isPublished: true,
      quantityOnHand: 4,
      costPrice: 12000000,
      salesPrice: 15000000,
      securityDeposit: 500000,
      taxRateId: taxId,
      dailyPrice: 200000,
      weeklyPrice: 1100000,
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    },
  ];

  for (const item of productsData) {
    const { dailyPrice, weeklyPrice, imageUrl, ...prod } = item;
    await db.insert(schema.products).values(prod).onConflictDoNothing();

    await db.insert(schema.productImages).values({
      id: `img_${prod.id}`,
      productId: prod.id,
      url: imageUrl,
      altText: prod.name,
      sortOrder: 0,
    }).onConflictDoNothing();

    await db.insert(schema.pricingRules).values([
      {
        id: `price_day_${prod.id}`,
        organizationId: orgId,
        productId: prod.id,
        unit: "DAY",
        unitCount: 1,
        price: dailyPrice,
        priority: 1,
        isActive: true,
      },
      {
        id: `price_week_${prod.id}`,
        organizationId: orgId,
        productId: prod.id,
        unit: "WEEK",
        unitCount: 1,
        price: weeklyPrice,
        priority: 2,
        isActive: true,
      },
    ]).onConflictDoNothing();
  }

  // 6. Create Demo Orders, Invoices, Payments, Pickups, and Returns if customer exists
  if (customerUser) {
    const now = new Date();

    // Order 1: Active WITH_CUSTOMER
    const order1Id = "ro_demo_active_01";
    const start1 = new Date(now.getTime() - 1 * 24 * 3600 * 1000);
    const end1 = new Date(now.getTime() + 2 * 24 * 3600 * 1000);

    await db.insert(schema.rentalOrders).values({
      id: order1Id,
      organizationId: orgId,
      customerId: customerUser.id,
      orderNumber: "RO-2026-000101",
      status: "WITH_CUSTOMER",
      startAt: start1,
      endAt: end1,
      returnDueAt: end1,
      pickedUpAt: start1,
      subtotal: 500000,
      discountAmount: 50000,
      taxAmount: 81000,
      securityDepositAmount: 1000000,
      totalAmount: 1531000,
      paidAmount: 1531000,
      outstandingAmount: 0,
      currency: "INR",
    }).onConflictDoNothing();

    await db.insert(schema.rentalOrderLines).values({
      id: "rol_demo_01",
      rentalOrderId: order1Id,
      productId: "prod_canon_r5",
      productNameSnapshot: "Canon EOS R5 Mark II Cinema Kit",
      skuSnapshot: "CAM-CANON-R5M2",
      quantity: 1,
      fulfilledQuantity: 1,
      returnedQuantity: 0,
      unitPrice: 250000,
      subtotal: 500000,
      taxAmount: 81000,
      securityDepositAmount: 1000000,
      totalAmount: 1531000,
    }).onConflictDoNothing();

    await db.insert(schema.reservations).values({
      id: "res_demo_01",
      organizationId: orgId,
      rentalOrderId: order1Id,
      rentalOrderLineId: "rol_demo_01",
      productId: "prod_canon_r5",
      quantity: 1,
      startAt: start1,
      endAt: end1,
      status: "ACTIVE",
    }).onConflictDoNothing();

    await db.insert(schema.pickups).values({
      id: "pk_demo_01",
      rentalOrderId: order1Id,
      documentNumber: "PK-2026-000101",
      status: "COMPLETED",
      completedAt: start1,
      notes: "Equipment handed over in excellent condition with battery fully charged.",
    }).onConflictDoNothing();

    // Order 2: Completed / Returned
    const order2Id = "ro_demo_completed_02";
    const start2 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const end2 = new Date(now.getTime() - 5 * 24 * 3600 * 1000);

    await db.insert(schema.rentalOrders).values({
      id: order2Id,
      organizationId: orgId,
      customerId: customerUser.id,
      orderNumber: "RO-2026-000100",
      status: "COMPLETED",
      startAt: start2,
      endAt: end2,
      returnDueAt: end2,
      pickedUpAt: start2,
      returnedAt: end2,
      subtotal: 900000,
      discountAmount: 0,
      taxAmount: 162000,
      securityDepositAmount: 1500000,
      totalAmount: 2562000,
      paidAmount: 2562000,
      outstandingAmount: 0,
      currency: "INR",
    }).onConflictDoNothing();

    await db.insert(schema.rentalOrderLines).values({
      id: "rol_demo_02",
      rentalOrderId: order2Id,
      productId: "prod_jbl_sound",
      productNameSnapshot: "JBL PRX800 Powered Line Array PA Package",
      skuSnapshot: "AUD-JBL-PRX800",
      quantity: 1,
      fulfilledQuantity: 1,
      returnedQuantity: 1,
      unitPrice: 450000,
      subtotal: 900000,
      taxAmount: 162000,
      securityDepositAmount: 1500000,
      totalAmount: 2562000,
    }).onConflictDoNothing();

    // Invoice & Payment for Order 1
    const inv1Id = "inv_demo_01";
    await db.insert(schema.invoices).values({
      id: inv1Id,
      organizationId: orgId,
      customerId: customerUser.id,
      rentalOrderId: order1Id,
      invoiceNumber: "INV-2026-000101",
      status: "PAID",
      issuedAt: start1,
      subtotal: 500000,
      discountAmount: 50000,
      taxAmount: 81000,
      securityDepositAmount: 1000000,
      totalAmount: 1531000,
      paidAmount: 1531000,
      outstandingAmount: 0,
    }).onConflictDoNothing();

    const pay1Id = "pay_demo_01";
    await db.insert(schema.payments).values({
      id: pay1Id,
      organizationId: orgId,
      customerId: customerUser.id,
      gateway: "RAZORPAY",
      gatewayOrderId: "order_rzp_demo101",
      gatewayPaymentId: "pay_rzp_demo101",
      status: "CAPTURED",
      amount: 1531000,
      purpose: "RENTAL_FULL",
      paidAt: start1,
    }).onConflictDoNothing();

    await db.insert(schema.paymentAllocations).values({
      id: "pa_demo_01",
      paymentId: pay1Id,
      invoiceId: inv1Id,
      amount: 1531000,
    }).onConflictDoNothing();
  }

  console.log("✅ Seeding completed successfully!");
}

seed()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
