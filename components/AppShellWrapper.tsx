'use client';

import { usePathname } from 'next/navigation';
import AppShell from './AppShell';

interface AppShellWrapperProps {
  children: React.ReactNode;
}

export default function AppShellWrapper({ children }: AppShellWrapperProps) {
  const pathname = usePathname();
  
  // Route yang TIDAK menggunakan AppShell
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}