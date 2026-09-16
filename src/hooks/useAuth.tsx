'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { authenticateUserAction } from '@/app/actions/masterData';

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
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Akun bawaan sistem untuk operasional sehari-hari
export const INITIAL_AUTH_USERS = [
  {
    id: 'ec0a5b9c-1e1c-4c32-854d-6884336e58a7',
    username: 'admin',
    email: 'admin@mai.co.id',
    name: 'Admin Proper (Super Administrator)',
    password: 'admin123',
    role: 'ADMIN',
    status: 'ACTIVE'
  },
  {
    id: '7acef50a-f9df-4ab2-bc6b-d5f9ceda7d02',
    username: 'owner',
    email: 'owner@mai.co.id',
    name: 'Direktur Utama (Owner)',
    password: 'owner123',
    role: 'OWNER',
    status: 'ACTIVE'
  },
  {
    id: 'f2ae8c76-1065-41af-b892-4a7e76f6a990',
    username: 'sitemanager',
    email: 'sitemanager@mai.co.id',
    name: 'Budi Santoso, S.T.',
    password: 'sm12345',
    role: 'SITE MANAGER',
    status: 'ACTIVE'
  },
  {
    id: '711a15ba-aec0-462b-a994-0c3c7384dad1',
    username: 'management',
    email: 'management@mai.co.id',
    name: 'Dewi Lestari, S.E.',
    password: 'mgmt12345',
    role: 'MANAGEMENT',
    status: 'ACTIVE'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nims_token');
    const savedUser = localStorage.getItem('nims_user');

    // Bersihkan sesi mock lama (nims_session_active) jika sebelumnya tersimpan
    if (savedToken === 'nims_session_active') {
      localStorage.removeItem('nims_token');
      localStorage.removeItem('nims_user');
      document.cookie = 'nims_token=; path=/; max-age=0; SameSite=Lax';
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    if (savedToken && savedUser && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(savedToken);
        // Pastikan cookie sinkron untuk middleware server-side
        document.cookie = `nims_token=${savedToken}; path=/; max-age=2592000; SameSite=Lax`;
      } catch (e) {
        localStorage.removeItem('nims_token');
        localStorage.removeItem('nims_user');
        document.cookie = 'nims_token=; path=/; max-age=0; SameSite=Lax';
        setUser(null);
        setToken(null);
      }
    } else {
      // Tidak ada sesi aktif: user tetap null, harus login terlebih dahulu
      setUser(null);
      setToken(null);
      document.cookie = 'nims_token=; path=/; max-age=0; SameSite=Lax';
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string, rememberMe: boolean = true) => {
    const cleanId = identifier.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!cleanId || !trimmedPass) {
      throw new Error('Username/Email dan Password wajib diisi.');
    }

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 1;

    const saveSession = (userVal: User, tokenVal: string) => {
      setToken(tokenVal);
      setUser(userVal);
      localStorage.setItem('nims_token', tokenVal);
      localStorage.setItem('nims_user', JSON.stringify(userVal));
      document.cookie = `nims_token=${tokenVal}; path=/; max-age=${maxAge}; SameSite=Lax`;
    };

    // 1. Verifikasi kredensial via API Route /api/auth/login
    // Cara ini paling stabil untuk browser mobile (HP) karena menyetel cookie via HTTP header server-side
    // dan tidak terpengaruh batasan origin CORS Server Actions.
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: cleanId,
          password: trimmedPass,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.success && data?.user) {
        const userVal: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          avatar: data.user.avatar,
          phone: data.user.phone,
        };
        const tokenVal = data.token || `api_auth_${data.user.id}_${Date.now()}`;
        saveSession(userVal, tokenVal);
        return;
      } else if (!res.ok && data?.error) {
        if (
          data.error.includes('Password') ||
          data.error.includes('dinonaktifkan') ||
          data.error.includes('tidak ditemukan') ||
          data.error.includes('salah')
        ) {
          throw new Error(data.error);
        }
      }
    } catch (err: any) {
      if (
        err.message?.includes('Password') ||
        err.message?.includes('dinonaktifkan') ||
        err.message?.includes('tidak ditemukan') ||
        err.message?.includes('salah')
      ) {
        throw err;
      }
      console.warn('API auth notice, falling back to Server Action:', err);
    }

    // 2. Verifikasi kredensial via Server Action (terhubung ke Server Database terpusat & Supabase)
    try {
      const serverAuth = await authenticateUserAction(cleanId, trimmedPass);
      if (serverAuth.success && serverAuth.user) {
        const userVal: User = {
          id: serverAuth.user.id,
          email: serverAuth.user.email,
          name: serverAuth.user.name,
          role: serverAuth.user.role,
          avatar: serverAuth.user.avatar,
          phone: serverAuth.user.phone
        };
        const tokenVal = `server_auth_${serverAuth.user.id}_${Date.now()}`;
        saveSession(userVal, tokenVal);
        return;
      } else if (serverAuth.error && (serverAuth.error.includes('Password') || serverAuth.error.includes('dinonaktifkan'))) {
        throw new Error(serverAuth.error);
      }
    } catch (err: any) {
      if (err.message?.includes('Password') || err.message?.includes('dinonaktifkan')) {
        throw err;
      }
      console.warn('Server auth notice, fallback to direct client:', err);
    }

    // 2. Verifikasi langsung ke database Supabase tabel 'users' jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.ilike.${cleanId},email.ilike.${cleanId}`)
          .maybeSingle();

        if (!error && data) {
          if (data.status === 'INACTIVE') {
            throw new Error('Akun Anda dinonaktifkan. Silakan hubungi Administrator.');
          }
          if (data.password === trimmedPass) {
            const userVal: User = {
              id: data.id,
              email: data.email || `${data.username}@mai.co.id`,
              name: data.name || data.fullName || data.username,
              role: data.role || 'ADMIN',
              avatar: data.avatar,
              phone: data.phone
            };
            const tokenVal = `supabase_auth_${data.id}_${Date.now()}`;
            saveSession(userVal, tokenVal);
            return;
          } else {
            throw new Error('Password yang dimasukkan salah.');
          }
        }
      } catch (err: any) {
        if (err.message === 'Password yang dimasukkan salah.' || err.message?.includes('dinonaktifkan')) {
          throw err;
        }
        console.warn('Supabase auth notice, checking local user storage:', err);
      }
    }

    // 2. Verifikasi ke Master Data Pengguna lokal (foplp_master_users_v2)
    try {
      const storedUsersRaw = localStorage.getItem('foplp_master_users_v2');
      if (storedUsersRaw) {
        const userList = JSON.parse(storedUsersRaw);
        if (Array.isArray(userList)) {
          const found = userList.find((u: any) =>
            u.username?.toLowerCase() === cleanId ||
            u.email?.toLowerCase() === cleanId ||
            `${u.username?.toLowerCase()}@mai.co.id` === cleanId
          );

          if (found) {
            if (found.status === 'INACTIVE') {
              throw new Error('Akun Anda dinonaktifkan. Silakan hubungi Administrator.');
            }
            if (found.password === trimmedPass) {
              const userVal: User = {
                id: found.id,
                email: found.email || `${found.username}@mai.co.id`,
                name: found.fullName || found.name || found.username,
                role: found.role || 'ADMIN'
              };
              const tokenVal = `local_auth_${found.id}_${Date.now()}`;
              saveSession(userVal, tokenVal);
              return;
            } else {
              throw new Error('Password yang dimasukkan salah.');
            }
          }
        }
      }
    } catch (err: any) {
      if (err.message === 'Password yang dimasukkan salah.' || err.message?.includes('dinonaktifkan')) {
        throw err;
      }
    }

    // 3. Verifikasi ke Akun Bawaan Sistem (INITIAL_AUTH_USERS)
    const builtIn = INITIAL_AUTH_USERS.find((u) =>
      u.username.toLowerCase() === cleanId ||
      u.email.toLowerCase() === cleanId ||
      `${u.username.toLowerCase()}@mai.co.id` === cleanId ||
      (cleanId === 'admin@foplp.com' && u.username === 'admin')
    );

    if (builtIn) {
      if (builtIn.password === trimmedPass || (builtIn.username === 'admin' && trimmedPass === 'admin')) {
        const userVal: User = {
          id: builtIn.id,
          email: builtIn.email,
          name: builtIn.name,
          role: builtIn.role
        };
        const tokenVal = `builtin_auth_${builtIn.id}_${Date.now()}`;
        saveSession(userVal, tokenVal);
        return;
      } else {
        throw new Error('Password yang dimasukkan salah.');
      }
    }

    // 4. Fallback API route jika tersedia
    try {
      const { data } = await api.post('/api/auth/login', { email: identifier, password: trimmedPass });
      if (data?.accessToken && data?.user) {
        const tokenVal = data.accessToken;
        const userVal: User = {
          id: data.user.id || 'usr-api',
          email: data.user.email || `${cleanId}@mai.co.id`,
          name: data.user.name || cleanId,
          role: data.user.role || 'ADMIN'
        };
        saveSession(userVal, tokenVal);
        return;
      }
    } catch (e: any) {
      // Ignore API route error and fall through
    }

    throw new Error('Username atau email tidak terdaftar.');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nims_token');
    localStorage.removeItem('nims_user');
    document.cookie = 'nims_token=; path=/; max-age=0; SameSite=Lax';
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
