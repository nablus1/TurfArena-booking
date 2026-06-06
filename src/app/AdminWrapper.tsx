'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/src/components/layout/Header';

interface AdminWrapperProps {
  children: ReactNode;
}

export default function AdminWrapper({ children }: AdminWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {/* Only render Header for non-admin pages */}
      {!isAdmin && <Header />}
      {children}
    </>
  );
}
