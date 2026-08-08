"use client";

import React, { useState } from "react";
import { Sparkles, Bot, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

export function AiAssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "Hello! I am your Rental AI Assistant. Ask me about equipment availability, pricing rules, tax policies, or operational summaries.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!prompt.trim() || loading) return;

    const userMessage = prompt.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.data?.text || "I am available to answer questions about rental gear, dates, and order status.",
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Unable to connect to AI service. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            size="sm"
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-4 py-6"
          >
            <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            <span className="font-medium text-sm">Rental AI</span>
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-md flex flex-col p-6">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-primary" />
            Rental AI Assistant
          </SheetTitle>
          <SheetDescription className="text-xs">
            Powered by deterministic catalog & availability data.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted border border-border text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t flex gap-2">
          <Input
            placeholder="Ask about gear, deposits, or policies..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} disabled={loading} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
