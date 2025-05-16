
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminBookingsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-foreground mb-8">Booking Management</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users /> All Hotel Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section is intended for viewing and managing all guest bookings.
            Administrators would be able to search, filter, view details, and potentially modify or cancel bookings here.
            This is currently a placeholder page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
