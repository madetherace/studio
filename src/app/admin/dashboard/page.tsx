
"use client";

import type { Room } from '@/types';
import React, { useState, useEffect } from 'react';
import { RoomStatusTable } from '@/components/admin/room-status-table';
import { VacancyChart } from '@/components/admin/vacancy-chart';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load rooms from localStorage
    try {
      const storedRooms = localStorage.getItem('eleon-rooms');
      if (storedRooms) {
        setRooms(JSON.parse(storedRooms));
      } else {
        // Initialize if not present - AuthGuard should handle this, but as a fallback:
        // import { mockRooms as defaultMockRooms } from '@/lib/mock-data';
        // localStorage.setItem('eleon-rooms', JSON.stringify(defaultMockRooms));
        // setRooms(defaultMockRooms);
        console.warn("No rooms found in localStorage during admin dashboard load.");
        setRooms([]);
      }
    } catch (error) {
      console.error("Failed to load rooms from localStorage", error);
      toast({ title: "Error", description: "Could not load room data.", variant: "destructive"});
      setRooms([]);
    }
    setLoading(false);
  }, [toast]);

  const updateRoomInStateAndStorage = (updatedRoom: Room) => {
    const newRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
    setRooms(newRooms);
    try {
      localStorage.setItem('eleon-rooms', JSON.stringify(newRooms));
    } catch (error) {
      console.error("Failed to save rooms to localStorage", error);
      toast({ title: "Storage Error", description: "Could not save room changes.", variant: "destructive"});
    }
  };

  const handleToggleLights = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      updateRoomInStateAndStorage({ ...room, lightsOn: !room.lightsOn });
    }
  };

  const handleTogglePower = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      // If power is turned off, lights should also turn off.
      // If power is turned on, lights remain in their previous state (or default to on, based on policy).
      // For this demo, if power is off, lights are off. If power turns on, lights state is maintained (or default to true if previously off).
      const newPowerState = !room.powerOn;
      const newLightsState = newPowerState ? room.lightsOn : false; // Lights off if power is off
      updateRoomInStateAndStorage({ ...room, powerOn: newPowerState, lightsOn: newLightsState });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Admin Dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
      
      <section>
        <VacancyChart rooms={rooms} />
      </section>

      <section>
        <RoomStatusTable 
          rooms={rooms} 
          onToggleLights={handleToggleLights}
          onTogglePower={handleTogglePower}
        />
      </section>
       {rooms.length === 0 && !loading && (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-lg shadow">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold">No Room Data Found</h2>
          <p>The system could not retrieve any room information. Please check configurations or contact support.</p>
        </div>
      )}
    </div>
  );
}
