
"use client";
// This page serves as the "AdminPage"
import AuthGuard from '@/components/auth/AuthGuard';
import { AdminRoomTable } from '@/components/admin/AdminRoomTable';
import { OccupancyChart } from '@/components/admin/OccupancyChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMockRooms, updateMockRoom } from '@/lib/mock-data';
import type { Room } from '@/types';
import { LightbulbOff, BarChartHorizontalBig } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load rooms (from mock data utility which uses localStorage)
    setRooms(getMockRooms());
    setLoading(false);
  }, []);

  const handleTurnOffAllLights = () => {
    const updatedRooms = rooms.map(room => ({ ...room, lightsOn: false }));
    updatedRooms.forEach(room => updateMockRoom(room)); // Update each room in the mock store
    setRooms(updatedRooms); // Update local state to re-render table
    // In a real app, this would loop through rooms and send controllerApi.sendCommand for each.
    console.log("Simulating command: Turn off all lights");
    toast({ title: "Action Sent", description: "Command to turn off all lights has been issued." });
  };

  const refreshRoomData = () => {
    setLoading(true);
    setRooms(getMockRooms()); // Re-fetch from the source
    setLoading(false);
    toast({title: "Data Refreshed", description: "Room data has been updated."});
  }

  if (loading) {
    return <div className="text-center py-10">Loading admin dashboard...</div>;
  }

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleTurnOffAllLights} variant="destructive">
            <LightbulbOff className="mr-2 h-4 w-4" /> Turn Off All Lights
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartHorizontalBig className="h-5 w-5 text-accent" />
              Occupancy Overview
            </CardTitle>
            <CardDescription>Visualization of hotel room occupancy.</CardDescription>
          </CardHeader>
          <CardContent>
            <OccupancyChart rooms={rooms} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Status & Management</CardTitle>
            <CardDescription>Monitor and manage all hotel rooms.</CardDescription>
             <Button onClick={refreshRoomData} variant="outline" size="sm" className="mt-2">Refresh Data</Button>
          </CardHeader>
          <CardContent>
            <AdminRoomTable rooms={rooms} onRoomUpdate={(updatedRoom) => {
              updateMockRoom(updatedRoom);
              setRooms(prevRooms => prevRooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
            }} />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
