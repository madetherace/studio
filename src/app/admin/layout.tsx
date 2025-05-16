
import AuthGuard from '@/components/auth/auth-guard';
import { SharedHeader } from '@/components/shared/header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { ReactNode } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <SharedHeader />
            <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
