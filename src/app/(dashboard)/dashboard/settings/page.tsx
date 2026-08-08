"use client";

import React, { useState } from "react";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, Percent, Clock, Tag, Building, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  const [gracePeriodHours, setGracePeriodHours] = useState(1);
  const [feeValuePercent, setFeeValuePercent] = useState(10);
  const [taxPercent, setTaxPercent] = useState(18);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Organization rental settings & late fee policies saved!");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Settings & Policies</h1>
          <p className="text-xs text-muted-foreground">
            Configure taxation rules, late return fee parameters, grace periods, and promotional coupons.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Company Settings */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/30 p-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Company & Tax Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Legal Company Name</label>
                <Input defaultValue="Apex Rental Private Limited" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Company GSTIN</label>
                <Input defaultValue="24ABCDE1234F1Z5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Late Fee Policy */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/30 p-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Late Return Fee Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Grace Period (Hours) *</label>
                <Input
                  type="number"
                  min={0}
                  value={gracePeriodHours}
                  onChange={(e) => setGracePeriodHours(Number(e.target.value))}
                />
                <span className="text-[10px] text-muted-foreground">Returns within grace period incur no fee</span>
              </div>

              <div>
                <label className="font-semibold block mb-1">Daily Late Fee Percentage (%) *</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={feeValuePercent}
                  onChange={(e) => setFeeValuePercent(Number(e.target.value))}
                />
                <span className="text-[10px] text-muted-foreground">Calculated daily on order subtotal after grace period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Rates & Coupons */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/30 p-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500" />
              Active Tax Rates & Coupons
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
              <div>
                <div className="font-bold text-foreground">Standard GST Rate</div>
                <div className="text-[11px] text-muted-foreground">Applied to all rental order sub-totals</div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-mono">
                {taxPercent}% GST
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-foreground">Active Promotional Coupons</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-primary">WELCOME10</div>
                    <div className="text-[11px] text-muted-foreground">10% Off (Min order ₹1,000)</div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-primary">HACKATHON20</div>
                    <div className="text-[11px] text-muted-foreground">20% Off (Min order ₹2,000)</div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="px-6 py-5 text-sm font-semibold shadow-md">
          Save All Settings
        </Button>
      </form>

      <AiAssistantDrawer />
    </div>
  );
}
