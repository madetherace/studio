
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-foreground mb-8">System Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings /> Application & Hotel Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will allow administrators to configure various system settings.
            This could include hotel information, user role management, notification preferences, integration settings, etc.
            This is currently a placeholder page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
