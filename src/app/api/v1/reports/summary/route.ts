import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/actor";
import { getReportSummary, getRevenueSeries, getTopProducts } from "@/server/services/reportingService";

export async function GET(req: NextRequest) {
  const actor = await getActorContext();
  if (!actor || (actor.role !== "VENDOR" && actor.role !== "ADMIN")) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Vendor or Admin access required" } },
      { status: 403 }
    );
  }

  const summary = await getReportSummary(actor.organizationId);
  const series = await getRevenueSeries(actor.organizationId);
  const topProducts = await getTopProducts(actor.organizationId);

  return NextResponse.json({
    data: {
      summary,
      series,
      topProducts,
    },
  });
}
