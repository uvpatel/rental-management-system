"use client";

import { useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, UserIcon, ShieldIcon, MailIcon, KeyIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SettingsPanelProps {
  initialUser: {
    name: string;
    email: string;
    image: string | null;
    role: string;
  };
}

export function SettingsPanel({ initialUser }: SettingsPanelProps) {
  const { data: session } = useSession();
  const user = session?.user || initialUser;

  const [name, setName] = useState(initialUser.name);
  const [isUpdating, setIsUpdating] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await authClient.updateUser({
        name,
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profile Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1 gap-1">
                {user.role === "admin" ? (
                  <ShieldIcon className="h-3 w-3" />
                ) : (
                  <UserIcon className="h-3 w-3" />
                )}
                {user.role || "user"}
              </Badge>
            </div>
          </div>

          <Separator className="mb-6" />

          <form onSubmit={handleUpdateProfile}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="settings-name">
                  <UserIcon className="inline h-4 w-4 mr-1" />
                  Display Name
                </FieldLabel>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isUpdating}
                />
                <FieldDescription>
                  This is the name displayed across the application.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel>
                  <MailIcon className="inline h-4 w-4 mr-1" />
                  Email Address
                </FieldLabel>
                <Input
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <FieldDescription>
                  Your email address cannot be changed.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isUpdating || name === user.name}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Security Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security</h2>
        <p className="text-muted-foreground">
          Manage your security settings and connected accounts.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <FieldGroup>
            <Field>
              <FieldLabel>
                <KeyIcon className="inline h-4 w-4 mr-1" />
                Password
              </FieldLabel>
              <FieldDescription>
                Change your password to keep your account secure.
              </FieldDescription>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  authClient.changePassword({
                    newPassword: "",
                    currentPassword: "",
                    revokeOtherSessions: true,
                  });
                  toast.info("Password change flow initiated");
                }}
              >
                Change Password
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Connected Accounts</h2>
        <p className="text-muted-foreground">
          Connect third-party accounts for easier sign-in.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">GitHub</p>
                <p className="text-sm text-muted-foreground">
                  Connect your GitHub account for quick sign-in
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await authClient.signIn.social({
                  provider: "github",
                  callbackURL: "/settings",
                });
              }}
            >
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
