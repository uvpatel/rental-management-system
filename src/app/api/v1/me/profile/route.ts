import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  const actor = await getActorContext();
  if (!actor) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { companyName, gstin, phone } = body;

    const existingRows = await db
      .select()
      .from(schema.customerProfiles)
      .where(eq(schema.customerProfiles.userId, actor.userId));
    const existing = existingRows[0];

    if (existing) {
      await db
        .update(schema.customerProfiles)
        .set({
          companyName: companyName || existing.companyName,
          gstin: gstin || existing.gstin,
          phone: phone || existing.phone,
          updatedAt: new Date(),
        })
        .where(eq(schema.customerProfiles.userId, actor.userId));
    } else {
      await db.insert(schema.customerProfiles).values({
        id: `prof_${Date.now()}`,
        userId: actor.userId,
        companyName: companyName || null,
        gstin: gstin || null,
        phone: phone || null,
      });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: err.message || "Failed to update profile" } },
      { status: 500 }
    );
  }
}
