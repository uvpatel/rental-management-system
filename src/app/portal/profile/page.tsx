"use client";

import React, { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Building, FileText, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const [actor, setActor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setActor(data.data);
          if (data.data.companyName) setCompanyName(data.data.companyName);
          if (data.data.gstin) setGstin(data.data.gstin);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, gstin, phone }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (e) {
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container max-w-xl mx-auto py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="container max-w-2xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">Customer Profile</h1>

        <Card className="shadow-md border">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account & Tax Details
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Full Name</label>
                <Input value={actor?.name || ""} disabled className="bg-muted/50" />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Email Address</label>
                <Input value={actor?.email || ""} disabled className="bg-muted/50" />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  Company / Organization Name
                </label>
                <Input
                  placeholder="Kinetix Media Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  GSTIN (for B2B Tax Invoicing)
                </label>
                <Input
                  placeholder="24ABCDE1234F1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  Phone Number
                </label>
                <Input
                  placeholder="+91 99887 76655"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={saving} className="w-full mt-4">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <AiAssistantDrawer />
    </div>
  );
}
