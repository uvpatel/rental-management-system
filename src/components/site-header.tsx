"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, User, LogOut, PackageCheck, LayoutDashboard, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useCartStore } from "@/lib/cart-store";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setUser({
            name: data.data.name,
            email: data.data.email,
            role: data.data.role,
          });
        }
      })
      .catch(() => {});
  }, [pathname]);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      setUser(null);
      router.push("/sign-in");
      router.refresh();
    } catch (e) {}
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Layers className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            ApexRentals
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/products"
            className={`transition-colors hover:text-primary ${
              pathname.startsWith("/products") ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            Catalog
          </Link>
          <Link
            href="/cart"
            className={`transition-colors hover:text-primary flex items-center gap-1.5 ${
              pathname === "/cart" ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            Cart
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          {user && (
            <Link
              href="/portal/rentals"
              className={`transition-colors hover:text-primary ${
                pathname.startsWith("/portal") ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              My Rentals
            </Link>
          )}
          {(user?.role === "VENDOR" || user?.role === "ADMIN") && (
            <Link
              href="/dashboard/overview"
              className={`transition-colors hover:text-primary flex items-center gap-1 text-primary font-semibold ${
                pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Vendor Dashboard
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ModeToggle />

          <Link href="/cart" className="relative md:hidden">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground">
                {user.name} ({user.role})
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="shadow-sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
