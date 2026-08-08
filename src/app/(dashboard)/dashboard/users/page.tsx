"use client";

import React, { useState, useEffect } from "react";
import { AiAssistantDrawer } from "@/components/shared/AiAssistantDrawer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<any[]>([
    { id: "usr_admin", name: "System Admin", email: "admin@rental.local", role: "admin" },
    { id: "usr_vendor", name: "Apex Ops Vendor", email: "vendor@rental.local", role: "vendor" },
    { id: "usr_customer", name: "Rajesh Kumar", email: "customer@rental.local", role: "user" },
  ]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success(`Role updated to ${newRole}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User & Role Management</h1>
          <p className="text-xs text-muted-foreground">
            Manage organization members, assign Vendor/Admin roles, and audit access permissions.
          </p>
        </div>
      </div>

      <Card className="border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b font-semibold text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="p-3.5 font-bold text-foreground">{u.name}</td>
                  <td className="p-3.5 text-muted-foreground font-mono">{u.email}</td>
                  <td className="p-3.5">
                    <Badge variant={u.role === "admin" ? "default" : u.role === "vendor" ? "secondary" : "outline"}>
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-7"
                      onClick={() => handleRoleChange(u.id, "vendor")}
                    >
                      Make Vendor
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-7 text-primary"
                      onClick={() => handleRoleChange(u.id, "admin")}
                    >
                      Make Admin
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AiAssistantDrawer />
    </div>
  );
}
