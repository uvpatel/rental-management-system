"use client";

import React from "react";

export function Money({ amountPaise, className = "" }: { amountPaise: number; className?: string }) {
  const rupees = (amountPaise || 0) / 100;
  const formatted = rupees.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  return <span className={`font-mono ${className}`}>{formatted}</span>;
}
