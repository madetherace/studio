
// This layout is not strictly necessary if /room/[roomId]/page.tsx uses AuthGuard and RootLayout is sufficient.
// However, keeping it allows for potential guest-section specific wrappers in the future.
// If this file is not needed, it can be removed, and Next.js will use src/app/layout.tsx by default.

import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function GuestSectionLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['guest']}>
      {/* This layout wraps guest-specific pages like booking or room management. */}
      {/* It currently doesn't add much beyond what RootLayout and AuthGuard provide. */}
      {/* Can be expanded with guest-specific navigation or footers if needed. */}
      {children}
    </AuthGuard>
  );
}
