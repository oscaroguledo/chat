import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    // TODO: Replace with actual API call
    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email,
      token: 'mock-jwt-token',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
    };
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    // TODO: Replace with actual API call
    const mockUser: User = {
      id: '1',
      name,
      email,
      token: 'mock-jwt-token',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
    };
    setUser(mockUser);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
