import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, and } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const vendorId = searchParams.get('vendorId');
    const paymentStatus = searchParams.get('paymentStatus');

    let conditions = [];
    if (customerId) conditions.push(eq(schema.invoicesTable.customerId, customerId));
    if (vendorId) conditions.push(eq(schema.invoicesTable.vendorId, vendorId));
    if (paymentStatus) conditions.push(eq(schema.invoicesTable.paymentStatus, paymentStatus));

    const invoices = conditions.length > 0
      ? await db.select().from(schema.invoicesTable).where(and(...conditions))
      : await db.select().from(schema.invoicesTable);

    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `inv_${Date.now()}`;
    const invoiceNumber = body.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice = {
      id,
      orderId: body.orderId,
      invoiceNumber,
      customerId: body.customerId || 'usr-cust-1',
      customerName: body.customerName || 'Customer',
      customerEmail: body.customerEmail || 'customer@odoorental.com',
      companyName: body.companyName || '',
      gstin: body.gstin || '',
      vendorId: body.vendorId || 'usr-vendor-1',
      issueDate: new Date(body.issueDate || Date.now()),
      dueDate: new Date(body.dueDate || Date.now() + 5 * 86400000),
      subtotal: (body.subtotal || 0).toString(),
      taxAmount: (body.taxAmount || 0).toString(),
      securityDeposit: (body.securityDeposit || 0).toString(),
      discountAmount: (body.discountAmount || 0).toString(),
      totalAmount: (body.totalAmount || 0).toString(),
      amountPaid: (body.amountPaid || 0).toString(),
      paymentStatus: body.paymentStatus || 'unpaid',
      notes: body.notes || '',
    };

    await db.insert(schema.invoicesTable).values(newInvoice);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
