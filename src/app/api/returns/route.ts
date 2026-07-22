import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const returns = await db.select().from(schema.returnDocumentsTable);
    return NextResponse.json(returns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `RET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const returnDate = new Date(body.returnDate || Date.now());
    const damageFee = Number(body.damageFee || 0);
    let lateFee = Number(body.lateFee || 0);

    // Calculate auto late fee if order end date was surpassed
    if (body.orderId && lateFee === 0) {
      const order = await db.select().from(schema.rentalOrdersTable).where(eq(schema.rentalOrdersTable.id, body.orderId));
      if (order.length > 0) {
        const expectedEnd = new Date(order[0].endDate);
        if (returnDate > expectedEnd) {
          const diffHours = Math.ceil((returnDate.getTime() - expectedEnd.getTime()) / (1000 * 3600));
          const lateDays = Math.ceil(diffHours / 24);
          lateFee = lateDays * 500; // Rs. 500 per late day
        }
      }
    }

    const newReturn = {
      id,
      orderId: body.orderId,
      returnDate,
      returnedBy: body.returnedBy || 'Customer / Agent',
      condition: body.condition || 'good',
      damageFee: damageFee.toString(),
      lateFee: lateFee.toString(),
      notes: body.notes || '',
      status: body.status || 'completed',
    };

    await db.insert(schema.returnDocumentsTable).values(newReturn);

    // Update order status to 'returned'
    if (body.orderId) {
      const order = await db.select().from(schema.rentalOrdersTable).where(eq(schema.rentalOrdersTable.id, body.orderId));
      await db
        .update(schema.rentalOrdersTable)
        .set({ status: 'returned' })
        .where(eq(schema.rentalOrdersTable.id, body.orderId));

      // Restore quantity on hand for products in order
      if (order.length > 0 && order[0].items) {
        const items = (order[0].items as any[]) || [];
        for (const item of items) {
          if (item.productId) {
            const p = await db.select().from(schema.productsTable).where(eq(schema.productsTable.id, item.productId));
            if (p.length > 0) {
              const restoredQty = p[0].quantityOnHand + Number(item.quantity || 1);
              await db
                .update(schema.productsTable)
                .set({ quantityOnHand: restoredQty })
                .where(eq(schema.productsTable.id, item.productId));
            }
          }
        }
      }
    }

    return NextResponse.json(newReturn, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
