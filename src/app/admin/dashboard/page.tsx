
"use client";
// This file is effectively replaced by src/app/admin/page.tsx
// Keeping a redirect or basic content for compatibility if direct navigation occurs.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to Admin Dashboard...</p>
      </div>
    </AuthGuard>
  );
}
