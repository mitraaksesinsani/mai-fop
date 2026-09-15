-- ==============================================================================
-- FOPLP Database Schema (Supabase PostgreSQL)
-- Jalankan query ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. TABEL USERS (Master Data Pengguna)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'USER',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL PROJECTS (Daftar Master Proyek)
CREATE TABLE IF NOT EXISTS public.projects (
  id VARCHAR(100) PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  customer VARCHAR(255),
  project_type VARCHAR(100),
  region VARCHAR(255),
  project_code VARCHAR(100),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  pic VARCHAR(255),
  status VARCHAR(50) DEFAULT 'PLANNING',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL PROJECT REQUIREMENTS (BOQ / Material per Proyek)
CREATE TABLE IF NOT EXISTS public.project_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(100) REFERENCES public.projects(id) ON DELETE CASCADE,
  material_id UUID,
  estimated_qty INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABEL MATERIAL MASTERS (Katalog Material)
CREATE TABLE IF NOT EXISTS public.material_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_code VARCHAR(100) UNIQUE NOT NULL,
  material_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  specification TEXT,
  unit VARCHAR(50),
  unit_price NUMERIC(15, 2) DEFAULT 0,
  minimum_stock INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) & Berikan Izin Akses Penuh untuk Public/Anon
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_masters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access users" ON public.users;
CREATE POLICY "Allow public access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access projects" ON public.projects;
CREATE POLICY "Allow public access projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access project_requirements" ON public.project_requirements;
CREATE POLICY "Allow public access project_requirements" ON public.project_requirements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access material_masters" ON public.material_masters;
CREATE POLICY "Allow public access material_masters" ON public.material_masters FOR ALL USING (true) WITH CHECK (true);

-- 5. TABEL BOWHEERS (Master Data Klien / Customer Pemilik Proyek)
CREATE TABLE IF NOT EXISTS public.bowheers (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(100),
  category VARCHAR(100) DEFAULT 'Telekomunikasi',
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(100),
  address TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bowheers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access bowheers" ON public.bowheers;
CREATE POLICY "Allow public access bowheers" ON public.bowheers FOR ALL USING (true) WITH CHECK (true);

-- 6. DATA AWAL (SEED DATA)
INSERT INTO public.users (username, name, password, role)
VALUES 
  ('admin', 'Super Administrator', 'admin123', 'ADMIN'),
  ('owner', 'Direktur Utama (Owner)', 'owner123', 'OWNER'),
  ('sitemanager', 'Budi Santoso, S.T.', 'sm12345', 'SITE MANAGER'),
  ('management', 'Dewi Lestari, S.E.', 'mgmt12345', 'MANAGEMENT')
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.bowheers (id, code, name, alias, category, contact_person, email, phone, address, status)
VALUES 
  ('bwh-1', 'TSEL', 'PT Telkomsel Tbk', 'Telkomsel', 'Telekomunikasi', 'Bambang Sudibyo', 'procurement@telkomsel.co.id', '021-5240123', 'Telkom Landmark Tower, Jl. Gatot Subroto No. 52, Jakarta Selatan', 'ACTIVE'),
  ('bwh-2', 'ISAT', 'PT Indosat Tbk', 'Indosat Ooredoo Hutchison', 'Telekomunikasi', 'Siti Sarah', 'project.delivery@indosatooredoo.com', '021-30003001', 'Jl. Medan Merdeka Barat No. 21, Gambir, Jakarta Pusat', 'ACTIVE'),
  ('bwh-3', 'EXCL', 'PT XL Axiata Tbk', 'XL Axiata', 'Telekomunikasi', 'Hendro Prasetyo', 'vendor.management@xl.co.id', '021-5761188', 'XL Axiata Tower, Jl. H. R. Rasuna Said Kav. 11-12, Kuningan, Jakarta Selatan', 'ACTIVE'),
  ('bwh-4', 'FREN', 'PT Smartfren Telecom Tbk', 'Smartfren', 'Telekomunikasi', 'Dimas Aditya', 'rollout@smartfren.com', '021-50100000', 'Jl. H. Agus Salim No. 45, Kebon Sirih, Menteng, Jakarta Pusat', 'ACTIVE'),
  ('bwh-5', 'ICON', 'PT PLN Icon Plus', 'Icon Plus', 'BUMN / Pemerintahan', 'Rahmat Hidayat', 'partnership@iconpln.co.id', '021-5253000', 'Wisma Mulia Lt. 50, Jl. Jend. Gatot Subroto No. 42, Jakarta Selatan', 'ACTIVE'),
  ('bwh-6', 'MORA', 'PT Mora Telematika Indonesia Tbk', 'Moratelindo', 'Telekomunikasi', 'Fajar Nugraha', 'corporate@moratelindo.co.id', '021-31998600', 'Graha 9, Jl. KH. Wahid Hasyim No. 9, Menteng, Jakarta Pusat', 'ACTIVE'),
  ('bwh-7', 'BMRI', 'Bank Mandiri', 'Bank Mandiri (Persero) Tbk', 'Perbankan / Finansial', 'Tri Wahyuni', 'it.infrastructure@bankmandiri.co.id', '021-5265000', 'Plaza Mandiri, Jl. Jend. Gatot Subroto Kav. 36-38, Jakarta Selatan', 'ACTIVE'),
  ('bwh-8', 'FMI', 'PT Fiber Media Indonesia', 'Fiber Media', 'Enterprise / Swasta', 'Agus Setiawan', 'info@fibermedia.co.id', '021-29001234', 'Kawasan Industri Pulogadung, Jakarta Timur', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

