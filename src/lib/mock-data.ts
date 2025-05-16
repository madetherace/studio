import type { Room, Booking } from '@/types';

export const mockRooms: Room[] = [
  {
    id: 'room-101',
    name: 'Sunset View Suite',
    capacity: 2,
    amenities: ['King Bed', 'Ocean View', 'Balcony', 'Wi-Fi'],
    pricePerNight: 250,
    imageUrl: 'https://placehold.co/600x400/6A44B8/F5F0FF.png',
    status: 'available',
    powerOn: true,
    lightsOn: true,
  },
  {
    id: 'room-102',
    name: 'Garden Retreat Deluxe',
    capacity: 3,
    amenities: ['Queen Bed', 'Garden View', 'Mini Bar', 'Wi-Fi'],
    pricePerNight: 180,
    imageUrl: 'https://placehold.co/600x400/34196B/F5F0FF.png',
    status: 'occupied',
    powerOn: true,
    lightsOn: false,
  },
  {
    id: 'room-201',
    name: 'City Lights King',
    capacity: 2,
    amenities: ['King Bed', 'City View', 'Workspace', 'Wi-Fi'],
    pricePerNight: 220,
    imageUrl: 'https://placehold.co/600x400/8A5CDE/F5F0FF.png',
    status: 'maintenance',
    powerOn: false,
    lightsOn: false,
  },
  {
    id: 'room-202',
    name: 'Cozy Twin Haven',
    capacity: 2,
    amenities: ['Two Twin Beds', 'Quiet Zone', 'Wi-Fi'],
    pricePerNight: 150,
    imageUrl: 'https://placehold.co/600x400/5A2AA0/F5F0FF.png',
    status: 'available',
    powerOn: true,
    lightsOn: true,
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    roomId: 'room-102',
    roomName: 'Garden Retreat Deluxe',
    userId: 'guest1',
    checkInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    guests: 2,
    totalPrice: 180 * 5,
  },
];
