import { db, schema } from '@/db';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_PICKUPS,
  INITIAL_RETURNS,
  INITIAL_INVOICES,
  INITIAL_SETTINGS,
  INITIAL_COUPONS
} from '@/lib/mock-data';

function safeDate(val?: string | null): Date {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function seed() {
  console.log('Seeding initial data into Neon PostgreSQL database...');

  // Seed Users
  for (const u of INITIAL_USERS) {
    await db.insert(schema.usersTable).values({
      id: u.id,
      clerkId: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      companyName: u.companyName || '',
      gstin: u.gstin || '',
      phone: u.phone || '',
      avatar: u.avatar || '',
      createdAt: safeDate(u.createdAt)
    }).onConflictDoNothing();
  }

  // Seed Products
  for (const p of INITIAL_PRODUCTS) {
    await db.insert(schema.productsTable).values({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      description: p.description,
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      published: p.published,
      rentable: p.rentable,
      quantityOnHand: p.quantityOnHand,
      costPrice: (p.costPrice || 0).toString(),
      hourlyRate: (p.hourlyRate || 0).toString(),
      dailyRate: (p.dailyRate || 0).toString(),
      weeklyRate: (p.weeklyRate || 0).toString(),
      securityDepositAmount: (p.securityDepositAmount || 0).toString(),
      imageUrl: p.imageUrl,
      attributes: p.attributes as any,
      variants: p.variants as any,
      createdAt: safeDate(p.createdAt)
    }).onConflictDoNothing();
  }

  // Seed Orders
  for (const o of INITIAL_ORDERS) {
    await db.insert(schema.rentalOrdersTable).values({
      id: o.id,
      customerId: o.customerId,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone || '',
      companyName: o.companyName || '',
      gstin: o.gstin || '',
      vendorId: o.vendorId,
      vendorName: o.vendorName,
      status: o.status,
      startDate: safeDate(o.startDate),
      endDate: safeDate(o.endDate),
      durationDays: o.durationDays,
      durationHours: o.durationHours,
      subtotal: (o.subtotal || 0).toString(),
      securityDeposit: (o.securityDeposit || 0).toString(),
      taxRate: (o.taxRate || 18).toString(),
      taxAmount: (o.taxAmount || 0).toString(),
      discountAmount: (o.discountAmount || 0).toString(),
      couponCode: o.couponCode || '',
      totalAmount: (o.totalAmount || 0).toString(),
      notes: o.notes || '',
      items: o.items as any,
      createdAt: safeDate(o.createdAt)
    }).onConflictDoNothing();
  }

  // Seed Pickups
  for (const pk of INITIAL_PICKUPS) {
    const rawPk = pk as any;
    await db.insert(schema.pickupDocumentsTable).values({
      id: pk.id,
      orderId: pk.orderId,
      pickupDate: safeDate(rawPk.pickupDate || pk.scheduledPickupDate),
      pickedUpBy: rawPk.pickedUpBy || pk.verifiedBy || 'Customer / Agent',
      notes: rawPk.notes || pk.vendorNotes || '',
      status: pk.status === 'completed' ? 'completed' : 'pending',
      createdAt: safeDate(pk.createdAt)
    }).onConflictDoNothing();
  }

  // Seed Returns
  for (const rt of INITIAL_RETURNS) {
    const rawRt = rt as any;
    await db.insert(schema.returnDocumentsTable).values({
      id: rt.id,
      orderId: rt.orderId,
      returnDate: safeDate(rawRt.returnDate || rt.scheduledReturnDate),
      returnedBy: rawRt.returnedBy || 'Customer / Agent',
      condition: (rt.condition as any) || 'good',
      damageFee: (rt.damageFeeAmount || 0).toString(),
      lateFee: (rt.lateFeeAmount || 0).toString(),
      notes: rawRt.notes || '',
      status: rt.status === 'returned' ? 'completed' : 'pending',
      createdAt: safeDate(rt.createdAt)
    }).onConflictDoNothing();
  }

  // Seed Invoices
  for (const inv of INITIAL_INVOICES) {
    const rawInv = inv as any;
    await db.insert(schema.invoicesTable).values({
      id: inv.id,
      orderId: inv.orderId,
      invoiceNumber: rawInv.invoiceNumber || inv.id,
      customerId: inv.customerId,
      customerName: inv.customerName,
      customerEmail: rawInv.customerEmail || 'customer@odoorental.com',
      companyName: inv.companyName || '',
      gstin: inv.gstin || '',
      vendorId: rawInv.vendorId || 'usr-vendor-1',
      issueDate: safeDate(inv.createdAt),
      dueDate: safeDate(inv.createdAt),
      subtotal: (inv.subtotal || 0).toString(),
      taxAmount: (inv.taxAmount || 0).toString(),
      securityDeposit: (inv.securityDeposit || 0).toString(),
      discountAmount: (inv.discountAmount || 0).toString(),
      totalAmount: (inv.totalAmount || 0).toString(),
      amountPaid: (inv.paidAmount || 0).toString(),
      paymentStatus: inv.paymentStatus === 'paid' ? 'paid' : inv.paymentStatus === 'partial' ? 'partially_paid' : 'unpaid',
      notes: inv.notes || '',
      createdAt: safeDate(inv.createdAt)
    }).onConflictDoNothing();
  }

  // Seed Settings
  await db.insert(schema.settingsTable).values({
    id: 'system-settings-default',
    companyName: INITIAL_SETTINGS.companyName,
    gstin: INITIAL_SETTINGS.gstin,
    taxRate: INITIAL_SETTINGS.gstPercentage.toString(),
    currency: 'INR',
    hourlyPeriodEnabled: INITIAL_SETTINGS.enabledPeriods.includes('hourly'),
    dailyPeriodEnabled: INITIAL_SETTINGS.enabledPeriods.includes('daily'),
    weeklyPeriodEnabled: INITIAL_SETTINGS.enabledPeriods.includes('weekly'),
    autoLateFeePerDay: '500'
  }).onConflictDoNothing();

  // Seed Coupons
  for (let idx = 0; idx < INITIAL_COUPONS.length; idx++) {
    const c = INITIAL_COUPONS[idx];
    await db.insert(schema.couponsTable).values({
      id: c.id || `cpn-${c.code.toLowerCase()}-${idx}`,
      code: c.code,
      discountPercent: (c.discountPercent || 10).toString(),
      maxDiscount: (c.maxDiscount || 2000).toString(),
      validUntil: c.validUntil ? safeDate(c.validUntil) : null,
      isActive: c.isActive
    }).onConflictDoNothing();
  }

  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Error seeding DB:', err);
  process.exit(1);
});
