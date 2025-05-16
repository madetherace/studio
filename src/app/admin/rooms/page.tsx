
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminRoomsPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">Room Management</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bed /> Detailed Room Status & Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section will provide detailed views and management options for each room, beyond the quick toggles on the main dashboard.
              Features could include editing room details, assigning cleaning status, viewing historical data, etc.
              For now, this is a placeholder. The main room status table with controls is on the Admin Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}

