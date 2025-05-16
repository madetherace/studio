
"use client";
// This component is not directly used in the new PWA flow.
// Room management is handled by /room/[roomId]/page.tsx which uses RoomControls and SensorDisplay.
// Keeping for reference or if a dedicated "booking summary" view is needed later.

import type { Booking, Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { CalendarDays, Users, BedDouble, DollarSign, LogOut, WifiOff } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
// import { RoomControls } from './RoomControls'; // RoomControls is now part of the page

interface OldBookingDetailsProps {
  booking: Booking;
  room: Room; // Assuming full room details are passed
  onCheckout: (bookingId: string) => void;
  // onControlChange: (roomId: string, controlType: 'lights' | 'power', value: boolean) => void;
}

export function BookingDetails({ booking, room, onCheckout }: OldBookingDetailsProps) {
  const [isOffline, setIsOffline] = useState(false);

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

  return (
    <div className="space-y-8">
      <Card className="w-full shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
             {room.imageUrl && <Image 
              src={room.imageUrl} 
              alt={room.id || "Room image"} 
              width={800} 
              height={600} 
              className="object-cover w-full h-64 md:h-full" 
              data-ai-hint="hotel room"
            />}
          </div>
          <div className="md:w-1/2">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl text-primary">Room {room.id}</CardTitle>
              <CardDescription className="text-md">Your active reservation details.</CardDescription>
              {isOffline && (
                <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                    <WifiOff className="h-4 w-4" /> You are currently offline.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-lg">
                <CalendarDays className="h-5 w-5 text-accent" />
                <span>Checked in: {format(new Date(booking.checkInDate), "PPP")}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <Users className="h-5 w-5 text-accent" />
                <span>Guest: {booking.guestName}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <BedDouble className="h-5 w-5 text-accent" />
                <span>Room {booking.roomId} (Capacity: {room.capacity || 'N/A'})</span>
              </div>
              {/* Price might not be in Booking if it's dynamic */}
            </CardContent>
            <CardFooter>
              <Button onClick={() => onCheckout(booking.id)} variant="destructive" className="w-full md:w-auto" disabled={isOffline}>
                <LogOut className="mr-2 h-4 w-4" /> Simulate Check-out
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>

      {/* RoomControls and SensorDisplay are now directly in the /room/[roomId]/page.tsx */}
      {/* <RoomControls 
        room={room} 
        onStateChange={onControlChange} // This would need to be adapted
        isOffline={isOffline}
      /> */}
    </div>
  );
}
