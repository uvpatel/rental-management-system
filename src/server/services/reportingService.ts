import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, sql, gte, lte, and } from "drizzle-orm";

export async function getReportSummary(organizationId?: string, from?: Date, to?: Date) {
  const orgId = organizationId || "org_apex";

  // Total Revenue (from Captured Payments)
  const revenueRes = await db
    .select({ total: sql<number>`COALESCE(SUM(${schema.payments.amount}), 0)` })
    .from(schema.payments)
    .where(and(eq(schema.payments.organizationId, orgId), eq(schema.payments.status, "CAPTURED")));

  const totalRevenue = Number(revenueRes[0]?.total || 0);

  // Outstanding Amount
  const outstandingRes = await db
    .select({ total: sql<number>`COALESCE(SUM(${schema.rentalOrders.outstandingAmount}), 0)` })
    .from(schema.rentalOrders)
    .where(eq(schema.rentalOrders.organizationId, orgId));

  const outstandingAmount = Number(outstandingRes[0]?.total || 0);

  // Active Rentals (WITH_CUSTOMER or CONFIRMED or READY_FOR_PICKUP)
  const activeRes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.rentalOrders)
    .where(
      and(
        eq(schema.rentalOrders.organizationId, orgId),
        sql`${schema.rentalOrders.status} IN ('WITH_CUSTOMER', 'CONFIRMED', 'READY_FOR_PICKUP')`
      )
    );

  const activeRentals = Number(activeRes[0]?.count || 0);

  // Overdue Rentals
  const now = new Date();
  const overdueRes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.rentalOrders)
    .where(
      and(
        eq(schema.rentalOrders.organizationId, orgId),
        eq(schema.rentalOrders.status, "WITH_CUSTOMER"),
        lte(schema.rentalOrders.endAt, now)
      )
    );

  const overdueRentals = Number(overdueRes[0]?.count || 0);

  // Utilization Rate calculation
  const totalStockRes = await db
    .select({ total: sql<number>`COALESCE(SUM(${schema.products.quantityOnHand}), 0)` })
    .from(schema.products)
    .where(eq(schema.products.organizationId, orgId));

  const totalStock = Number(totalStockRes[0]?.total || 1);
  const utilizationRate = Math.min(100, Math.round((activeRentals / totalStock) * 100));

  // Average Order Value
  const orderCountRes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.rentalOrders)
    .where(eq(schema.rentalOrders.organizationId, orgId));

  const totalOrders = Number(orderCountRes[0]?.count || 1);
  const averageOrderValue = Math.round(totalRevenue / Math.max(1, totalOrders));

  return {
    totalRevenue,
    outstandingAmount,
    activeRentals,
    overdueRentals,
    utilizationRate,
    averageOrderValue,
  };
}

export async function getRevenueSeries(organizationId?: string) {
  const orgId = organizationId || "org_apex";

  // Last 6 months dummy/real chart data
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const baseSeries = [1200000, 1850000, 2400000, 3100000, 2900000, 4200000];

  const actualPayments = await db
    .select({
      amount: schema.payments.amount,
      paidAt: schema.payments.paidAt,
    })
    .from(schema.payments)
    .where(eq(schema.payments.organizationId, orgId));

  let currentMonthRev = 0;
  actualPayments.forEach((p) => {
    currentMonthRev += p.amount;
  });

  if (currentMonthRev > 0) {
    baseSeries[5] = currentMonthRev;
  }

  return months.map((month, idx) => ({
    date: month,
    revenue: Math.round(baseSeries[idx] / 100), // in Rupees
  }));
}

export async function getTopProducts(organizationId?: string) {
  const orgId = organizationId || "org_apex";

  const top = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      sku: schema.products.sku,
      quantityOnHand: schema.products.quantityOnHand,
      totalRevenue: sql<number>`COALESCE(SUM(${schema.rentalOrderLines.totalAmount}), 0)`,
      rentalsCount: sql<number>`COUNT(${schema.rentalOrderLines.id})`,
    })
    .from(schema.products)
    .leftJoin(schema.rentalOrderLines, eq(schema.products.id, schema.rentalOrderLines.productId))
    .where(eq(schema.products.organizationId, orgId))
    .groupBy(schema.products.id, schema.products.name, schema.products.sku, schema.products.quantityOnHand)
    .limit(5);

  return top.map((p) => ({
    ...p,
    totalRevenueRupees: Math.round(Number(p.totalRevenue) / 100),
    rentalsCount: Number(p.rentalsCount),
  }));
}
