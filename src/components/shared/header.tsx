
"use client";
// This component is effectively replaced by AppHeader.tsx
// Keeping for reference or if it's imported elsewhere, but AppHeader.tsx should be used.
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, UserCircle, LayoutDashboard, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SharedHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // router.push('/login'); // Logout in AuthContext handles redirection
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-2">
          <Building className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Old Hotel App Header</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle className="h-5 w-5" />
              <span>{user.username} ({user.role})</span>
            </div>
          )}
          {user?.role === 'admin' && (
             <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Button>
          )}
           {user?.role === 'guest' && user.roomId && (
             <Button variant="ghost" size="sm" onClick={() => router.push(`/room/${user.roomId}`)}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              My Room
            </Button>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
              Login
            </Button>
          )}
          
        </div>
      </div>
    </header>
  );
}
