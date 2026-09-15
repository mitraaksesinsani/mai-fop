-- ==============================================================================
-- TABEL BOWHEERS (Master Data Klien / Customer Pemilik Proyek)
-- ==============================================================================
-- Jalankan query ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

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

-- Row Level Security (RLS) & Akses Anon/Public
ALTER TABLE public.bowheers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access bowheers" ON public.bowheers;
CREATE POLICY "Allow public access bowheers" ON public.bowheers FOR ALL USING (true) WITH CHECK (true);

-- Data Awal Klien (Seed Bowheers)
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
