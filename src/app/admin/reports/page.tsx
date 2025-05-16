
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-foreground mb-8">Reports & Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 /> Hotel Performance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This area will provide various reports and analytics, such as occupancy trends, revenue reports, guest demographics, etc.
            Detailed charts and data visualizations would be presented here.
            This is currently a placeholder page. Key vacancy stats are available on the Admin Dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
