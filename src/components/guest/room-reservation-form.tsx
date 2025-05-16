
"use client";
// This component is effectively replaced by BookingForm.tsx for the new PWA.
// Keeping for reference, but BookingForm.tsx should be used.

import type { Room, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { addDays, format, differenceInCalendarDays } from 'date-fns';
import { CalendarIcon, Users, BedDouble, DollarSign } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { useAuth } from '@/hooks/use-auth';

interface OldRoomReservationFormProps {
  onBookingConfirmed: (booking: Booking) => void;
}

export function RoomReservationForm({ onBookingConfirmed }: OldRoomReservationFormProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });
  const [guests, setGuests] = useState<number>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Example: Load rooms from a mock or localStorage
    // const storedRooms = localStorage.getItem('pwa-hotel-rooms');
    // if (storedRooms) {
    //   setAvailableRooms(JSON.parse(storedRooms).filter((r: Room) => r.status === 'available'));
    // }
    setAvailableRooms([]); // Placeholder
  }, []);

  const selectedRoom = availableRooms.find(room => room.id === selectedRoomId);

  const handleBooking = () => {
    if (!dateRange?.from || !dateRange?.to || !selectedRoom || !user) {
      toast({
        title: "Incomplete Information",
        variant: "destructive",
      });
      return;
    }
    // ... (rest of booking logic)
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Old Reserve Your Stay</CardTitle>
        <CardDescription>Select your dates and preferred room.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form fields would go here */}
         <p>This is the old reservation form. Please use BookingForm.tsx.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleBooking} disabled className="w-full">
          Confirm Reservation (Old)
        </Button>
      </CardFooter>
    </Card>
  );
}

