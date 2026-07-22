'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useRentalStore } from '@/hooks/use-rental-store';
import { UserRole } from '@/types/rental';
import { AuthModal } from '@/components/auth/auth-modal';
import { CartSheet } from '@/components/store/cart-sheet';
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
  SidebarSeparator
} from '@/components/ui/sidebar';
import {
  Store,
  FileText,
  Truck,
  Package,
  Receipt,
  BarChart3,
  Settings,
  ShoppingBag,
  User,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  ShieldCheck,
  Layers,
  LogOut,
  Sliders
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const store = useRentalStore();

  const [mounted, setMounted] = React.useState(false);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
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

  const navGroups = [
    {
      label: 'Core Rental Lifecycle',
      items: [
        {
          title: 'Browse Products',
          href: '/store',
          icon: Store,
          badge: null
        },
        {
          title: 'Quotations & Orders',
          href: currentRole === 'customer' ? '/portal' : '/admin/orders',
          icon: FileText,
          badge: null
        },
        {
          title: 'Pickups & Returns',
          href: '/admin/pickups',
          icon: Truck,
          badge: null
        }
      ]
    },
    {
      label: 'Inventory & Invoicing',
      items: [
        {
          title: 'Rentable Products',
          href: '/admin/products',
          icon: Package,
          badge: null
        },
        {
          title: 'Invoices & Payments',
          href: '/admin/invoices',
          icon: Receipt,
          badge: null
        }
      ]
    },
    {
      label: 'Business Intelligence',
      items: [
        {
          title: 'Reports & Analytics',
          href: '/admin/reports',
          icon: BarChart3,
          badge: 'Pro'
        },
        {
          title: 'Settings & Config',
          href: '/admin/settings',
          icon: Settings,
          badge: null
        }
      ]
    }
  ];

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border bg-sidebar" {...props}>
        {/* Sidebar Header: Brand Logo & Role Selector */}
        <SidebarHeader className="border-b border-border/50 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-foreground font-extrabold tracking-tight">RentalFlow</span>
                <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider mt-0.5">Odoo ERP</span>
              </div>
            </Link>
          </div>

          {/* Interactive Role Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="w-full flex items-center justify-between p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-xs font-semibold text-secondary-foreground cursor-pointer transition-colors border border-border/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="capitalize">{currentRole} Mode</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">Switch Active Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleRoleSwitch('customer')} className="cursor-pointer font-medium text-xs">
                🛒 Customer Portal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleSwitch('vendor')} className="cursor-pointer font-medium text-xs">
                🏪 Vendor Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleSwitch('admin')} className="cursor-pointer font-medium text-xs">
                ⚙️ Admin Backoffice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Cart Button */}
          <Button
            variant="outline"
            onClick={() => setIsCartOpen(true)}
            className="w-full justify-between h-9 px-3 text-xs bg-background hover:bg-accent border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              Quotation Cart
            </span>
            {cartCount > 0 && (
              <Badge className="h-5 px-1.5 min-w-[20px] bg-purple-600 text-white font-bold rounded-full text-[10px] flex items-center justify-center">
                {cartCount}
              </Badge>
            )}
          </Button>
        </SidebarHeader>

        {/* Sidebar Content Navigation */}
        <SidebarContent className="p-2 space-y-4">
          {navGroups.map((group, idx) => (
            <SidebarGroup key={idx} className="p-0">
              <SidebarGroupLabel className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1 mt-1">
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/store' && pathname.startsWith(item.href));
                    const IconComponent = item.icon;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={isActive}
                          className={`w-full justify-start h-9 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-purple-600 text-white font-bold shadow-sm hover:bg-purple-700'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2.5">
                              <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                              <span>{item.title}</span>
                            </div>
                            {item.badge && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 border-purple-400 text-purple-500 font-extrabold">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarSeparator className="my-1" />

        {/* Sidebar Footer: Theme Toggle & User Account */}
        <SidebarFooter className="p-3 space-y-2 border-t border-border/50">
          {/* Light / Dark Mode Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border/50 text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-purple-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* User Profile */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent text-xs font-semibold cursor-pointer border border-border/40">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left truncate flex-1">
                    <span className="font-bold text-foreground truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{currentUser.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsAuthOpen(true)} className="cursor-pointer text-xs">
                  <User className="w-3.5 h-3.5 mr-2" />
                  Account & Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAuthOpen(true)} className="cursor-pointer text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                  GSTIN: {currentUser.gstin || 'Not Configured'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsAuthOpen(true)} className="cursor-pointer text-xs text-rose-600">
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setIsAuthOpen(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-9 text-xs">
              <User className="w-3.5 h-3.5 mr-2" />
              Sign In / Account
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
