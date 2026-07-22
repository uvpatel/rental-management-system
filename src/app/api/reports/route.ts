import { NextResponse } from 'next/server';
import { db, schema } from '@/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');

    const allOrders = await db.select().from(schema.rentalOrdersTable);
    const allProducts = await db.select().from(schema.productsTable);
    const allInvoices = await db.select().from(schema.invoicesTable);

    const filteredOrders = vendorId
      ? allOrders.filter((o) => o.vendorId === vendorId)
      : allOrders;

    const filteredInvoices = vendorId
      ? allInvoices.filter((i) => i.vendorId === vendorId)
      : allInvoices;

    // Total Revenue from Paid / Partial Invoices
    const totalRevenue = filteredInvoices.reduce(
      (sum, inv) => sum + Number(inv.amountPaid || 0),
      0
    );

    const totalOrdersCount = filteredOrders.length;
    const activeOrdersCount = filteredOrders.filter(
      (o) => o.status === 'confirmed' || o.status === 'picked_up'
    ).length;

    // Top Rented Products
    const productRentCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const order of filteredOrders) {
      const items = (order.items as any[]) || [];
      for (const item of items) {
        const pid = item.productId || item.productName;
        if (!productRentCounts[pid]) {
          productRentCounts[pid] = {
            name: item.productName || 'Product',
            count: 0,
            revenue: 0,
          };
        }
        productRentCounts[pid].count += Number(item.quantity || 1);
        productRentCounts[pid].revenue += Number(item.subtotal || 0);
      }
    }

    const topRentedProducts = Object.values(productRentCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Vendor Performance
    const vendorStats: Record<string, { vendorName: string; orders: number; revenue: number }> = {};
    for (const order of allOrders) {
      const vid = order.vendorId;
      if (!vendorStats[vid]) {
        vendorStats[vid] = {
          vendorName: order.vendorName || 'Vendor',
          orders: 0,
          revenue: 0,
        };
      }
      vendorStats[vid].orders += 1;
      vendorStats[vid].revenue += Number(order.totalAmount || 0);
    }

    // Monthly Order Trends
    const monthlyTrends: Record<string, { month: string; orders: number; revenue: number }> = {};
    for (const order of filteredOrders) {
      const d = new Date(order.createdAt || Date.now());
      const monthKey = d.toLocaleString('en-US', { month: 'short' });
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = { month: monthKey, orders: 0, revenue: 0 };
      }
      monthlyTrends[monthKey].orders += 1;
      monthlyTrends[monthKey].revenue += Number(order.totalAmount || 0);
    }

    return NextResponse.json({
      totalRevenue,
      totalOrdersCount,
      activeOrdersCount,
      topRentedProducts,
      vendorPerformance: Object.values(vendorStats),
      monthlyTrends: Object.values(monthlyTrends),
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
