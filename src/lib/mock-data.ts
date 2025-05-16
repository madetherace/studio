
import type { Room, User } from '@/types';

export const mockUsers: User[] = [
  { id: 'admin-user', username: 'admin', token: 'admin-token-xxxx', role: 'admin' },
  { id: 'guest-user-1', username: 'testguest', token: 'guest-token-yyyy', role: 'guest' },
];

export const mockRoomsData: Room[] = [
  {
    id: 'ROOM_19', // Changed from '101' to match controller's BLE Name
    status: 'available',
    lightsOn: false,
    doorLocked: true,
    channel1On: false,
    channel2On: false,
    temperature: 22,
    humidity: 45,
    pressure: 1012,
    pricePerNight: 150,
    capacity: 2,
    amenities: ['Queen Bed', 'Wi-Fi', 'TV'],
    imageUrl: 'https://placehold.co/600x400.png', // data-ai-hint will be added by the client rendering this
  },
  {
    id: '102',
    status: 'occupied',
    guestName: 'Alice Wonderland',
    lightsOn: true,
    doorLocked: false,
    channel1On: true,
    channel2On: false,
    temperature: 23,
    humidity: 50,
    pressure: 1010,
    pricePerNight: 180,
    capacity: 2,
    amenities: ['King Bed', 'Wi-Fi', 'TV', 'Minibar'],
    imageUrl: 'https://placehold.co/600x400.png',
  },
  {
    id: '103',
    status: 'maintenance',
    lightsOn: false,
    doorLocked: true,
    channel1On: false,
    channel2On: false,
    pricePerNight: 120,
    capacity: 1,
    amenities: ['Single Bed', 'Wi-Fi'],
    imageUrl: 'https://placehold.co/600x400.png',
  },
];

// This function would ideally fetch from a backend or Zustand-like store
// For now, it simulates a simple in-memory store for rooms that can be updated
// This is a simplified approach. Zustand or React Context would be better for real state management.
let MOCK_ROOMS_STORE: Room[] = JSON.parse(JSON.stringify(mockRoomsData)); // Deep copy

export const getMockRooms = (): Room[] => {
  // Simulate fetching from localStorage if PWA offline features were more developed
  if (typeof localStorage !== 'undefined') {
    const storedRooms = localStorage.getItem('pwa-hotel-rooms');
    if (storedRooms) {
      try {
        return JSON.parse(storedRooms);
      } catch (e) {
        console.error("Failed to parse rooms from localStorage", e);
        // Fallback to initial mock if parsing fails
        localStorage.setItem('pwa-hotel-rooms', JSON.stringify(MOCK_ROOMS_STORE));
        return MOCK_ROOMS_STORE;
      }
    } else {
      localStorage.setItem('pwa-hotel-rooms', JSON.stringify(MOCK_ROOMS_STORE));
      return MOCK_ROOMS_STORE;
    }
  }
  return MOCK_ROOMS_STORE;
};

export const updateMockRoom = (updatedRoom: Room): void => {
  MOCK_ROOMS_STORE = MOCK_ROOMS_STORE.map(room => room.id === updatedRoom.id ? updatedRoom : room);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('pwa-hotel-rooms', JSON.stringify(MOCK_ROOMS_STORE));
  }
};

export const initializeMockRooms = () => {
  if (typeof localStorage !== 'undefined' && !localStorage.getItem('pwa-hotel-rooms')) {
    localStorage.setItem('pwa-hotel-rooms', JSON.stringify(mockRoomsData));
    MOCK_ROOMS_STORE = JSON.parse(JSON.stringify(mockRoomsData));
  } else if (typeof localStorage !== 'undefined') {
    // Ensure MOCK_ROOMS_STORE is in sync with localStorage on load
     try {
        MOCK_ROOMS_STORE = JSON.parse(localStorage.getItem('pwa-hotel-rooms') || JSON.stringify(mockRoomsData));
      } catch (e) {
        MOCK_ROOMS_STORE = JSON.parse(JSON.stringify(mockRoomsData));
      }
  }
};
