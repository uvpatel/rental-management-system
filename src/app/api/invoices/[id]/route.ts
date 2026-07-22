import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inv = await db.select().from(schema.invoicesTable).where(eq(schema.invoicesTable.id, id));

    if (inv.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(inv[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await db.select().from(schema.invoicesTable).where(eq(schema.invoicesTable.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const currentInv = existing[0];
    let newPaid = Number(currentInv.amountPaid || 0);

    if (body.addPayment !== undefined) {
      newPaid += Number(body.addPayment);
    } else if (body.amountPaid !== undefined) {
      newPaid = Number(body.amountPaid);
    }

    const totalAmt = Number(currentInv.totalAmount || 0);
    let newStatus = currentInv.paymentStatus;

    if (newPaid >= totalAmt) {
      newStatus = 'paid';
    } else if (newPaid > 0) {
      newStatus = 'partially_paid';
    }

    const updateData: any = {
      amountPaid: newPaid.toString(),
      paymentStatus: newStatus,
    };
    if (body.notes !== undefined) updateData.notes = body.notes;

    await db.update(schema.invoicesTable).set(updateData).where(eq(schema.invoicesTable.id, id));
    const updated = await db.select().from(schema.invoicesTable).where(eq(schema.invoicesTable.id, id));

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
