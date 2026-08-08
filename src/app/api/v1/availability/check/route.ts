import { NextRequest, NextResponse } from "next/server";
import { checkAvailability } from "@/server/services/availabilityService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startAt, endAt, items } = body;

    if (!startAt || !endAt || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Missing startAt, endAt, or items array" } },
        { status: 422 }
      );
    }

    const result = await checkAvailability(new Date(startAt), new Date(endAt), items);

    if (!result.available) {
      return NextResponse.json(
        {
          error: {
            code: "RENTAL_PERIOD_UNAVAILABLE",
            message: "One or more items are not available for the selected dates.",
            details: result,
          },
          data: result,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ data: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: err.message || "Failed to check availability" } },
      { status: 500 }
    );
  }
}
