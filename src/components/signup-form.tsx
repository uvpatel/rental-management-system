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

  const handleGithubSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/portal/rentals",
      });
    } catch (e) {
      toast.error("Failed to connect to GitHub");
    }
  };

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

              {/* GitHub OAuth Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGithubSignUp}
                className="w-full flex items-center justify-center gap-2.5 py-5 border shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Register with GitHub
              </Button>

              <div className="relative flex items-center justify-center my-1">
                <div className="border-t w-full border-border"></div>
                <span className="bg-card px-2 text-[11px] text-muted-foreground uppercase absolute">or email registration</span>
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
