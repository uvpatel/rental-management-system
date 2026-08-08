import { NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";

export async function GET() {
  const actor = await getActorContext();
  if (!actor) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  return NextResponse.json({
    data: actor,
    meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString() },
  });
}
