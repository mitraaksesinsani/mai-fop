'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const DEFAULT_ADMIN_USER: User = {
  id: 'ec0a5b9c-1e1c-4c32-854d-6884336e58a7',
  email: 'admin@mai.co.id',
  name: 'Admin Proper (Super Administrator)',
  role: 'ADMIN'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nims_token');
    const savedUser = localStorage.getItem('nims_user');
    if (savedToken && savedUser && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        // Migrasi jika nama masih teks lama "Admin FOPLP"
        if (parsed?.name === 'Admin FOPLP' || parsed?.id === '1') {
          setUser(DEFAULT_ADMIN_USER);
          localStorage.setItem('nims_user', JSON.stringify(DEFAULT_ADMIN_USER));
        } else {
          setUser(parsed);
        }
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('nims_token');
        localStorage.removeItem('nims_user');
        setUser(DEFAULT_ADMIN_USER);
        setToken('nims_session_active');
      }
    } else {
      // Default session untuk kemudahan eksplorasi
      setUser(DEFAULT_ADMIN_USER);
      setToken('nims_session_active');
      localStorage.setItem('nims_token', 'nims_session_active');
      localStorage.setItem('nims_user', JSON.stringify(DEFAULT_ADMIN_USER));
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Verifikasi langsung ke database Supabase tabel 'users'
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', cleanId)
          .maybeSingle();

        if (!error && data) {
          if (data.password === password) {
            const userVal: User = {
              id: data.id,
              email: `${data.username}@mai.co.id`,
              name: data.name || data.fullName || 'Admin Proper',
              role: data.role || 'ADMIN'
            };
            const tokenVal = `supabase_auth_${data.id}_${Date.now()}`;
            setToken(tokenVal);
            setUser(userVal);
            localStorage.setItem('nims_token', tokenVal);
            localStorage.setItem('nims_user', JSON.stringify(userVal));
            return;
          } else {
            throw new Error('Password yang dimasukkan salah.');
          }
        }
      } catch (err: any) {
        if (err.message === 'Password yang dimasukkan salah.') throw err;
        console.warn('Supabase auth notice, checking local fallback:', err);
      }
    }

    // 2. Fallback jika offline atau username admin lokal
    if ((cleanId === 'admin' || cleanId === 'admin@mai.co.id' || cleanId === 'admin@foplp.com') && (password === 'admin123' || password === 'admin')) {
      const userVal = DEFAULT_ADMIN_USER;
      const tokenVal = 'auth_token_admin_local';
      setToken(tokenVal);
      setUser(userVal);
      localStorage.setItem('nims_token', tokenVal);
      localStorage.setItem('nims_user', JSON.stringify(userVal));
      return;
    }

    // 3. Fallback mock API
    try {
      const { data } = await api.post('/api/auth/login', { email: identifier, password });
      const tokenVal = data?.accessToken || 'dummy_token_123';
      const userVal = data?.user || DEFAULT_ADMIN_USER;
      setToken(tokenVal);
      setUser(userVal);
      localStorage.setItem('nims_token', tokenVal);
      localStorage.setItem('nims_user', JSON.stringify(userVal));
    } catch (error) {
      throw new Error('Username/email atau password salah.');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nims_token');
    localStorage.removeItem('nims_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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

