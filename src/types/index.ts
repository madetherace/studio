
export interface User {
  id: string;
  username: string; // Changed from name to username as per spec
  token: string;
  role: 'guest' | 'admin';
  roomId?: string; // For guest, after booking
  bookingDate?: string; // For guest, after booking
}

export interface Room {
  id: string; // e.g., "ROOM_19", "102"
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
  pricePerNight?: number;
  capacity?: number;
  amenities?: string[];
  imageUrl?: string;
}

export interface Booking {
  id: string;
  guestName: string;
  checkInDate: string;
  roomId: string;
  userId: string;
}

// For controller interactions
export enum ControllerCommandType {
  GET_INFO = 'get_info',
  GET_STATE = 'get_state',
  SET_STATE = 'set_state',
  ADMIN_TURN_OFF_ALL_LIGHTS = 'admin_turn_off_all_lights', // New admin command
}

// Message structure for WebSocket communication with the bridge
export interface WebSocketMessage {
  messageId?: string; // Optional: for correlating requests and responses
  roomId?: string; // Can be null for general commands like get_info for the bridge itself
  command: ControllerCommandType;
  payload?: any; // Specific to the command
  token?: string; // For authentication with the bridge/controller
}

export interface WebSocketResponse {
  messageId?: string;
  roomId?: string;
  success: boolean;
  data?: Partial<Room> | ControllerInfo | any; // Flexible data structure
  error?: string;
}

export interface ControllerStateUpdate {
  lightsOn?: boolean;
  doorLocked?: boolean;
  channel1On?: boolean;
  channel2On?: boolean;
  // Can also include sensor values if SET_STATE is used to simulate sensor changes (less common)
}

export interface ControllerInfo {
  macAddress: string;
  ipAddress: string;
  bleName: string;
  token: string; // This is the controller's own token it might provide
}

// Enum for communication channel preference
export enum CommunicationChannel {
  WEBSOCKET = 'websocket',
  BLUETOOTH = 'bluetooth',
}
