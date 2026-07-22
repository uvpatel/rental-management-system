'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRentalStore } from '@/hooks/use-rental-store';
import { UserRole } from '@/types/rental';
import { AuthModal } from '@/components/auth/auth-modal';


export function SiteHeaderNav() {
  const store = useRentalStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
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

  // Format Page Breadcrumbs / Title
  

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Interactive Top Header Bar */}
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        

        {/* Center / Search Input */}
       

      
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
    </header>
  );
}
