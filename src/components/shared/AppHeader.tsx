
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Hotel, LogIn, LogOut, UserCircle, LayoutDashboard, BedDouble, KeyRound } from 'lucide-react';

export function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
          <Hotel className="h-7 w-7" />
          <h1 className="text-xl font-semibold">Hotel PWA</h1>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'guest' && user.roomId && (
                <Button variant="ghost" size="sm" onClick={() => router.push(`/room/${user.roomId}`)}>
                  <KeyRound className="mr-2 h-4 w-4" /> My Room
                </Button>
              )}
              {user?.role === 'guest' && !user.roomId && (
                 <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                  <BedDouble className="mr-2 h-4 w-4" /> Book Room
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Admin
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCircle className="h-5 w-5" />
                <span>{user?.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
