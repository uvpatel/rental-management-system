import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";
import { createQuotation } from "@/server/services/quotationService";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const actor = await getActorContext();
  if (!actor) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in required to create quotation" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const result = await createQuotation(body, actor);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: err.message || "Failed to create quotation" } },
      { status: 422 }
    );
  }
}

export async function GET() {
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
      .from(schema.quotations)
      .where(eq(schema.quotations.customerId, actor.userId));
  } else {
    list = await db.select().from(schema.quotations);
  }

  return NextResponse.json({ data: list });
}
