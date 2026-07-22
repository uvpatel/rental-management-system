import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const pickups = await db.select().from(schema.pickupDocumentsTable);
    return NextResponse.json(pickups);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `PU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPickup = {
      id,
      orderId: body.orderId,
      pickupDate: new Date(body.pickupDate || Date.now()),
      pickedUpBy: body.pickedUpBy || 'Customer / Agent',
      notes: body.notes || '',
      status: body.status || 'completed',
    };

    await db.insert(schema.pickupDocumentsTable).values(newPickup);

    // Update order status to 'picked_up'
    if (body.orderId) {
      await db
        .update(schema.rentalOrdersTable)
        .set({ status: 'picked_up' })
        .where(eq(schema.rentalOrdersTable.id, body.orderId));
    }

    return NextResponse.json(newPickup, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
