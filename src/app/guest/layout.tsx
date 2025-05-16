
import AuthGuard from '@/components/auth/auth-guard';
import { SharedHeader } from '@/components/shared/header';
import type { ReactNode } from 'react';

export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['guest']}>
      <div className="flex flex-col min-h-screen bg-background">
        <SharedHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="text-center py-4 border-t border-border text-sm text-muted-foreground">
          Eleon Guest Portal &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </AuthGuard>
  );
}
