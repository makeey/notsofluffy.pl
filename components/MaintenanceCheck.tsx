'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

export function MaintenanceCheck({ children }: MaintenanceCheckProps) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/maintenance-status`);
        const data = await response.json();
        setIsMaintenanceMode(data.maintenance_mode);
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
        // If we can't check maintenance mode, assume it's not active to prevent lockout
        setIsMaintenanceMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenanceMode();
  }, []);

  // Don't show anything while loading
  if (isLoading || authLoading || isMaintenanceMode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  // If maintenance mode is off, show normal content
  if (!isMaintenanceMode) {
    return <>{children}</>;
  }

  // If maintenance mode is on, check if user is admin
  const isAdmin = user?.role === 'admin';

  // Allow admin users to access admin routes and auth routes during maintenance
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isComingSoonPage = pathname === '/coming-soon';

  // Allow auth routes for everyone during maintenance (so non-admin users can login)
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Allow admin users to access admin routes during maintenance
  if (isAdmin && isAdminRoute) {
    return <>{children}</>;
  }

  // If already on coming soon page, don't redirect
  if (isComingSoonPage) {
    return <>{children}</>;
  }

  // For non-admin users in maintenance mode, redirect to coming soon page
  if (!isAdmin) {
    router.replace('/coming-soon');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Przekierowywanie...</div>
      </div>
    );
  }

  // Admin users can see everything during maintenance mode
  return <>{children}</>;
}