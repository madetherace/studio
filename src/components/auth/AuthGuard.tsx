
"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { initializeMockRooms } from '@/lib/mock-data';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ('guest' | 'admin')[]; // Roles that are allowed to access the route
  publicRoute?: boolean; // If true, allows access even if not authenticated (e.g., login page)
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles, publicRoute = false }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize mock room data on first load of any guarded component (or in AuthProvider)
    initializeMockRooms();
  }, []);

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    const isLoginPage = pathname === '/login';

    if (isAuthenticated) {
      if (isLoginPage) {
        // If authenticated and on login page, redirect to appropriate dashboard
        router.replace(user?.role === 'admin' ? '/admin' : '/room/manage'); // Changed guest default to /room/manage
        return;
      }
      if (allowedRoles && !allowedRoles.includes(user!.role)) {
        // Authenticated, but incorrect role for the page
        router.replace(user!.role === 'admin' ? '/admin' : '/'); // Redirect to their default valid page
        return;
      }
    } else {
      // Not authenticated
      if (!publicRoute && !isLoginPage) {
        // If not a public route and not login page, redirect to login
        router.replace(`/login?redirect=${pathname}`);
        return;
      }
    }
  }, [user, isAuthenticated, loading, router, pathname, allowedRoles, publicRoute]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  // If public route, or authenticated and role matches (or no specific roles), render children
  if (publicRoute || (isAuthenticated && (!allowedRoles || allowedRoles.includes(user!.role)))) {
    return <>{children}</>;
  }
  
  // If not authenticated and trying to access a protected route, this return null while redirect happens
  // Or if on login page and not yet authenticated.
  if (!isAuthenticated && (publicRoute || pathname === '/login')) {
     return <>{children}</>;
  }

  return null; // Fallback, should be redirecting
};

export default AuthGuard;
