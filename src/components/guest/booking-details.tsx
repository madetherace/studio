
"use client";

import type { Booking, Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { CalendarDays, Users, BedDouble, DollarSign, LogOut, DoorOpen, Lightbulb, WifiOff, Zap } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { RoomControls } from './room-controls';

interface BookingDetailsProps {
  booking: Booking;
  room: Room;
  onCheckout: (bookingId: string) => void;
  onControlChange: (roomId: string, controlType: 'lights' | 'power', value: boolean) => void;
}

export function BookingDetails({ booking, room, onCheckout, onControlChange }: BookingDetailsProps) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus(); // Initial check

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
            <Image 
              src={room.imageUrl} 
              alt={room.name} 
              width={800} 
              height={600} 
              className="object-cover w-full h-64 md:h-full" 
              data-ai-hint="hotel room interior"
            />
          </div>
          <div className="md:w-1/2">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl text-primary">{room.name}</CardTitle>
              <CardDescription className="text-md">Your active reservation details.</CardDescription>
              {isOffline && (
                <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                    <WifiOff className="h-4 w-4" /> You are currently offline. Some features may be limited.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-lg">
                <CalendarDays className="h-5 w-5 text-accent" />
                <span>{format(new Date(booking.checkInDate), "PPP")} to {format(new Date(booking.checkOutDate), "PPP")}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <Users className="h-5 w-5 text-accent" />
                <span>{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <BedDouble className="h-5 w-5 text-accent" />
                <span>{room.name} (Capacity: {room.capacity})</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <DollarSign className="h-5 w-5 text-accent" />
                <span>Total: ${booking.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => onCheckout(booking.id)} variant="destructive" className="w-full md:w-auto" disabled={isOffline}>
                <LogOut className="mr-2 h-4 w-4" /> Simulate Check-out
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>

      <RoomControls 
        roomId={room.id} 
        initialLightsOn={room.lightsOn} 
        initialPowerOn={room.powerOn} 
        isOffline={isOffline}
        onControlChange={onControlChange}
      />
    </div>
  );
}
