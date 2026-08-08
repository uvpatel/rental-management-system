import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().trim().min(1).max(4_000),
});

export const aiAssistantRequestSchema = z
  .object({
    action: z
      .enum(["chat", "order_summary", "return_notes", "report_narrative"])
      .optional(),
    prompt: z.string().trim().min(1).max(4_000).optional(),
    orderId: z.string().trim().min(1).max(100).optional(),
    notes: z.string().trim().max(8_000).optional(),
    messages: z.array(chatMessageSchema).max(20).optional().default([]),
  })
  .superRefine((value, ctx) => {
    const action = value.action ?? "chat";
    if (action === "chat" && !value.prompt) {
      ctx.addIssue({ code: "custom", path: ["prompt"], message: "Prompt is required" });
    }
    if (action === "order_summary" && !value.orderId) {
      ctx.addIssue({ code: "custom", path: ["orderId"], message: "Order ID is required" });
    }
  });

export type AiAssistantRequest = z.infer<typeof aiAssistantRequestSchema>;
