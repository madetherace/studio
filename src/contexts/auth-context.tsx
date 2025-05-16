
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } // Corrected import for useRouter
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
    const foundUser = mockUsers.find(u => u.username === username && u.token.includes(pass)); // Simplified pass check for demo

    if (foundUser) {
      const userData: User = { ...foundUser, token: `${foundUser.role}-token-${Date.now()}` }; // Generate a mock token
      setUser(userData);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
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
