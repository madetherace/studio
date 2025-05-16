
"use client"
// This component is effectively replaced by OccupancyChart.tsx for the new PWA.
// Keeping for reference, but OccupancyChart.tsx should be used.

import type { Room } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { BarChartBig, CheckCircle2, XCircle, Wrench } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface OldVacancyChartProps {
  rooms: Room[];
}

const chartConfig = {
  available: { label: "Available", color: "hsl(var(--chart-1))" },
  occupied: { label: "Occupied", color: "hsl(var(--chart-2))" },
  maintenance: { label: "Maintenance", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;


export function VacancyChart({ rooms }: OldVacancyChartProps) {
  if (!rooms || rooms.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <BarChartBig className="h-6 w-6"/> Old Hotel Vacancy Statistics
          </CardTitle>
          <CardDescription>Current room occupancy and availability rates.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>No room data to display statistics.</p>
        </CardContent>
      </Card>
    );
  }
  
  const totalRooms = rooms.length;
  const availableCount = rooms.filter(room => room.status === 'available').length;
  const occupiedCount = rooms.filter(room => room.status === 'occupied').length;
  const maintenanceCount = rooms.filter(room => room.status === 'maintenance').length;

  const vacancyRate = totalRooms > 0 ? (availableCount / totalRooms) * 100 : 0;
  const occupancyRate = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0;

  const chartData = [
    { status: "Available", count: availableCount, fill: "var(--color-available)" },
    { status: "Occupied", count: occupiedCount, fill: "var(--color-occupied)" },
    { status: "Maintenance", count: maintenanceCount, fill: "var(--color-maintenance)" },
  ];

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <BarChartBig className="h-6 w-6"/> Old Hotel Vacancy Statistics
        </CardTitle>
        <CardDescription>Current room occupancy and availability rates ({totalRooms} total rooms).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Card className="bg-secondary/30 p-4">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2"/>
                <p className="text-2xl font-bold">{availableCount}</p>
                <p className="text-sm text-muted-foreground">Available Rooms</p>
            </Card>
             <Card className="bg-secondary/30 p-4">
                <XCircle className="h-8 w-8 text-orange-500 mx-auto mb-2"/>
                <p className="text-2xl font-bold">{occupiedCount}</p>
                <p className="text-sm text-muted-foreground">Occupied Rooms</p>
            </Card>
             <Card className="bg-secondary/30 p-4">
                <Wrench className="h-8 w-8 text-red-500 mx-auto mb-2"/>
                <p className="text-2xl font-bold">{maintenanceCount}</p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
            </Card>
        </div>

        <div>
          <Label className="text-sm font-medium">Overall Vacancy Rate: {vacancyRate.toFixed(1)}%</Label>
          <Progress value={vacancyRate} className="w-full h-3 mt-1" indicatorClassName="bg-green-500" />
        </div>
         <div>
          <Label className="text-sm font-medium">Overall Occupancy Rate: {occupancyRate.toFixed(1)}%</Label>
          <Progress value={occupancyRate} className="w-full h-3 mt-1" indicatorClassName="bg-orange-500" />
        </div>

        <div className="h-[300px] w-full pt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis 
                dataKey="status" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                tickFormatter={(value) => value.substring(0, 3)}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" radius={8} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
