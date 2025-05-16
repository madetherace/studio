
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } 
from 'next/navigation';
import { mockUsers, initializeMockRooms } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const USER_STORAGE_KEY = 'pwa-hotel-user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeMockRooms(); // Initialize mock room data on app load
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call & hardcoded user check
    await new Promise(resolve => setTimeout(resolve, 500));
    // Corrected password check:
    const foundUser = mockUsers.find(u => u.username === username && pass === 'password');

    if (foundUser) {
      // Use a simplified user object from mockUsers, then generate a new token
      const baseUser: User = { 
        id: foundUser.id, 
        username: foundUser.username, 
        role: foundUser.role, 
        token: `${foundUser.role}-token-${Date.now()}` // Generate a new mock token
        // roomId and bookingDate will be set upon actual booking for guests
      };
      
      // If the mock user has a roomId (e.g. for pre-booked demo), include it.
      // This isn't in the current mockUsers structure but could be added if needed.
      // For now, roomId is typically added after a booking action.
      if (foundUser.roomId) {
        baseUser.roomId = foundUser.roomId;
      }
      
      setUser(baseUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(baseUser));
      } catch (error) {
        console.error("Failed to save user to localStorage", error);
      }
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      // Optionally clear other app-specific localStorage items like bookings
      localStorage.removeItem('pwa-hotel-guest-booking');
      localStorage.removeItem('pwa-hotel-rooms'); // Reset rooms on logout for fresh demo
      initializeMockRooms(); // Re-initialize for next login
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
