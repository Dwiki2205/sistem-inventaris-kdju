'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useItemStore } from '../stores/itemStore';
import { useBorrowStore } from '../stores/borrowStore';

export default function DataLoader({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { fetchItems } = useItemStore();
  const { fetchRecords } = useBorrowStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems().catch(console.error);
      fetchRecords().catch(console.error);
    }
  }, [isAuthenticated, fetchItems, fetchRecords]);

  return <>{children}</>;
}