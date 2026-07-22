'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRentalStore } from '@/hooks/use-rental-store';
import { UserRole } from '@/types/rental';
import { AuthModal } from '@/components/auth/auth-modal';
import { CartSheet } from '@/components/store/cart-sheet';
import {
  ShoppingBag,
  User,
  Building2,
  ShieldCheck,
  Store,
  FileText,
  TrendingUp,
  Package,
  Layers,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function SiteHeaderNav() {
  const store = useRentalStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Listen for custom cart item additions
    const updateCartCount = () => {
      try {
        const cartStr = localStorage.getItem('odoo_rental_cart');
        if (cartStr) {
          const items = JSON.parse(cartStr);
          const count = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  if (!mounted) return null;

  const currentUser = store.getCurrentUser();
  const currentRole = currentUser?.role || 'customer';

  const handleRoleSwitch = (newRole: UserRole) => {
    const users = store.getUsers();
    const targetUser = users.find((u) => u.role === newRole) || {
      id: `usr-${newRole}-default`,
      name: `${newRole.toUpperCase()} User`,
      email: `${newRole}@odoorental.com`,
      role: newRole,
      companyName: newRole !== 'customer' ? 'Rental Solutions Ltd' : 'Independent Client',
      gstin: '24AAACO1234M1Z5',
      createdAt: new Date().toISOString()
    };
    store.setCurrentUser(targetUser);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Banner: Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Odoo Hackathon Interactive Demo Role Switcher:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleRoleSwitch('customer')}
            className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
              currentRole === 'customer'
                ? 'bg-amber-500 text-black font-semibold'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            🛒 Customer View
          </button>
          <button
            onClick={() => handleRoleSwitch('vendor')}
            className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
              currentRole === 'vendor'
                ? 'bg-indigo-500 text-white font-semibold'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            🏪 Vendor View
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
              currentRole === 'admin'
                ? 'bg-emerald-500 text-white font-semibold'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            ⚙️ Admin Backoffice
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/store" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-primary">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span>Rental<span className="text-purple-600 dark:text-purple-400">Flow</span></span>
            <Badge variant="outline" className="text-[10px] font-semibold border-purple-300 text-purple-600 dark:border-purple-800 dark:text-purple-400">
              Odoo ERP
            </Badge>
          </Link>

          {/* Navigation Links based on Role */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Link
              href="/store"
              className={`px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 ${
                pathname === '/store' ? 'text-foreground font-semibold bg-slate-100 dark:bg-slate-800' : ''
              }`}
            >
              Browse Products
            </Link>

            {currentRole === 'customer' && (
              <Link
                href="/portal"
                className={`px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  pathname === '/portal' ? 'text-foreground font-semibold bg-slate-100 dark:bg-slate-800' : ''
                }`}
              >
                My Rental Orders
              </Link>
            )}

            {(currentRole === 'vendor' || currentRole === 'admin') && (
              <>
                <Link
                  href="/admin/orders"
                  className={`px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    pathname.startsWith('/admin/orders') ? 'text-foreground font-semibold bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  Rental Orders
                </Link>
                <Link
                  href="/admin/operations"
                  className={`px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    pathname.startsWith('/admin/operations') ? 'text-foreground font-semibold bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  Pickups & Returns
                </Link>
                <Link
                  href="/admin/products"
                  className={`px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    pathname.startsWith('/admin/products') ? 'text-foreground font-semibold bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  Products
                </Link>
                <Link
                  href="/admin/invoices"
                  className={`px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    pathname.startsWith('/admin/invoices') ? 'text-foreground font-semibold bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  Invoices
                </Link>
                <Link
                  href="/admin/reports"
                  className={`px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    pathname.startsWith('/admin/reports') ? 'text-foreground font-semibold bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  Reports & Analytics
                </Link>
              </>
            )}

            {currentRole === 'admin' && (
              <Link
                href="/admin/settings"
                className={`px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  pathname.startsWith('/admin/settings') ? 'text-foreground font-semibold bg-slate-100 dark:bg-slate-800' : ''
                }`}
              >
                Settings
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCartOpen(true)}
            className="relative gap-2 font-medium border-slate-300 dark:border-slate-700"
          >
            <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Quotation Cart</span>
            {cartCount > 0 && (
              <Badge className="h-5 px-1.5 min-w-[20px] bg-purple-600 text-white font-bold rounded-full text-[11px] flex items-center justify-center">
                {cartCount}
              </Badge>
            )}
          </Button>

          {/* User Account / Auth */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger >
                <Button variant="ghost" className="relative h-9 rounded-full px-2 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{currentUser.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    {currentUser.companyName && (
                      <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold pt-1">
                        🏢 {currentUser.companyName}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsAuthOpen(true)}>
                  <User className="mr-2 h-4 h-4" /> Edit Profile & GSTIN
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRoleSwitch('customer')}>
                  <Store className="mr-2 h-4 w-4" /> Switch to Customer Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch('vendor')}>
                  <Building2 className="mr-2 h-4 w-4" /> Switch to Vendor Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch('admin')}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Switch to Admin Mode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => setIsAuthOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
              Sign In / Register
            </Button>
          )}
        </div>
      </div>

      {/* Auth Modal & Cart Sheet */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
