
"use client";

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
    router.push('/login');
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/guest/dashboard'} className="flex items-center gap-2">
          <Building className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Eleon</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle className="h-5 w-5" />
              <span>{user.name} ({user.role})</span>
            </div>
          )}
          {user?.role === 'admin' && (
             <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Button>
          )}
           {user?.role === 'guest' && (
             <Button variant="ghost" size="sm" onClick={() => router.push('/guest/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              My Dashboard
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
