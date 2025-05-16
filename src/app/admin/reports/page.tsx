
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminReportsPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">Reports & Analytics</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 /> Hotel Performance Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This area will provide various reports and analytics, such as occupancy trends, revenue reports, guest demographics, etc.
              Detailed charts and data visualizations would be presented here.
              This is currently a placeholder page. Key vacancy stats are available on the main Admin Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
