'use client';

import { useSyncExternalStore } from 'react';
import { rentalStore } from '@/lib/rental-store';

export function useRentalStore() {
  const store = useSyncExternalStore(
    (callback) => rentalStore.subscribe(callback),
    () => rentalStore,
    () => rentalStore // SSR fallback
  );

  return store;
}
