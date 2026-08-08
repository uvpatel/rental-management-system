import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const actor = await getActorContext();
  if (!actor) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  let list;
  if (actor.role === "CUSTOMER") {
    list = await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.customerId, actor.userId))
      .orderBy(desc(schema.invoices.createdAt));
  } else {
    list = await db
      .select()
      .from(schema.invoices)
      .orderBy(desc(schema.invoices.createdAt));
  }

  return NextResponse.json({ data: list });
}
