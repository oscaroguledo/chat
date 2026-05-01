import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  avatar?: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    token: string;
  };
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to get auth headers with Bearer token
  const getAuthHeaders = useCallback(() => {
    if (!user?.token) return {} as Record<string, string>;
    return { Authorization: `Bearer ${user.token}` } as Record<string, string>;
  }, [user]);

  // Check for stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({ ...parsedUser, token: storedToken });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result: LoginResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Login failed');
    }

    const userWithToken: User = {
      id: result.data.user.id,
      name: result.data.user.name,
      email: result.data.user.email,
      token: result.data.token,
      avatar: result.data.user.avatar
    };

    // Store in localStorage
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));

    setUser(userWithToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const result: LoginResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Registration failed');
    }

    const userWithToken: User = {
      id: result.data.user.id,
      name: result.data.user.name,
      email: result.data.user.email,
      token: result.data.token,
      avatar: result.data.user.avatar
    };

    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));

    setUser(userWithToken);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    getAuthHeaders
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
