"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Bot, Send, Loader2, RefreshCw } from "lucide-react";
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
      text: "Hello! I am your ApexRentals AI Assistant powered by live database context and Google Gemini. Ask me about equipment stock, daily rates, 18% GST tax rules, or active coupons!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  async function handleSend(customPrompt?: string) {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    if (!customPrompt) setPrompt("");
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

  const quickPrompts = [
    "What camera kits are in stock?",
    "How does the security deposit refund work?",
    "What coupon codes are active?",
    "Explain the 1-hour grace period late fee policy.",
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            size="sm"
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-xl shadow-primary/30 bg-primary text-primary-foreground hover:bg-primary/90 gap-2.5 px-4 py-6 border border-primary/20"
          >
            <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            <span className="font-semibold text-sm">Rental AI</span>
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-md flex flex-col p-6 h-full border-l">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-primary" />
            ApexRentals Real-Time AI
          </SheetTitle>
          <SheetDescription className="text-xs">
            Connected to live catalog DB & Google Gemini API.
          </SheetDescription>
        </SheetHeader>

        {/* Quick Suggestion Chips */}
        <div className="pt-3 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="text-[11px] h-7 px-2.5 whitespace-nowrap rounded-full bg-muted/40 hover:bg-primary/10 hover:text-primary border-border/60 shrink-0"
            >
              {qp}
            </Button>
          ))}
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-br-xs shadow-sm"
                    : "bg-muted border border-border/80 text-foreground rounded-bl-xs shadow-2xs"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border/80 rounded-2xl rounded-bl-xs px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Querying Gemini LLM & Database...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t flex gap-2">
          <Input
            placeholder="Ask AI about gear, daily rates, or policies..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="text-xs"
          />
          <Button onClick={() => handleSend()} disabled={loading || !prompt.trim()} size="icon" className="shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
