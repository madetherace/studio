
"use client";

import type { Room, Booking, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { CalendarIcon, User as UserIcon, BedDouble, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getMockRooms, updateMockRoom } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export function BookingForm() {
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [guestName, setGuestName] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { user, login } = useAuth(); // Using login to update user context with roomId
  const router = useRouter();

  useEffect(() => {
    const rooms = getMockRooms().filter(room => room.status === 'available');
    setAvailableRooms(rooms);
    if (user?.username) {
      setGuestName(user.username);
    }
    setLoadingRooms(false);
  }, [user]);

  const selectedRoomDetails = availableRooms.find(room => room.id === selectedRoomId);

  const handleBooking = async () => {
    if (!checkInDate || !selectedRoomId || !guestName.trim() || !user) {
      toast({
        title: "Incomplete Information",
        description: "Please provide all booking details.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const roomToBook = getMockRooms().find(r => r.id === selectedRoomId);
    if (!roomToBook || roomToBook.status !== 'available') {
        toast({ title: "Booking Failed", description: "Selected room is no longer available.", variant: "destructive" });
        setAvailableRooms(getMockRooms().filter(room => room.status === 'available')); // Refresh room list
        setIsSubmitting(false);
        return;
    }


    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      roomId: selectedRoomId,
      guestName: guestName,
      checkInDate: format(checkInDate, 'yyyy-MM-dd'),
      userId: user.id,
    };

    // Update room status in mock data
    updateMockRoom({ ...roomToBook, status: 'occupied', guestName: guestName });

    // Update user context with roomId and bookingDate
    const updatedUser: User = { ...user, roomId: selectedRoomId, bookingDate: newBooking.checkInDate };
    // This is a bit of a hack for the demo. Ideally, login function or a dedicated updateUser context function handles this.
    // For simplicity, re-setting the user in localStorage and relying on AuthProvider to pick it up.
    localStorage.setItem('pwa-hotel-user', JSON.stringify(updatedUser));
    // Manually trigger a re-evaluation or provide an updateUser method in AuthContext
    // As a quick fix, we can call login again with the same credentials if we stored them, or just update the state.
    // The current login function in AuthContext does not support simply updating user fields.
    // For the demo, we will navigate and let AuthGuard potentially re-evaluate user from localStorage.

    // Simulate storing booking (e.g., in localStorage or IndexedDB for PWA)
    localStorage.setItem('pwa-hotel-guest-booking', JSON.stringify(newBooking));

    toast({
      title: "Booking Confirmed!",
      description: `Room ${selectedRoomId} booked for ${guestName}.`,
    });
    setIsSubmitting(false);
    router.push(`/room/${selectedRoomId}`);
  };

  if (loadingRooms) {
    return <div className="text-center p-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /> <p>Loading rooms...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="guestName">Guest Name</Label>
        <Input
          id="guestName"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Enter your name"
          disabled={!!user?.username} // Disable if pre-filled from user context
        />
      </div>

      <div>
        <Label htmlFor="checkInDate">Check-in Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="checkInDate"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !checkInDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkInDate ? format(checkInDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={checkInDate}
              onSelect={setCheckInDate}
              initialFocus
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="room-select">Select Room</Label>
        <Select onValueChange={setSelectedRoomId} value={selectedRoomId}>
          <SelectTrigger id="room-select" className="w-full">
            <SelectValue placeholder="Choose an available room..." />
          </SelectTrigger>
          <SelectContent>
            {availableRooms.length > 0 ? availableRooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  <span>Room {room.id} (Capacity: {room.capacity ?? 'N/A'}, ${room.pricePerNight ?? 'N/A'}/night)</span>
                </div>
              </SelectItem>
            )) : <SelectItem value="no-rooms" disabled>No rooms available</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {selectedRoomDetails && (
        <Card className="p-4 border-dashed">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-md">Selected: Room {selectedRoomDetails.id}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-sm text-muted-foreground space-y-1">
            {selectedRoomDetails.imageUrl && 
              <Image 
                data-ai-hint={selectedRoomDetails.id === 'ROOM_19' ? 'modern hotel room' : 'cozy hotel room'} 
                src={selectedRoomDetails.imageUrl} 
                alt={`Room ${selectedRoomDetails.id}`} 
                width={200} 
                height={125} 
                className="rounded-md aspect-video object-cover mb-2" 
              />
            }
            <p>Capacity: {selectedRoomDetails.capacity ?? 'N/A'} guests</p>
            <p>Price: ${selectedRoomDetails.pricePerNight ?? 'N/A'} / night</p>
            {selectedRoomDetails.amenities && <p>Amenities: {selectedRoomDetails.amenities.join(', ')}</p>}
          </CardContent>
        </Card>
      )}

      <Button onClick={handleBooking} disabled={!selectedRoomId || !checkInDate || !guestName.trim() || isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BedDouble className="mr-2 h-4 w-4" />}
        {isSubmitting ? 'Booking...' : 'Book Room'}
      </Button>
    </div>
  );
}
