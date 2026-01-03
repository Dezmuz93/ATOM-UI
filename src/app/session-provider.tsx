
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type ViewMode = 'focused' | 'tactical' | 'assistant';

interface SessionContextType {
  isLoggedIn: boolean;
  isBooting: boolean;
  login: (apiUrl: string) => void;
  logout: () => void;
  setHasBooted: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('focused');
  const router = useRouter();

  useEffect(() => {
    const apiUrl = localStorage.getItem('atom_api_url');
    const savedViewMode = localStorage.getItem('atom_default_view_mode') as ViewMode | null;

    if (savedViewMode && ['focused', 'tactical', 'assistant'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
    
    if (apiUrl) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setIsBooting(true); // Reset boot status if logged out
    }
  }, []);

  const login = (apiUrl: string) => {
    localStorage.setItem('atom_api_url', apiUrl);
    setIsLoggedIn(true);
    setIsBooting(true); // Always start booting sequence after login
  };

  const logout = () => {
    localStorage.removeItem('atom_api_url');
    setIsLoggedIn(false);
    setIsBooting(true);
    router.push('/');
  };

  const setHasBooted = () => {
    setIsBooting(false);
  };

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
  }

  return (
    <SessionContext.Provider value={{ isLoggedIn, isBooting, login, logout, setHasBooted, viewMode, setViewMode: handleSetViewMode }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
