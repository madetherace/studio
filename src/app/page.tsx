
// This page serves as the "BookingPage"
import AuthGuard from '@/components/auth/AuthGuard';
import { BookingForm } from '@/components/guest/BookingForm'; // Corrected path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookingPage() {
  return (
    <AuthGuard allowedRoles={['guest']} publicRoute={false}> {/* Guests need to be logged in to book */}
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Book a Room</CardTitle>
            <CardDescription>Find and reserve your room for a comfortable stay.</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
