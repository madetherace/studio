
"use client";
// This page serves as the "RoomPage" for managing a specific room
import AuthGuard from '@/components/auth/AuthGuard';
import { RoomControls } from '@/components/guest/RoomControls';
import { SensorDisplay } from '@/components/guest/SensorDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMockRooms, updateMockRoom } from '@/lib/mock-data';
import type { Room } from '@/types';
import { BedDouble, Thermometer, Droplets, Wind, WifiOff } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function RoomManagementPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (roomId) {
      setLoading(true);
      // Simulate fetching room data. In a real app, this would be an API call.
      // For now, we'll use our mock data utility.
      const allRooms = getMockRooms();
      const currentRoom = allRooms.find(r => r.id === roomId);
      if (currentRoom) {
        setRoom(currentRoom);
      } else {
        toast({ title: "Error", description: "Room not found.", variant: "destructive" });
        // Potentially redirect or show an error component
      }
      setLoading(false);
    }
  }, [roomId, toast]);

  const handleRoomStateChange = (updatedState: Partial<Room>) => {
    if (!room) return;
    if (isOffline) {
      toast({ title: "Offline", description: "Cannot change room state while offline.", variant: "destructive" });
      return;
    }

    const newRoomState = { ...room, ...updatedState };
    setRoom(newRoomState);
    updateMockRoom(newRoomState); // Update in our mock "store"
    // In a real app, here you would call controllerApi.sendCommand(...)
    console.log("Simulating command to controller:", updatedState);
    toast({ title: "Room Updated", description: "Room settings have been updated." });
  };

  // Auto-refresh sensor data (simulation)
  useEffect(() => {
    if (!room || isOffline) return;

    const intervalId = setInterval(() => {
      // Simulate fetching new sensor data
      const newTemperature = parseFloat((Math.random() * 5 + 20).toFixed(1)); // 20-25°C
      const newHumidity = parseFloat((Math.random() * 20 + 40).toFixed(1));    // 40-60%
      const newPressure = parseFloat((Math.random() * 10 + 1005).toFixed(0)); // 1005-1015 hPa

      // Only update if there's a noticeable change to avoid constant re-renders for identical values
      if (room.temperature !== newTemperature || room.humidity !== newHumidity || room.pressure !== newPressure) {
        const updatedRoomData = {
          ...room,
          temperature: newTemperature,
          humidity: newHumidity,
          pressure: newPressure,
        };
        setRoom(updatedRoomData);
        updateMockRoom(updatedRoomData);
         // No toast for sensor updates to avoid spamming
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(intervalId);
  }, [room, isOffline]);


  if (loading) {
    return <div className="text-center py-10">Loading room details...</div>;
  }

  if (!room) {
    return <div className="text-center py-10 text-destructive">Room {roomId} not found.</div>;
  }

  return (
    <AuthGuard allowedRoles={['guest']}>
      <div className="space-y-6">
        {isOffline && (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="p-3 text-center text-sm text-destructive-foreground flex items-center justify-center gap-2">
              <WifiOff className="h-4 w-4" /> You are currently offline. Controls are disabled. Sensor data may be stale.
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-6 w-6 text-accent" />
              Room {room.id} Management
            </CardTitle>
            <CardDescription>Control your room environment and access.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <RoomControls room={room} onStateChange={handleRoomStateChange} isOffline={isOffline} />
            <SensorDisplay room={room} />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
