'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type BowheerCategory =
  | 'Telekomunikasi'
  | 'BUMN / Pemerintahan'
  | 'Perbankan / Finansial'
  | 'Enterprise / Swasta'
  | 'Lainnya';

export interface Bowheer {
  id: string;
  code: string;
  name: string;
  alias?: string;
  category: BowheerCategory;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export const INITIAL_BOWHEERS: Bowheer[] = [
  {
    id: 'bwh-1',
    code: 'TSEL',
    name: 'PT Telkomsel Tbk',
    alias: 'Telkomsel',
    category: 'Telekomunikasi',
    contactPerson: 'Bambang Sudibyo',
    email: 'procurement@telkomsel.co.id',
    phone: '021-5240123',
    address: 'Telkom Landmark Tower, Jl. Gatot Subroto No. 52, Jakarta Selatan',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bwh-2',
    code: 'ISAT',
    name: 'PT Indosat Tbk',
    alias: 'Indosat Ooredoo Hutchison',
    category: 'Telekomunikasi',
    contactPerson: 'Siti Sarah',
    email: 'project.delivery@indosatooredoo.com',
    phone: '021-30003001',
    address: 'Jl. Medan Merdeka Barat No. 21, Gambir, Jakarta Pusat',
    status: 'ACTIVE',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'bwh-3',
    code: 'EXCL',
    name: 'PT XL Axiata Tbk',
    alias: 'XL Axiata',
    category: 'Telekomunikasi',
    contactPerson: 'Hendro Prasetyo',
    email: 'vendor.management@xl.co.id',
    phone: '021-5761188',
    address: 'XL Axiata Tower, Jl. H. R. Rasuna Said Kav. 11-12, Kuningan, Jakarta Selatan',
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'bwh-4',
    code: 'FREN',
    name: 'PT Smartfren Telecom Tbk',
    alias: 'Smartfren',
    category: 'Telekomunikasi',
    contactPerson: 'Dimas Aditya',
    email: 'rollout@smartfren.com',
    phone: '021-50100000',
    address: 'Jl. H. Agus Salim No. 45, Kebon Sirih, Menteng, Jakarta Pusat',
    status: 'ACTIVE',
    createdAt: '2026-01-12T00:00:00.000Z',
  },
  {
    id: 'bwh-5',
    code: 'ICON',
    name: 'PT PLN Icon Plus',
    alias: 'Icon Plus',
    category: 'BUMN / Pemerintahan',
    contactPerson: 'Rahmat Hidayat',
    email: 'partnership@iconpln.co.id',
    phone: '021-5253000',
    address: 'Wisma Mulia Lt. 50, Jl. Jend. Gatot Subroto No. 42, Jakarta Selatan',
    status: 'ACTIVE',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'bwh-6',
    code: 'MORA',
    name: 'PT Mora Telematika Indonesia Tbk',
    alias: 'Moratelindo',
    category: 'Telekomunikasi',
    contactPerson: 'Fajar Nugraha',
    email: 'corporate@moratelindo.co.id',
    phone: '021-31998600',
    address: 'Graha 9, Jl. KH. Wahid Hasyim No. 9, Menteng, Jakarta Pusat',
    status: 'ACTIVE',
    createdAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'bwh-7',
    code: 'BMRI',
    name: 'Bank Mandiri',
    alias: 'Bank Mandiri (Persero) Tbk',
    category: 'Perbankan / Finansial',
    contactPerson: 'Tri Wahyuni',
    email: 'it.infrastructure@bankmandiri.co.id',
    phone: '021-5265000',
    address: 'Plaza Mandiri, Jl. Jend. Gatot Subroto Kav. 36-38, Jakarta Selatan',
    status: 'ACTIVE',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'bwh-8',
    code: 'FMI',
    name: 'PT Fiber Media Indonesia',
    alias: 'Fiber Media',
    category: 'Enterprise / Swasta',
    contactPerson: 'Agus Setiawan',
    email: 'info@fibermedia.co.id',
    phone: '021-29001234',
    address: 'Kawasan Industri Pulogadung, Jakarta Timur',
    status: 'ACTIVE',
    createdAt: '2026-02-10T00:00:00.000Z',
  },
];

const STORAGE_KEY = 'foplp_master_bowheer_v1';

interface BowheerContextType {
  bowheers: Bowheer[];
  activeBowheers: Bowheer[];
  isLoading: boolean;
  addBowheer: (data: Omit<Bowheer, 'id' | 'createdAt'>) => Bowheer;
  updateBowheer: (id: string, data: Partial<Omit<Bowheer, 'id' | 'createdAt'>>) => void;
  deleteBowheer: (id: string) => void;
  getBowheerById: (id: string) => Bowheer | undefined;
  getBowheerByName: (name: string) => Bowheer | undefined;
}

const BowheerContext = createContext<BowheerContextType | undefined>(undefined);

export function BowheerProvider({ children }: { children: ReactNode }) {
  const [bowheers, setBowheers] = useState<Bowheer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBowheers(parsed);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to read bowheer from localStorage:', e);
    }

    // Default fallback
    setBowheers(INITIAL_BOWHEERS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOWHEERS));
    } catch (e) { }
    setIsLoading(false);
  }, []);

  const saveToStorage = (data: Bowheer[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save bowheer to storage:', e);
    }
  };

  const addBowheer = (data: Omit<Bowheer, 'id' | 'createdAt'>) => {
    const newRecord: Bowheer = {
      ...data,
      id: `bwh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    setBowheers((prev) => {
      const next = [newRecord, ...prev];
      saveToStorage(next);
      return next;
    });

    return newRecord;
  };

  const updateBowheer = (id: string, data: Partial<Omit<Bowheer, 'id' | 'createdAt'>>) => {
    setBowheers((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      saveToStorage(next);
      return next;
    });
  };

  const deleteBowheer = (id: string) => {
    setBowheers((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveToStorage(next);
      return next;
    });
  };

  const getBowheerById = (id: string) => {
    return bowheers.find((b) => b.id === id);
  };

  const getBowheerByName = (name: string) => {
    if (!name) return undefined;
    return bowheers.find(
      (b) =>
        b.name.toLowerCase() === name.toLowerCase() ||
        (b.alias && b.alias.toLowerCase() === name.toLowerCase())
    );
  };

  const activeBowheers = bowheers.filter((b) => b.status === 'ACTIVE');

  return (
    <BowheerContext.Provider
      value={{
        bowheers,
        activeBowheers,
        isLoading,
        addBowheer,
        updateBowheer,
        deleteBowheer,
        getBowheerById,
        getBowheerByName,
      }}
    >
      {children}
    </BowheerContext.Provider>
  );
}

export function useBowheer() {
  const context = useContext(BowheerContext);
  if (!context) {
    throw new Error('useBowheer must be used within a BowheerProvider');
  }
  return context;
}
