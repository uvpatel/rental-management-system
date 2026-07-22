import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const settings = await db.select().from(schema.settingsTable);
    if (settings.length === 0) {
      return NextResponse.json({
        id: 'system-settings-default',
        companyName: 'Odoo Rental Hub India Pvt Ltd',
        gstin: '24AAACO1234M1Z5',
        taxRate: '18',
        currency: 'INR',
        hourlyPeriodEnabled: true,
        dailyPeriodEnabled: true,
        weeklyPeriodEnabled: true,
        autoLateFeePerDay: '500'
      });
    }
    return NextResponse.json(settings[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existing = await db.select().from(schema.settingsTable);

    const updateData = {
      id: 'system-settings-default',
      companyName: body.companyName || 'Odoo Rental Hub India Pvt Ltd',
      gstin: body.gstin || '24AAACO1234M1Z5',
      taxRate: (body.taxRate || 18).toString(),
      currency: body.currency || 'INR',
      hourlyPeriodEnabled: body.hourlyPeriodEnabled !== undefined ? body.hourlyPeriodEnabled : true,
      dailyPeriodEnabled: body.dailyPeriodEnabled !== undefined ? body.dailyPeriodEnabled : true,
      weeklyPeriodEnabled: body.weeklyPeriodEnabled !== undefined ? body.weeklyPeriodEnabled : true,
      autoLateFeePerDay: (body.autoLateFeePerDay || 500).toString(),
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await db.update(schema.settingsTable).set(updateData).where(eq(schema.settingsTable.id, 'system-settings-default'));
    } else {
      await db.insert(schema.settingsTable).values(updateData);
    }

    return NextResponse.json(updateData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
