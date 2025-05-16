
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'admin';
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  amenities: string[];
  pricePerNight: number;
  imageUrl: string;
  status: 'available' | 'occupied' | 'maintenance';
  powerOn: boolean;
  lightsOn: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName?: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
}
