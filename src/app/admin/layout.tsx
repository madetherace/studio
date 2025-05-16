
import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="py-4">
        {/* Admin-specific layout elements can go here if needed, like a sub-nav or title */}
        {children}
      </div>
    </AuthGuard>
  );
}
