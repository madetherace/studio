
"use client";

import type { Booking, Room } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import React, { useState, useEffect } from 'react';
import { RoomReservationForm } from '@/components/guest/room-reservation-form';
import { BookingDetails } from '@/components/guest/booking-details';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Hotel, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GuestDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [associatedRoom, setAssociatedRoom] = useState<Room | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
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
    if (authLoading || !user) return;

    const loadBookingData = () => {
      setIsLoadingBooking(true);
      try {
        const storedBooking = localStorage.getItem('eleon-guest-booking');
        const storedRoomsString = localStorage.getItem('eleon-rooms');

        if (storedBooking) {
          const booking: Booking = JSON.parse(storedBooking);
          setActiveBooking(booking);

          if (storedRoomsString) {
            const allRooms: Room[] = JSON.parse(storedRoomsString);
            const room = allRooms.find(r => r.id === booking.roomId);
            if (room) {
              setAssociatedRoom(room);
            } else {
              toast({ title: "Error", description: "Booked room details not found.", variant: "destructive"});
            }
          }
        } else {
          setActiveBooking(null);
          setAssociatedRoom(null);
        }
      } catch (error) {
        console.error("Failed to load booking data from localStorage", error);
        toast({ title: "Error", description: "Could not load your booking information.", variant: "destructive"});
        setActiveBooking(null);
        setAssociatedRoom(null);
      }
      setIsLoadingBooking(false);
    };
    
    loadBookingData();
  }, [user, authLoading, toast]);

  const handleBookingConfirmed = (booking: Booking) => {
    try {
      localStorage.setItem('eleon-guest-booking', JSON.stringify(booking));
      setActiveBooking(booking);
      
      // Update room status in localStorage
      const storedRoomsString = localStorage.getItem('eleon-rooms');
      if (storedRoomsString) {
        let allRooms: Room[] = JSON.parse(storedRoomsString);
        allRooms = allRooms.map(r => r.id === booking.roomId ? { ...r, status: 'occupied' } : r);
        localStorage.setItem('eleon-rooms', JSON.stringify(allRooms));
        const room = allRooms.find(r => r.id === booking.roomId);
        if (room) setAssociatedRoom(room);
      }
    } catch (error) {
      console.error("Failed to save booking or update room status", error);
      toast({ title: "Storage Error", description: "Could not save your booking.", variant: "destructive"});
    }
  };

  const handleCheckout = (bookingId: string) => {
    if (isOffline) {
      toast({ title: "Offline", description: "Checkout requires an internet connection.", variant: "destructive"});
      return;
    }
    try {
      localStorage.removeItem('eleon-guest-booking');
      
      // Update room status to available
      const storedRoomsString = localStorage.getItem('eleon-rooms');
      if (storedRoomsString && activeBooking) {
        let allRooms: Room[] = JSON.parse(storedRoomsString);
        allRooms = allRooms.map(r => r.id === activeBooking.roomId ? { ...r, status: 'available', lightsOn: true, powerOn: true } : r); // Reset room state
        localStorage.setItem('eleon-rooms', JSON.stringify(allRooms));
      }

      setActiveBooking(null);
      setAssociatedRoom(null);
      toast({ title: "Checked Out", description: "You have successfully checked out." });
    } catch (error) {
      console.error("Failed to checkout", error);
      toast({ title: "Checkout Error", description: "Could not process your checkout.", variant: "destructive"});
    }
  };

  const handleRoomControlChange = (roomId: string, controlType: 'lights' | 'power', value: boolean) => {
    if (isOffline) {
        toast({ title: "Offline", description: "Controls cannot be changed while offline.", variant: "destructive"});
        return; // Prevent changes if offline, RoomControls component also has this logic
    }
    
    setAssociatedRoom(prevRoom => {
      if (!prevRoom || prevRoom.id !== roomId) return prevRoom;
      const updatedRoom = { ...prevRoom, [controlType === 'lights' ? 'lightsOn' : 'powerOn']: value };
      
      // Update localStorage for rooms
      const storedRoomsString = localStorage.getItem('eleon-rooms');
      if (storedRoomsString) {
        try {
          let allRooms: Room[] = JSON.parse(storedRoomsString);
          allRooms = allRooms.map(r => r.id === roomId ? updatedRoom : r);
          localStorage.setItem('eleon-rooms', JSON.stringify(allRooms));
        } catch (error) {
          console.error("Failed to update room controls in localStorage", error);
          toast({ title: "Storage Error", description: "Could not save room control changes.", variant: "destructive"});
          return prevRoom; // Revert if storage fails
        }
      }
      return updatedRoom;
    });
  };


  if (authLoading || isLoadingBooking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {isOffline && (
        <Card className="mb-6 bg-destructive/10 border-destructive text-destructive-foreground">
            <CardContent className="p-4 flex items-center gap-2">
                <WifiOff className="h-5 w-5" />
                <p>You are currently offline. Functionality may be limited. Your booking details are loaded from local cache.</p>
            </CardContent>
        </Card>
      )}

      {activeBooking && associatedRoom ? (
        <BookingDetails 
            booking={activeBooking} 
            room={associatedRoom} 
            onCheckout={handleCheckout}
            onControlChange={handleRoomControlChange}
        />
      ) : (
        <div className="flex flex-col items-center">
            <Hotel className="h-20 w-20 text-primary mb-6" />
            <h2 className="text-3xl font-semibold text-center mb-4">No Active Reservation</h2>
            <p className="text-muted-foreground text-center mb-8">
              It looks like you don't have an active booking. <br/>Let's find you the perfect room for your stay.
            </p>
            <RoomReservationForm onBookingConfirmed={handleBookingConfirmed} />
        </div>
      )}
    </div>
  );
}
