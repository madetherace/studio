
"use client"

import type { Room } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OccupancyChartProps {
  rooms: Room[];
}

export function OccupancyChart({ rooms }: OccupancyChartProps) {
  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter(room => room.status === 'occupied').length;
  const availableCount = rooms.filter(room => room.status === 'available').length;
  const maintenanceCount = rooms.filter(room => room.status === 'maintenance').length;

  const data = [
    { name: 'Occupied', count: occupiedCount, fill: 'hsl(var(--chart-1))' }, // Blue
    { name: 'Available', count: availableCount, fill: 'hsl(var(--chart-2))' }, // Green
    { name: 'Maintenance', count: maintenanceCount, fill: 'hsl(var(--chart-3))' }, // Red/Pink
  ];

  if (totalRooms === 0) {
    return <p className="text-muted-foreground text-center py-4">No room data available for chart.</p>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false}/>
          <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          <Bar dataKey="count" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
