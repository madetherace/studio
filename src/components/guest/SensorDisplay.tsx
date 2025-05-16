
"use client";

import type { Room } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets, Wind, Gauge } from 'lucide-react'; // Using Gauge for pressure

interface SensorDisplayProps {
  room: Room;
}

export function SensorDisplay({ room }: SensorDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Environment</CardTitle>
        <CardDescription>Current sensor readings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="h-5 w-5 text-red-500" />
            <span>Temperature</span>
          </div>
          <span className="font-medium">{room.temperature?.toFixed(1) ?? 'N/A'} °C</span>
        </div>
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="h-5 w-5 text-blue-500" />
            <span>Humidity</span>
          </div>
          <span className="font-medium">{room.humidity?.toFixed(1) ?? 'N/A'} %</span>
        </div>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="h-5 w-5 text-gray-500" />
            <span>Pressure</span>
          </div>
          <span className="font-medium">{room.pressure?.toFixed(0) ?? 'N/A'} hPa</span>
        </div>
      </CardContent>
    </Card>
  );
}
