

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe, logout as apiLogout } from '@/lib/api';

interface User {
  id:        string;
  email:     string;
  name:      string;
  avatar?:   string;
  createdAt: string;
}

interface AuthContextType {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  logout:          () => Promise<void>;
  refetch:         () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    try {
     
      const res = await getMe();
      setUser(res.user);
    } catch {
     
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
    
      await apiLogout();
    } catch {
  
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout:  handleLogout,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
