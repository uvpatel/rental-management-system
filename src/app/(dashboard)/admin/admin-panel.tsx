"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ShieldIcon, ShieldAlertIcon, UserIcon, BanIcon, CheckCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean | null;
  createdAt: string;
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const response = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });
      if (response.data) {
        setUsers(response.data.users as unknown as User[]);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setActionLoading(userId);
    try {
      await authClient.admin.setRole({
        userId,
        role: newRole as "user" | "admin",
      });
      toast.success("Role updated successfully");
      await loadUsers();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBanToggle(userId: string, isBanned: boolean | null) {
    setActionLoading(userId);
    try {
      if (isBanned) {
        await authClient.admin.unbanUser({ userId });
        toast.success("User unbanned");
      } else {
        await authClient.admin.banUser({ userId });
        toast.success("User banned");
      }
      await loadUsers();
    } catch {
      toast.error("Failed to update ban status");
    } finally {
      setActionLoading(null);
    }
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="gap-1">
            <ShieldIcon className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "superAdmin":
        return (
          <Badge variant="destructive" className="gap-1">
            <ShieldAlertIcon className="h-3 w-3" />
            Super Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <UserIcon className="h-3 w-3" />
            User
          </Badge>
        );
    }
  }

  function getInitials(name: string, email: string) {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="rounded-lg border">
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users, roles, and access permissions.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {users.length} users
        </Badge>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image || undefined} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive" className="gap-1">
                      <BanIcon className="h-3 w-3" />
                      Banned
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
                      <CheckCircleIcon className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value) =>
                         {
                        if (value) handleRoleChange(user.id, value);
                      }}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant={user.banned ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => handleBanToggle(user.id, user.banned)}
                      disabled={actionLoading === user.id}
                    >
                      {actionLoading === user.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : user.banned ? (
                        "Unban"
                      ) : (
                        "Ban"
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
