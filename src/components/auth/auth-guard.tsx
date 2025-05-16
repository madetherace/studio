
"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, ReactNode } from 'react';
import { mockRooms as defaultMockRooms } from '@/lib/mock-data'; // Import default mock rooms

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ('guest' | 'admin')[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize mockRooms in localStorage if not already present
      if (!localStorage.getItem('eleon-rooms')) {
        localStorage.setItem('eleon-rooms', JSON.stringify(defaultMockRooms));
      }
    }
  }, []);


  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    if (!user) {
      if (pathname !== '/login' && pathname !== '/') {
        router.replace(`/login?redirect=${pathname}`);
      }
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // If user is logged in but tries to access a page not for their role
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (user.role === 'guest') {
        router.replace('/guest/dashboard');
      } else {
        router.replace('/login'); // Fallback
      }
      return;
    }

    // If user is logged in and tries to access login or landing page, redirect to their dashboard
    if (user && (pathname === '/login' || pathname === '/')) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/guest/dashboard');
      }
    }

  }, [user, loading, router, allowedRoles, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-8 rounded-lg shadow-xl">
          <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-center text-muted-foreground mt-4">Loading Eleon...</p>
        </div>
      </div>
    );
  }

  // If user is null and current path is public (login or landing), allow rendering
  if (!user && (pathname === '/login' || pathname === '/')) {
    return <>{children}</>;
  }
  
  // If user is present and has an allowed role (or no specific roles are required beyond being logged in)
  if (user && (!allowedRoles || allowedRoles.includes(user.role))) {
    return <>{children}</>;
  }
  
  // Otherwise, user is not authenticated for this route, AuthGuard effect will handle redirect.
  // Return null or a minimal loader while redirect is in progress.
  return null; 
};

export default AuthGuard;
