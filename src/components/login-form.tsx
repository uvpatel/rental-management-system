"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, KeyRound, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e?: React.FormEvent, customEmail?: string, customPass?: string) {
    if (e) e.preventDefault();
    setIsLoading(true);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    const { error } = await authClient.signIn.email({
      email: loginEmail,
      password: loginPass,
    });

    if (error) {
      toast.error(error.message || "Invalid email or password");
      setIsLoading(false);
      return;
    }

    toast.success("Signed in successfully!");
    router.push(loginEmail.includes("customer") ? "/portal/rentals" : "/dashboard/overview");
    router.refresh();
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-xl border-border/60">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={(e) => handleLogin(e)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-xs text-muted-foreground">
                  Sign in to manage quotations, orders, and rentals
                </p>
              </div>

              {/* Demo Accounts Quick Fill */}
              <div className="bg-muted/50 p-3 rounded-lg border text-xs space-y-2">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  Quick Demo Accounts
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-1.5"
                    onClick={() => handleLogin(undefined, "admin@rental.local", "Admin@123")}
                  >
                    <ShieldCheck className="w-3 h-3 text-red-500 mr-1" />
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-1.5"
                    onClick={() => handleLogin(undefined, "vendor@rental.local", "Vendor@123")}
                  >
                    <UserCheck className="w-3 h-3 text-blue-500 mr-1" />
                    Vendor
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-1.5"
                    onClick={() => handleLogin(undefined, "customer@rental.local", "Customer@123")}
                  >
                    <UserCheck className="w-3 h-3 text-emerald-500 mr-1" />
                    Customer
                  </Button>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </Field>

              <FieldDescription className="text-center text-xs">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="underline underline-offset-2 hover:text-primary font-medium">
                  Register as Customer
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Rental Management System</h2>
                <p className="text-xs text-muted-foreground max-w-[220px] mx-auto">
                  Overbooking prevention, automated GST invoicing, and real-time inventory tracking.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
