import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, and } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');
    const category = searchParams.get('category');
    const publishedOnly = searchParams.get('publishedOnly') === 'true';

    let conditions = [];
    if (vendorId) conditions.push(eq(schema.productsTable.vendorId, vendorId));
    if (category && category !== 'All') conditions.push(eq(schema.productsTable.category, category));
    if (publishedOnly) conditions.push(eq(schema.productsTable.published, true));

    const products = conditions.length > 0
      ? await db.select().from(schema.productsTable).where(and(...conditions))
      : await db.select().from(schema.productsTable);

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `prod_${Date.now()}`;

    const newProduct = {
      id,
      name: body.name,
      sku: body.sku || `SKU-${Date.now().toString().slice(-4)}`,
      category: body.category || 'General',
      description: body.description || '',
      vendorId: body.vendorId || 'usr-vendor-1',
      vendorName: body.vendorName || 'Apex Motion Gear',
      published: body.published !== undefined ? body.published : true,
      rentable: body.rentable !== undefined ? body.rentable : true,
      quantityOnHand: Number(body.quantityOnHand || 1),
      costPrice: (body.costPrice || 0).toString(),
      hourlyRate: (body.hourlyRate || 0).toString(),
      dailyRate: (body.dailyRate || 0).toString(),
      weeklyRate: (body.weeklyRate || 0).toString(),
      securityDepositAmount: (body.securityDepositAmount || 0).toString(),
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
      attributes: body.attributes || [],
      variants: body.variants || [],
    };

    await db.insert(schema.productsTable).values(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
