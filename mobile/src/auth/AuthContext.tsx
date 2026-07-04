import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, login as apiLogin, signup as apiSignup } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';
import { User } from '../types';
import { clearToken, getToken, setToken } from './tokenStorage';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadSession() {
    const token = await getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      await clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    loadSession();
    return () => setUnauthorizedHandler(null);
  }, []);

  async function login(email: string, password: string) {
    const tokens = await apiLogin(email, password);
    await setToken(tokens.access_token);
    const me = await getMe();
    setUser(me);
  }

  async function signup(email: string, password: string) {
    const tokens = await apiSignup(email, password);
    await setToken(tokens.access_token);
    const me = await getMe();
    setUser(me);
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
