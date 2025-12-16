import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, loginUser, createUser } from '@/lib/nocodb';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('secretsanta_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const foundUser = await loginUser(email, password);
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }
    setUser(foundUser);
    localStorage.setItem('secretsanta_user', JSON.stringify(foundUser));
  };

  const signup = async (email: string, password: string) => {
    const newUser = await createUser(email, password);
    setUser(newUser);
    localStorage.setItem('secretsanta_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('secretsanta_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
