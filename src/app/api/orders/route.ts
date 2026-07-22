import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, and, or, gte, lte } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const vendorId = searchParams.get('vendorId');
    const status = searchParams.get('status');

    let conditions = [];
    if (customerId) conditions.push(eq(schema.rentalOrdersTable.customerId, customerId));
    if (vendorId) conditions.push(eq(schema.rentalOrdersTable.vendorId, vendorId));
    if (status) conditions.push(eq(schema.rentalOrdersTable.status, status));

    const orders = conditions.length > 0
      ? await db.select().from(schema.rentalOrdersTable).where(and(...conditions))
      : await db.select().from(schema.rentalOrdersTable);

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `RENT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    // Overbooking prevention: Check overlapping confirmed/picked_up orders for items
    if (body.items && body.items.length > 0) {
      const items = body.items;
      const existingOrders = await db
        .select()
        .from(schema.rentalOrdersTable)
        .where(
          and(
            or(
              eq(schema.rentalOrdersTable.status, 'confirmed'),
              eq(schema.rentalOrdersTable.status, 'picked_up')
            ),
            // Overlapping dates: (StartA <= EndB) and (EndA >= StartB)
            lte(schema.rentalOrdersTable.startDate, endDate),
            gte(schema.rentalOrdersTable.endDate, startDate)
          )
        );

      // Verify availability per product
      for (const item of items) {
        const prod = await db.select().from(schema.productsTable).where(eq(schema.productsTable.id, item.productId));
        if (prod.length > 0) {
          const totalStock = prod[0].quantityOnHand;
          let reservedQty = 0;

          for (const exOrder of existingOrders) {
            const exItems = (exOrder.items as any[]) || [];
            const matchingItem = exItems.find((i) => i.productId === item.productId);
            if (matchingItem) {
              reservedQty += Number(matchingItem.quantity || 1);
            }
          }

          if (totalStock - reservedQty < Number(item.quantity || 1)) {
            return NextResponse.json(
              {
                error: `Overbooking prevented: Product '${item.productName}' has only ${
                  totalStock - reservedQty
                } available for the selected dates.`
              },
              { status: 409 }
            );
          }
        }
      }
    }

    const newOrder = {
      id,
      customerId: body.customerId || 'usr-cust-1',
      customerName: body.customerName || 'Customer',
      customerEmail: body.customerEmail || 'customer@example.com',
      customerPhone: body.customerPhone || '',
      companyName: body.companyName || '',
      gstin: body.gstin || '',
      vendorId: body.vendorId || 'usr-vendor-1',
      vendorName: body.vendorName || 'Vendor',
      status: body.status || 'draft',
      startDate,
      endDate,
      durationDays: Number(body.durationDays || 1),
      durationHours: Number(body.durationHours || 24),
      subtotal: (body.subtotal || 0).toString(),
      securityDeposit: (body.securityDeposit || 0).toString(),
      taxRate: (body.taxRate || 18).toString(),
      taxAmount: (body.taxAmount || 0).toString(),
      discountAmount: (body.discountAmount || 0).toString(),
      couponCode: body.couponCode || '',
      totalAmount: (body.totalAmount || 0).toString(),
      notes: body.notes || '',
      items: body.items || [],
    };

    await db.insert(schema.rentalOrdersTable).values(newOrder);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
