import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";
import { verifyPayment } from "@/server/services/billingService";

export async function POST(req: NextRequest) {
  const actor = await getActorContext();
  if (!actor) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const result = await verifyPayment(body, actor);
    return NextResponse.json({ data: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "PAYMENT_VERIFICATION_FAILED", message: err.message || "Payment verification failed" } },
      { status: 400 }
    );
  }
}
