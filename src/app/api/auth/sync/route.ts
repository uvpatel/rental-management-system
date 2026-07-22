import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, clerkId, name, email, role, companyName, gstin, phone, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const userId = id || clerkId || `usr_${Date.now()}`;
    const existing = await db.select().from(schema.usersTable).where(eq(schema.usersTable.email, email));

    if (existing.length > 0) {
      // Update user details if needed
      await db
        .update(schema.usersTable)
        .set({
          name: name || existing[0].name,
          role: role || existing[0].role,
          companyName: companyName || existing[0].companyName,
          gstin: gstin || existing[0].gstin,
          phone: phone || existing[0].phone,
          avatar: avatar || existing[0].avatar,
        })
        .where(eq(schema.usersTable.id, existing[0].id));

      const updated = await db.select().from(schema.usersTable).where(eq(schema.usersTable.id, existing[0].id));
      return NextResponse.json(updated[0]);
    } else {
      // Insert new user
      const newUser = {
        id: userId,
        clerkId: clerkId || userId,
        name: name || 'User',
        email,
        role: role || 'customer',
        companyName: companyName || '',
        gstin: gstin || '',
        phone: phone || '',
        avatar: avatar || '',
      };
      await db.insert(schema.usersTable).values(newUser);
      return NextResponse.json(newUser);
    }
  } catch (error: any) {
    console.error('Error in /api/auth/sync:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
