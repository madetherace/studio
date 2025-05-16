
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminBookingsPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">All Bookings</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Booking Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section is intended for viewing and managing all guest bookings.
              Administrators would be able to search, filter, view details, and potentially modify or cancel bookings here.
              This is currently a placeholder page.
            </p>
            {/* Placeholder for booking data table or list */}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
