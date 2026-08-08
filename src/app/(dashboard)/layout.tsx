import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentalFlow | Odoo Rental Management System",
  description: "End-to-End Rental ERP Workflow - Quotations, Orders, Invoicing, Returns & Analytics",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <SidebarProvider defaultOpen={true}>
                <div className="flex min-h-screen w-full bg-background text-foreground">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    {children}
                  </div>
                </div>
              </SidebarProvider>
            </TooltipProvider>
          </ThemeProvider>
        
      </body>
    </html>
  );
}
