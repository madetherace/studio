
"use client";

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

interface RoomReservationFormProps {
  onBookingConfirmed: (booking: Booking) => void;
}

export function RoomReservationForm({ onBookingConfirmed }: RoomReservationFormProps) {
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
    // Load rooms from localStorage
    const storedRooms = localStorage.getItem('eleon-rooms');
    if (storedRooms) {
      try {
        const parsedRooms: Room[] = JSON.parse(storedRooms);
        setAvailableRooms(parsedRooms.filter(room => room.status === 'available'));
      } catch (error) {
        console.error("Failed to parse rooms from localStorage", error);
        setAvailableRooms([]); // Fallback to empty or default mock data
      }
    } else {
      // Fallback if localStorage is empty (should be initialized by AuthGuard)
      setAvailableRooms([]);
    }
  }, []);

  const selectedRoom = availableRooms.find(room => room.id === selectedRoomId);

  const handleBooking = () => {
    if (!dateRange?.from || !dateRange?.to || !selectedRoom || !user) {
      toast({
        title: "Incomplete Information",
        description: "Please select dates, a room, and ensure you are logged in.",
        variant: "destructive",
      });
      return;
    }

    if (guests > selectedRoom.capacity) {
       toast({
        title: "Too many guests",
        description: `This room can only accommodate ${selectedRoom.capacity} guests.`,
        variant: "destructive",
      });
      return;
    }
    
    const nights = differenceInCalendarDays(dateRange.to, dateRange.from);
    if (nights <= 0) {
      toast({
        title: "Invalid Date Range",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }
    const totalPrice = nights * selectedRoom.pricePerNight;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      userId: user.id,
      checkInDate: format(dateRange.from, 'yyyy-MM-dd'),
      checkOutDate: format(dateRange.to, 'yyyy-MM-dd'),
      guests,
      totalPrice,
    };

    onBookingConfirmed(newBooking);
    toast({
      title: "Booking Confirmed!",
      description: `You've successfully booked ${selectedRoom.name}.`,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Reserve Your Stay</CardTitle>
        <CardDescription>Select your dates and preferred room to make a reservation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="date-range" className="mb-2 block">Select Dates</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-range"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="guests" className="mb-2 block">Number of Guests</Label>
          <Input 
            id="guests" 
            type="number" 
            min="1" 
            value={guests} 
            onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value)))}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="room-select" className="mb-2 block">Select Room</Label>
          <Select onValueChange={setSelectedRoomId} value={selectedRoomId}>
            <SelectTrigger id="room-select" className="w-full">
              <SelectValue placeholder="Choose a room..." />
            </SelectTrigger>
            <SelectContent>
              {availableRooms.map((room) => (
                <SelectItem key={room.id} value={room.id} disabled={room.status !== 'available' || guests > room.capacity}>
                   <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    <span>{room.name} (Capacity: {room.capacity}, ${room.pricePerNight}/night)</span>
                    {room.status !== 'available' && <span className="text-xs text-destructive ml-auto"> (Unavailable)</span>}
                    {guests > room.capacity && <span className="text-xs text-destructive ml-auto"> (Exceeds capacity)</span>}
                   </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRoom && (
          <Card className="bg-secondary/50 p-4 rounded-md">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">{selectedRoom.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-muted-foreground space-y-2">
               <Image src={selectedRoom.imageUrl} alt={selectedRoom.name} width={600} height={400} className="rounded-md aspect-video object-cover mb-2" data-ai-hint="hotel room" />
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Capacity: {selectedRoom.capacity} guests</p>
              <p className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Price: ${selectedRoom.pricePerNight} / night</p>
              <p>Amenities: {selectedRoom.amenities.join(', ')}</p>
              {dateRange?.from && dateRange?.to && (
                <p className="font-semibold text-foreground">
                  Total Price for {differenceInCalendarDays(dateRange.to, dateRange.from)} nights: 
                  ${differenceInCalendarDays(dateRange.to, dateRange.from) * selectedRoom.pricePerNight}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleBooking} disabled={!selectedRoomId || !dateRange?.from || !dateRange?.to} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Confirm Reservation
        </Button>
      </CardFooter>
    </Card>
  );
}
