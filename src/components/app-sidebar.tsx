"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingBag,
  Truck,
  RotateCcw,
  Receipt,
  CreditCard,
  BarChart3,
  Users,
  SlidersHorizontal,
  ShieldAlert,
  UserCheck,
  Layers,
  ArrowLeft,
  ShoppingBagIcon,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const opsNav = [
    { title: "Overview", url: "/dashboard/overview", icon: LayoutDashboard },
    { title: "Products & Stock", url: "/dashboard/products", icon: Package },
    { title: "Quotations", url: "/dashboard/quotations", icon: FileText },
    { title: "Rental Orders", url: "/dashboard/rental-orders", icon: ShoppingBag },
    { title: "Pickups", url: "/dashboard/pickups", icon: Truck },
    { title: "Returns & Inspection", url: "/dashboard/returns", icon: RotateCcw },
  ];

  const financialNav = [
    { title: "Invoices Ledger", url: "/dashboard/invoices", icon: Receipt },
    { title: "Payment Logs", url: "/dashboard/payments", icon: CreditCard },
    { title: "Analytics & Reports", url: "/dashboard/reports", icon: BarChart3 },
  ];

  const adminNav = [
    { title: "Role Management", url: "/dashboard/users", icon: Users },
    { title: "Rental & Fee Policies", url: "/dashboard/settings", icon: SlidersHorizontal },
    { title: "Admin System Control", url: "/admin", icon: ShieldAlert },
    { title: "Account & Profile", url: "/settings", icon: UserCheck },
  ];

  const portalNav = [
    { title: "My Rentals", url: "/portal/rentals", icon: ShoppingBagIcon },
    { title: "My Quotations", url: "/portal/quotations", icon: FileText },
    { title: "My Invoices", url: "/portal/invoices", icon: Receipt },
    { title: "Customer Profile", url: "/portal/profile", icon: UserCheck },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden leading-none">
            <span className="font-bold text-sm tracking-tight text-foreground">ApexRentals</span>
            <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">Operations System</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Content Navigation */}
      <SidebarContent className="px-2 py-3 space-y-4">
        {/* Operations Section */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {opsNav.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/dashboard/overview" && pathname.startsWith(item.url));
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}
                      render={
                        <Link href={item.url} className="flex items-center gap-2.5 w-full">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate text-xs">{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Financials & Analytics Section */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Financials & Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {financialNav.map((item) => {
                const isActive = pathname.startsWith(item.url);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}
                      render={
                        <Link href={item.url} className="flex items-center gap-2.5 w-full">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate text-xs">{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Customer Portal Section */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Customer Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {portalNav.map((item) => {
                const isActive = pathname.startsWith(item.url);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}
                      render={
                        <Link href={item.url} className="flex items-center gap-2.5 w-full">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate text-xs">{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration & Settings Section */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Admin & System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {adminNav.map((item) => {
                const isActive = pathname === item.url;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}
                      render={
                        <Link href={item.url} className="flex items-center gap-2.5 w-full">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate text-xs">{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="outline"
              className="w-full justify-start gap-2.5 text-xs text-muted-foreground hover:text-foreground"
              render={
                <Link href="/" className="flex items-center gap-2.5 w-full">
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden font-medium">Public Storefront</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
