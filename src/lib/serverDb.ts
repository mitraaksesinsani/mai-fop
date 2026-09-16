import fs from 'fs/promises';
import path from 'path';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface ServerBowheer {
  id: string;
  code: string;
  name: string;
  alias?: string;
  category: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

export interface ServerDesignator {
  id: string;
  code: string;
  description: string;
  type: string;
  unit: string;
  createdAt?: string;
}

export interface ServerAlatKerja {
  id: string;
  code: string;
  name: string;
  category: string;
  createdAt?: string;
}

export interface ServerMaterial {
  id: string;
  materialCode: string;
  materialName: string;
  category: string;
  specification?: string;
  unit: string;
  minimumStock?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServerVendor {
  id: string;
  code: string;
  name: string;
  category?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
  createdAt?: string;
}

export interface ServerWarehouse {
  id: string;
  code: string;
  name: string;
  location?: string;
  address?: string;
  pic?: string;
  contact?: string;
  capacity?: number;
  type?: string;
  status: string;
  createdAt?: string;
}

export interface ServerSystemUser {
  id: string;
  username: string;
  fullName: string;
  password: string;
  role: 'ADMIN' | 'OWNER' | 'SITE MANAGER' | 'MANAGEMENT';
  status: 'ACTIVE' | 'INACTIVE';
  email?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DatabaseSchema {
  _initialized?: Record<string, boolean>;
  bowheers: ServerBowheer[];
  designators: ServerDesignator[];
  alatKerja: ServerAlatKerja[];
  materials: ServerMaterial[];
  vendors: ServerVendor[];
  warehouses: ServerWarehouse[];
  systemUsers: ServerSystemUser[];
  projects?: any[];
  users?: any[];
  [key: string]: any;
}

// Initial Seeds
const INITIAL_BOWHEERS: ServerBowheer[] = [
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

const INITIAL_DESIGNATORS: ServerDesignator[] = [
  { id: 'dsg-1', code: 'GL-OPEN-TRENCH-1M', description: 'Galian Tanah Manual Kedalaman 1 Meter', type: 'Galian', unit: 'Meter' },
  { id: 'dsg-2', code: 'AC-OF-SM-ADSS-24D', description: 'Penarikan Kabel Fiber Optik ADSS 24 Core', type: 'Kabel', unit: 'Meter' },
  { id: 'dsg-3', code: 'PU-S7.0-140', description: 'Pendirian Tiang Besi 7 Meter 140 daN', type: 'Tiang', unit: 'batang' },
  { id: 'dsg-4', code: 'JB-SPAN-TRAYS-FO', description: 'Konstruksi Jembatan Kabel & Trays FO', type: 'Jembatan', unit: 'Meter' },
  { id: 'dsg-5', code: 'HH-PRECAST-TYPE-B', description: 'Pemasangan Precast Handhole Type B', type: 'Handhole', unit: 'unit' },
  { id: 'dsg-6', code: 'TM-ODC-144C', description: 'Terminasi ODC 144 Core', type: 'Terminasi', unit: 'core' },
  { id: 'dsg-7', code: 'UT-OTDR-OPM-TEST', description: 'Uji Terima (UT) Pengukuran OTDR & OPM End-to-End', type: 'Uji Terima (UT)', unit: 'link' },
  { id: 'dsg-8', code: 'CT-COMM-BER-TEST', description: 'Commisioning Test (CT) & Bit Error Rate Test', type: 'Commisioning Test (CT)', unit: 'link' },
  { id: 'dsg-9', code: 'BA-REKON-ASBUILT', description: 'Penyusunan Dokumen BA Rekon & As-Built Drawing', type: 'BA Rekon', unit: 'dokumen' },
];

const INITIAL_ALAT_KERJA: ServerAlatKerja[] = [
  { id: 'alt-1', code: 'AL-001', name: 'Manual (Tenaga Manusia)', category: 'Manual' },
  { id: 'alt-2', code: 'AL-002', name: 'Excavator (Beko)', category: 'Alat Berat' },
  { id: 'alt-3', code: 'AL-003', name: 'Splicer', category: 'Alat Khusus' },
  { id: 'alt-4', code: 'AL-004', name: 'OTDR', category: 'Alat Ukur' },
  { id: 'alt-5', code: 'AL-005', name: 'Genset', category: 'Pendukung' },
];

const INITIAL_VENDORS: ServerVendor[] = [
  { id: 'vnd-1', code: 'VND-001', name: 'PT Fiber Optik Perkasa', category: 'Kontraktor', contactPerson: 'Hendra Gunawan', phone: '08123456789', email: 'sales@fiberperkasa.co.id', address: 'Jakarta', status: 'ACTIVE' },
  { id: 'vnd-2', code: 'VND-002', name: 'PT Mitra Jaringan Nusantara', category: 'Distributor', contactPerson: 'Budi Santoso', phone: '08139876543', email: 'info@mitrajaringan.com', address: 'Bandung', status: 'ACTIVE' },
];

const INITIAL_WAREHOUSES: ServerWarehouse[] = [
  { id: 'wh-1', code: 'WH-JKT', name: 'Gudang Utama Jakarta', location: 'Jakarta Timur', address: 'Jl. Rawa Gelam No. 3, Cakung', pic: 'Slamet Riyadi', contact: '08129998881', capacity: 10000, type: 'HUB', status: 'ACTIVE' },
  { id: 'wh-2', code: 'WH-BDG', name: 'Gudang Transit Bandung', location: 'Bandung', address: 'Jl. Soekarno Hatta No. 450', pic: 'Dedi Mulyadi', contact: '08137776662', capacity: 5000, type: 'TRANSIT', status: 'ACTIVE' },
];

export const INITIAL_SYSTEM_USERS: ServerSystemUser[] = [
  {
    id: 'ec0a5b9c-1e1c-4c32-854d-6884336e58a7',
    username: 'admin',
    fullName: 'Admin Proper (Super Administrator)',
    password: 'admin123',
    role: 'ADMIN',
    status: 'ACTIVE',
    email: 'admin@mai.co.id',
    createdAt: '2026-09-14T09:30:56.549Z',
  },
  {
    id: '7acef50a-f9df-4ab2-bc6b-d5f9ceda7d02',
    username: 'owner',
    fullName: 'Direktur Utama (Owner)',
    password: 'owner123',
    role: 'OWNER',
    status: 'ACTIVE',
    email: 'owner@mai.co.id',
    createdAt: '2026-09-14T09:30:56.549Z',
  },
  {
    id: 'f2ae8c76-1065-41af-b892-4a7e76f6a990',
    username: 'sitemanager',
    fullName: 'Budi Santoso, S.T.',
    password: 'sm12345',
    role: 'SITE MANAGER',
    status: 'ACTIVE',
    email: 'sitemanager@mai.co.id',
    createdAt: '2026-09-14T09:30:56.549Z',
  },
  {
    id: '711a15ba-aec0-462b-a994-0c3c7384dad1',
    username: 'management',
    fullName: 'Dewi Lestari, S.E.',
    password: 'mgmt12345',
    role: 'MANAGEMENT',
    status: 'ACTIVE',
    email: 'management@mai.co.id',
    createdAt: '2026-09-14T09:30:56.549Z',
  },
];

let writeLock: Promise<void> = Promise.resolve();

export async function readServerDb(): Promise<DatabaseSchema> {
  try {
    const dataDir = path.dirname(DB_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    let fileContent = '';
    try {
      fileContent = await fs.readFile(DB_FILE_PATH, 'utf-8');
    } catch {
      fileContent = '';
    }

    let parsed: DatabaseSchema = {
      _initialized: {},
      bowheers: [],
      designators: [],
      alatKerja: [],
      materials: [],
      vendors: [],
      warehouses: [],
      systemUsers: [],
    };

    if (fileContent.trim()) {
      try {
        parsed = JSON.parse(fileContent);
      } catch (e) {
        console.error('Failed to parse db.json, creating initial backup:', e);
      }
    }

    if (!parsed._initialized) parsed._initialized = {};

    let hasChanges = false;

    // Seed Bowheers jika belum pernah diinisialisasi
    if (!parsed._initialized.bowheers) {
      if (!Array.isArray(parsed.bowheers) || parsed.bowheers.length === 0) {
        parsed.bowheers = INITIAL_BOWHEERS;
      }
      parsed._initialized.bowheers = true;
      hasChanges = true;
    }

    // Seed Designators
    if (!parsed._initialized.designators) {
      if (!Array.isArray(parsed.designators) || parsed.designators.length === 0) {
        parsed.designators = INITIAL_DESIGNATORS;
      }
      parsed._initialized.designators = true;
      hasChanges = true;
    }

    // Seed Alat Kerja
    if (!parsed._initialized.alatKerja) {
      if (!Array.isArray(parsed.alatKerja) || parsed.alatKerja.length === 0) {
        parsed.alatKerja = INITIAL_ALAT_KERJA;
      }
      parsed._initialized.alatKerja = true;
      hasChanges = true;
    }

    // Seed Vendors
    if (!parsed._initialized.vendors) {
      if (!Array.isArray(parsed.vendors) || parsed.vendors.length === 0) {
        parsed.vendors = INITIAL_VENDORS;
      }
      parsed._initialized.vendors = true;
      hasChanges = true;
    }

    // Seed Warehouses
    if (!parsed._initialized.warehouses) {
      if (!Array.isArray(parsed.warehouses) || parsed.warehouses.length === 0) {
        parsed.warehouses = INITIAL_WAREHOUSES;
      }
      parsed._initialized.warehouses = true;
      hasChanges = true;
    }

    // Seed Materials
    if (!parsed._initialized.materials) {
      if (!Array.isArray(parsed.materials) || parsed.materials.length === 0) {
        if (Array.isArray(parsed.materialMasters) && parsed.materialMasters.length > 0) {
          parsed.materials = parsed.materialMasters;
        } else {
          parsed.materials = [
            {
              id: 'mat-1',
              materialCode: 'CBL-FO-ADSS-24C',
              materialName: 'Kabel Fiber Optik ADSS 24 Core',
              category: 'CABLE',
              specification: 'Single Mode, G.652D, Span 100m',
              unit: 'Meter',
              minimumStock: 1000,
              isActive: true,
            },
            {
              id: 'mat-2',
              materialCode: 'CBL-FO-DUCT-48C',
              materialName: 'Kabel Fiber Optik Duct 48 Core',
              category: 'CABLE',
              specification: 'Single Mode, G.652D',
              unit: 'Meter',
              minimumStock: 500,
              isActive: true,
            },
            {
              id: 'mat-3',
              materialCode: 'TIANG-BESI-7M',
              materialName: 'Tiang Besi 7 Meter 140 daN',
              category: 'OSP',
              specification: 'Hot Dip Galvanized',
              unit: 'batang',
              minimumStock: 50,
              isActive: true,
            },
          ];
        }
      }
      parsed._initialized.materials = true;
      hasChanges = true;
    }

    // Seed System Users
    if (!parsed._initialized.systemUsers) {
      if (!Array.isArray(parsed.systemUsers) || parsed.systemUsers.length === 0) {
        parsed.systemUsers = INITIAL_SYSTEM_USERS;
      }
      parsed._initialized.systemUsers = true;
      hasChanges = true;
    }

    if (hasChanges) {
      await writeServerDb(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Error in readServerDb:', error);
    return {
      _initialized: { bowheers: true, systemUsers: true },
      bowheers: INITIAL_BOWHEERS,
      designators: INITIAL_DESIGNATORS,
      alatKerja: INITIAL_ALAT_KERJA,
      materials: [],
      vendors: INITIAL_VENDORS,
      warehouses: INITIAL_WAREHOUSES,
      systemUsers: INITIAL_SYSTEM_USERS,
    };
  }
}

export async function writeServerDb(data: DatabaseSchema): Promise<void> {
  const currentLock = writeLock;
  let releaseLock: () => void = () => {};

  writeLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  await currentLock;

  try {
    const dataDir = path.dirname(DB_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(DB_FILE_PATH, jsonString, 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
    throw err;
  } finally {
    releaseLock();
  }
}
