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
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(gstin.trim())) {
      toast.error("Invalid GSTIN format. Example: 24ABCDE1234F1Z5");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
      });

      if (error) {
        toast.error(error.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Update profile with company & gstin via profile endpoint
      await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, gstin, couponCode }),
      });

      toast.success("Account registered successfully!");
      router.push("/portal/rentals");
      router.refresh();
    } catch (err: any) {
      toast.error("Error creating account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-xl border-border/60">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSignUp}>
            <FieldGroup className="space-y-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Customer Registration</h1>
                <p className="text-xs text-muted-foreground">
                  Create an account to request quotes and manage equipment rentals
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="reg-name">Full Name *</FieldLabel>
                  <Input
                    id="reg-name"
                    required
                    placeholder="Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reg-email">Email Address *</FieldLabel>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="rajesh@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="reg-company">Company Name</FieldLabel>
                  <Input
                    id="reg-company"
                    placeholder="Kinetix Media Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reg-gstin">GSTIN (Optional)</FieldLabel>
                  <Input
                    id="reg-gstin"
                    placeholder="24ABCDE1234F1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="reg-password">Password *</FieldLabel>
                  <Input
                    id="reg-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reg-confirm">Confirm Password *</FieldLabel>
                  <Input
                    id="reg-confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="reg-coupon">Coupon Code (Optional)</FieldLabel>
                <Input
                  id="reg-coupon"
                  placeholder="WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
              </Field>

              <Button type="submit" disabled={isLoading} className="w-full mt-2">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Account
              </Button>

              <FieldDescription className="text-center text-xs">
                Already have an account?{" "}
                <Link href="/sign-in" className="underline underline-offset-2 hover:text-primary font-medium">
                  Sign In
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
