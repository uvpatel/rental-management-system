import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  enhanceReturnNotes,
  generateChatbotResponse,
  generateExecutiveReportNarrative,
  generateOrderOperationalSummary,
} from "@/server/services/aiService";
import { aiAssistantRequestSchema } from "@/server/validation/aiAssistant";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = aiAssistantRequestSchema.parse(await request.json());
    const action = body.action ?? "chat";

    let text: string;
    switch (action) {
      case "order_summary":
        text = await generateOrderOperationalSummary(body.orderId!);
        break;
      case "return_notes":
        text = await enhanceReturnNotes(body.notes ?? "");
        break;
      case "report_narrative":
        text = await generateExecutiveReportNarrative();
        break;
      default:
        text = await generateChatbotResponse(body.prompt!, body.messages);
    }

    return NextResponse.json({ data: { text } });
  } catch (error) {
    console.error("AI assistant request failed", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
        { status: 400 },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: error.issues[0]?.message ?? "Invalid request." } },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "AI Assistant failed";
    if (message === "GEMINI_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: { code: message, message: "GEMINI_API_KEY is not configured on the server." } },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: { code: "AI_PROVIDER_ERROR", message: "The AI service could not complete this request." } },
      { status: 502 },
    );
  }
}
