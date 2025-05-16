
"use client";
// This page serves as the "RoomPage" for managing a specific room
import AuthGuard from '@/components/auth/AuthGuard';
import { RoomControls } from '@/components/guest/RoomControls';
import { SensorDisplay } from '@/components/guest/SensorDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMockRooms, updateMockRoom } from '@/lib/mock-data';
import type { Room, ControllerInfo } from '@/types';
import { ControllerCommandType } from '@/types';
import { sendCommandToController } from '@/services/controllerApi';
import { BedDouble, Thermometer, Droplets, Wind, WifiOff, Info, Network, Bluetooth, Fingerprint, KeyRound, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image'; // Import Image

export default function RoomManagementPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  const [controllerInfo, setControllerInfo] = useState<ControllerInfo | null>(null);
  const [loadingControllerInfo, setLoadingControllerInfo] = useState(false);

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
      const allRooms = getMockRooms();
      const currentRoom = allRooms.find(r => r.id === roomId);
      if (currentRoom) {
        setRoom(currentRoom);
      } else {
        toast({ title: "Error", description: "Room not found.", variant: "destructive" });
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
    updateMockRoom(newRoomState);
    // Simulate actual command sending
    sendCommandToController(room.id, ControllerCommandType.SET_STATE, updatedState)
      .then(() => {
        toast({ title: "Room Updated", description: "Room settings have been updated (simulated)." });
      })
      .catch(error => {
        console.error("Failed to send command to controller:", error);
        toast({ title: "Error", description: "Failed to update room settings.", variant: "destructive" });
        // Optionally revert state if API call fails
      });
  };

  useEffect(() => {
    if (!room || isOffline) return;
    const intervalId = setInterval(() => {
      const newTemperature = parseFloat((Math.random() * 5 + 20).toFixed(1));
      const newHumidity = parseFloat((Math.random() * 20 + 40).toFixed(1));
      const newPressure = parseFloat((Math.random() * 10 + 1005).toFixed(0));

      if (room.temperature !== newTemperature || room.humidity !== newHumidity || room.pressure !== newPressure) {
        const updatedRoomData = {
          ...room,
          temperature: newTemperature,
          humidity: newHumidity,
          pressure: newPressure,
        };
        setRoom(updatedRoomData);
        updateMockRoom(updatedRoomData);
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [room, isOffline]);

  const fetchControllerInfo = async () => {
    if (!room) {
      toast({ title: "Error", description: "Room not selected.", variant: "destructive" });
      return;
    }
    if (isOffline) {
      toast({ title: "Offline", description: "Cannot fetch controller info while offline.", variant: "destructive" });
      return;
    }
    setLoadingControllerInfo(true);
    try {
      // Pass roomId if your API eventually uses it, though current mock doesn't.
      const info = await sendCommandToController(room.id, ControllerCommandType.GET_INFO);
      if (info && 'macAddress' in info) { // Type guard to check if it's ControllerInfo
        setControllerInfo(info as ControllerInfo);
        toast({ title: "Controller Info", description: "Successfully fetched controller information." });
      } else {
        toast({ title: "Error", description: "Failed to get valid controller information.", variant: "destructive" });
        setControllerInfo(null);
      }
    } catch (error) {
      console.error("Error fetching controller info:", error);
      toast({ title: "Error", description: "An error occurred while fetching controller info.", variant: "destructive" });
      setControllerInfo(null);
    } finally {
      setLoadingControllerInfo(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[200px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading room details...</p></div>;
  }

  if (!room) {
    return <div className="text-center py-10 text-destructive">Room {roomId} not found.</div>;
  }
  
  // Determine AI hint for the main room image
  let aiHint = "hotel room interior";
  if (room.id === "ROOM_19") aiHint = "modern hotel room";
  else if (room.amenities?.includes("King Bed")) aiHint = "luxury hotel suite";
  else if (room.capacity === 1) aiHint = "cozy single room";


  return (
    <AuthGuard allowedRoles={['guest']}>
      <div className="space-y-6">
        {isOffline && (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="p-3 text-center text-sm text-destructive-foreground flex items-center justify-center gap-2">
              <WifiOff className="h-4 w-4" /> You are currently offline. Controls may be disabled or delayed. Sensor data may be stale.
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-6 w-6 text-accent" />
              Room {room.id} Management
            </CardTitle>
            <CardDescription>Control your room environment and access. Guest: {room.guestName || 'N/A'}</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              {room.imageUrl && (
                <Image
                  data-ai-hint={aiHint}
                  src={room.imageUrl}
                  alt={`Image of Room ${room.id}`}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover aspect-video shadow-md"
                  priority // Prioritize loading if it's a key image
                />
              )}
               <SensorDisplay room={room} />
            </div>
            <div className="md:col-span-2">
                <RoomControls room={room} onStateChange={handleRoomStateChange} isOffline={isOffline} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-accent" />
              Controller Information
            </CardTitle>
            <CardDescription>Details about the room's control unit. {room.id === "ROOM_19" ? "(This is ROOM_19's controller)" : ""}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={fetchControllerInfo} disabled={loadingControllerInfo || isOffline}>
              {loadingControllerInfo ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Info className="mr-2 h-4 w-4" />
              )}
              {loadingControllerInfo ? 'Fetching...' : 'Get Controller Info'}
            </Button>
            {controllerInfo && (
              <ul className="mt-4 space-y-2 text-sm p-4 border rounded-md bg-muted/50">
                <li className="flex items-center">
                  <Network className="h-4 w-4 mr-2 text-muted-foreground" />
                  <strong>IP Address:</strong><span className="ml-1">{controllerInfo.ipAddress}</span>
                </li>
                <li className="flex items-center">
                  <Fingerprint className="h-4 w-4 mr-2 text-muted-foreground" />
                  <strong>MAC Address:</strong><span className="ml-1">{controllerInfo.macAddress}</span>
                </li>
                <li className="flex items-center">
                  <Bluetooth className="h-4 w-4 mr-2 text-muted-foreground" />
                  <strong>BLE Name:</strong><span className="ml-1">{controllerInfo.bleName}</span>
                </li>
                <li className="flex items-center">
                  <KeyRound className="h-4 w-4 mr-2 text-muted-foreground" />
                  <strong>Token:</strong><span className="ml-1">{controllerInfo.token}</span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

      </div>
    </AuthGuard>
  );
}
