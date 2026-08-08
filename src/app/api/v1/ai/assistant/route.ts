import { NextRequest, NextResponse } from "next/server";
import {
  generateOrderOperationalSummary,
  enhanceReturnNotes,
  generateExecutiveReportNarrative,
} from "@/server/services/aiService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orderId, notes, prompt } = body;

    let responseText = "";

    if (action === "order_summary" && orderId) {
      responseText = await generateOrderOperationalSummary(orderId);
    } else if (action === "return_notes") {
      responseText = await enhanceReturnNotes(notes || "");
    } else if (action === "report_narrative") {
      responseText = await generateExecutiveReportNarrative();
    } else {
      responseText = `Rental AI Assistant: Based on our current catalog, we offer camera systems, audio gear, generators, and staging equipment with transparent 18% GST tax rates, free deposit refunding upon undamaged inspection, and immediate availability checks! ${
        prompt ? `Regarding your question: "${prompt}", all items can be reserved online in real-time.` : ""
      }`;
    }

    return NextResponse.json({ data: { text: responseText } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: err.message || "AI Assistant failed" } },
      { status: 500 }
    );
  }
}
