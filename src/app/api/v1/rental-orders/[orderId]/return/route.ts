import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";
import { processReturn } from "@/server/services/orderService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const actor = await getActorContext();
  if (!actor || (actor.role !== "VENDOR" && actor.role !== "ADMIN")) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Vendor or Admin access required" } },
      { status: 403 }
    );
  }

  const { orderId } = await params;
  try {
    const body = await req.json();
    const result = await processReturn({ ...body, orderId }, actor);
    return NextResponse.json({ data: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: err.message || "Failed to process return" } },
      { status: 422 }
    );
  }
}
