
// This is an implicit layout for /room/* routes.
// No specific layout component needed here yet if RootLayout and AuthGuard are sufficient.
// If you need a specific layout for all /room/* pages, create src/app/room/layout.tsx.

// For now, we'll rely on the AuthGuard within the page.tsx for /room/[roomId]/page.tsx
// and the RootLayout.

// If a dedicated layout is desired:
import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function RoomPagesLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['guest']}>
        {/* You could add a specific header or sidebar for room management pages here */}
        {children}
    </AuthGuard>
  );
}
