import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { client } from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  organizationId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(AUTH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (token && userJson) {
        client.setToken(token);
        setUser(JSON.parse(userJson));
      }
    } catch {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    await client.authenticate(email, password);
    const me = await client.auth.me();

    const userData: User = {
      id: me.id,
      name: me.name,
      email: me.email,
      avatarUrl: me.avatarUrl,
      role: me.role,
      organizationId: me.organizationId,
    };

    const token = client.getToken();
    if (token) {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    }
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    client.clearTokens();
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
