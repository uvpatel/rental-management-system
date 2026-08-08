"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "").toUpperCase();

  switch (normalized) {
    case "PAID":
    case "COMPLETED":
    case "RETURNED":
      return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">{normalized}</Badge>;
    case "WITH_CUSTOMER":
    case "CONFIRMED":
    case "ISSUED":
      return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20">{normalized}</Badge>;
    case "READY_FOR_PICKUP":
    case "SENT":
      return <Badge className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">{normalized}</Badge>;
    case "PARTIALLY_PAID":
    case "RETURN_DUE":
      return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20">{normalized}</Badge>;
    case "OVERDUE":
    case "FAILED":
      return <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20">{normalized}</Badge>;
    case "DRAFT":
    case "HELD":
    default:
      return <Badge variant="outline" className="text-muted-foreground">{normalized || "DRAFT"}</Badge>;
  }
}
