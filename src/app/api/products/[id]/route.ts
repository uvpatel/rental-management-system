import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await db.select().from(schema.productsTable).where(eq(schema.productsTable.id, id));

    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.rentable !== undefined) updateData.rentable = body.rentable;
    if (body.quantityOnHand !== undefined) updateData.quantityOnHand = Number(body.quantityOnHand);
    if (body.hourlyRate !== undefined) updateData.hourlyRate = body.hourlyRate.toString();
    if (body.dailyRate !== undefined) updateData.dailyRate = body.dailyRate.toString();
    if (body.weeklyRate !== undefined) updateData.weeklyRate = body.weeklyRate.toString();
    if (body.securityDepositAmount !== undefined) updateData.securityDepositAmount = body.securityDepositAmount.toString();
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.attributes !== undefined) updateData.attributes = body.attributes;
    if (body.variants !== undefined) updateData.variants = body.variants;

    await db.update(schema.productsTable).set(updateData).where(eq(schema.productsTable.id, id));
    const updated = await db.select().from(schema.productsTable).where(eq(schema.productsTable.id, id));

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(schema.productsTable).where(eq(schema.productsTable.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
