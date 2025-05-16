
"use client";
// This file is being deprecated in favor of /room/[roomId]/page.tsx for guest room management
// and / (BookingPage) for new bookings.
// Adding a redirect to / or /room/[roomId] if user has a booking.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AuthGuard from '@/components/auth/AuthGuard';
import { Loader2 } from 'lucide-react';

export default function GuestDashboardRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (user.roomId) {
        router.replace(`/room/${user.roomId}`);
      } else {
        router.replace('/'); // Redirect to booking page if no active room
      }
    } else {
      router.replace('/login'); // Should be handled by AuthGuard, but as a fallback
    }
  }, [user, loading, router]);

  return (
    <AuthGuard allowedRoles={['guest']}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    </AuthGuard>
  );
}
