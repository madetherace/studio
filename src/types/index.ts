
export interface User {
  id: string;
  username: string; // Changed from name to username as per spec
  token: string;
  role: 'guest' | 'admin';
  roomId?: string; // For guest, after booking
  bookingDate?: string; // For guest, after booking
}

export interface Room {
  id: string; // e.g., "101", "102"
  status: 'available' | 'occupied' | 'maintenance';
  guestName?: string;
  // Room state for control panel
  lightsOn: boolean;
  doorLocked: boolean;
  channel1On: boolean;
  channel2On: boolean;
  // Sensor data
  temperature?: number;
  humidity?: number;
  pressure?: number;
  // For booking form
  pricePerNight?: number; // Assuming rooms might have prices
  capacity?: number; // Assuming rooms have capacity
  amenities?: string[];
  imageUrl?: string;
}

export interface Booking {
  id: string;
  guestName: string;
  checkInDate: string;
  roomId: string;
  userId: string;
  // Additional booking details can be added here
}

// For controller interactions - conceptual
export enum ControllerCommandType {
  GET_INFO = 'get_info',
  GET_STATE = 'get_state',
  SET_STATE = 'set_state',
}

export interface ControllerStateUpdate {
  lightsOn?: boolean;
  doorLocked?: boolean;
  channel1On?: boolean;
  channel2On?: boolean;
}
