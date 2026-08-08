import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";
import { confirmQuotation } from "@/server/services/quotationService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> }
) {
  const actor = await getActorContext();
  if (!actor) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const { quotationId } = await params;

  try {
    const result = await confirmQuotation(quotationId, actor);
    return NextResponse.json({ data: result });
  } catch (err: any) {
    if (err.code === "RENTAL_PERIOD_UNAVAILABLE") {
      return NextResponse.json(
        { error: { code: "RENTAL_PERIOD_UNAVAILABLE", message: err.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: err.message || "Confirmation failed" } },
      { status: 500 }
    );
  }
}
