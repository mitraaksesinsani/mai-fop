-- ==============================================================================
-- FOPLP / PROPER - COMPLETE SUPABASE SCHEMA & SEED
-- Generated for Project: mai-fop
--
-- CARA PENGGUNAAN:
-- 1. Buka Supabase Dashboard Anda: https://supabase.com/dashboard/project/bawgrshddvigwpnvvjkm
-- 2. Masuk ke menu "SQL Editor" di bilah sisi kiri.
-- 3. Klik "New Query", salin seluruh isi file ini, tempel (paste) dan klik "Run".
-- ==============================================================================

-- Aktifkan ekstensi UUID pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABEL USERS (Master Pengguna Sistem)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'USER',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  email VARCHAR(255),
  phone VARCHAR(100),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access users" ON public.users;
CREATE POLICY "Allow public access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 2. TABEL BOWHEERS (Master Klien / Project Owner)
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

ALTER TABLE public.bowheers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access bowheers" ON public.bowheers;
CREATE POLICY "Allow public access bowheers" ON public.bowheers FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 3. TABEL DESIGNATORS (Master Katalog Pekerjaan & Kode Designator)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.designators (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  type VARCHAR(100),
  unit VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.designators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access designators" ON public.designators;
CREATE POLICY "Allow public access designators" ON public.designators FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. TABEL ALAT_KERJA (Master Katalog Alat Kerja & Tools Proyek)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.alat_kerja (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.alat_kerja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access alat_kerja" ON public.alat_kerja;
CREATE POLICY "Allow public access alat_kerja" ON public.alat_kerja FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. TABEL MATERIAL_MASTERS (Master Katalog Barang & Material)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.material_masters (
  id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
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

ALTER TABLE public.material_masters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access material_masters" ON public.material_masters;
CREATE POLICY "Allow public access material_masters" ON public.material_masters FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. TABEL VENDORS (Master Rekanan / Vendor / Supplier)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vendors (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  contact_person VARCHAR(255),
  phone VARCHAR(100),
  email VARCHAR(255),
  address TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access vendors" ON public.vendors;
CREATE POLICY "Allow public access vendors" ON public.vendors FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 7. TABEL WAREHOUSES (Master Gudang Penyimpanan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.warehouses (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  address TEXT,
  pic VARCHAR(255),
  contact VARCHAR(100),
  capacity NUMERIC,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  coordinates VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access warehouses" ON public.warehouses;
CREATE POLICY "Allow public access warehouses" ON public.warehouses FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. TABEL PROJECTS (Master Proyek FOPLP)
-- ==============================================================================
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
  scope TEXT,
  route_notes TEXT,
  survey_route JSONB,
  survey_validation JSONB,
  survey_kml JSONB,
  permits JSONB DEFAULT '[]'::jsonb,
  boq_items JSONB DEFAULT '[]'::jsonb,
  commercial JSONB DEFAULT '{"capex":0,"opex":0,"revenue":0}'::jsonb,
  designator_items JSONB DEFAULT '[]'::jsonb,
  daily_reports JSONB DEFAULT '{}'::jsonb,
  evidences JSONB DEFAULT '[]'::jsonb,
  issues JSONB DEFAULT '[]'::jsonb,
  bauts JSONB DEFAULT '[]'::jsonb,
  as_built_docs JSONB DEFAULT '[]'::jsonb,
  assets JSONB DEFAULT '[]'::jsonb,
  profitability JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access projects" ON public.projects;
CREATE POLICY "Allow public access projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- Tambahkan kolom yang mungkin belum ada di tabel projects yang sudah eksis
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS route_notes TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS survey_route JSONB;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS survey_validation JSONB;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS survey_kml JSONB;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS permits JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS boq_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS commercial JSONB DEFAULT '{"capex":0,"opex":0,"revenue":0}'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS designator_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS daily_reports JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS evidences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS issues JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS bauts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS as_built_docs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS assets JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS profitability JSONB;

-- ==============================================================================
-- 9. TABEL PROJECT_REQUIREMENTS (Kebutuhan Material BOQ per Proyek)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.project_requirements (
  id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id VARCHAR(100) REFERENCES public.projects(id) ON DELETE CASCADE,
  material_id VARCHAR(100),
  material_code VARCHAR(100),
  material_name VARCHAR(255),
  estimated_qty INT DEFAULT 0,
  unit VARCHAR(50),
  unit_price NUMERIC(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access project_requirements" ON public.project_requirements;
CREATE POLICY "Allow public access project_requirements" ON public.project_requirements FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 10. TABEL PROJECT_PERMITS (Data Perizinan Site, Status, Dokumen & Biaya Retribusi)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.project_permits (
  id VARCHAR(100) PRIMARY KEY,
  project_id VARCHAR(100) REFERENCES public.projects(id) ON DELETE CASCADE,
  site_id VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'PU Kota / Kab',
  status VARCHAR(50) NOT NULL DEFAULT 'Perizinan',
  progress_detail VARCHAR(255),
  target_date DATE,
  actual_date DATE,
  pic_name VARCHAR(255),
  cost NUMERIC(15, 2) DEFAULT 0,
  notes TEXT,
  checklist JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_permits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access project_permits" ON public.project_permits;
CREATE POLICY "Allow public access project_permits" ON public.project_permits FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 11. TABEL PROJECT_DESIGNATOR_ITEMS (DRM Plan, Volume Target, Bobot & Progres)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.project_designator_items (
  id VARCHAR(100) PRIMARY KEY,
  project_id VARCHAR(100) REFERENCES public.projects(id) ON DELETE CASCADE,
  id_volume VARCHAR(100) NOT NULL,
  kode_designator VARCHAR(100) NOT NULL,
  uraian_pekerjaan TEXT NOT NULL,
  jenis VARCHAR(50) NOT NULL DEFAULT 'Galian',
  satuan VARCHAR(50) NOT NULL DEFAULT 'Meter',
  volume_target NUMERIC(15, 2) DEFAULT 0,
  bobot_persen NUMERIC(8, 4) DEFAULT 0,
  daily_volumes JSONB DEFAULT '{}'::jsonb,
  daily_records JSONB DEFAULT '{}'::jsonb,
  change_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_designator_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access project_designator_items" ON public.project_designator_items;
CREATE POLICY "Allow public access project_designator_items" ON public.project_designator_items FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 12. SEED DATA OTOMATIS DARI DATABASE LOKAL (db.json)
-- ==============================================================================

-- SEED MATERIAL MASTERS
INSERT INTO public.material_masters (id, material_code, material_name, category, specification, unit, unit_price, minimum_stock, is_active, created_at)
VALUES
  ('mat-1', 'CBL-FO-ADSS-24C', 'Kabel Fiber Optik ADSS 24 Core', 'CABLE', 'Single Mode, G.652D, Span 100m', 'Meter', 8500, 1000, TRUE, '2026-09-19T02:01:16.154Z'),
  ('mat-2', 'CBL-FO-DUCT-48C', 'Kabel Fiber Optik Duct 48 Core', 'CABLE', 'Single Mode, G.652D', 'Meter', 14000, 500, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-3', 'TIANG-BESI-7M', 'Tiang Besi 7 Meter 140 daN', 'OSP', 'Hot Dip Galvanized', 'batang', 850000, 50, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-4', 'TIANG-BESI-9M', 'Tiang Besi 9 Meter 200 daN', 'OSP', 'Hot Dip Galvanized', 'batang', 1100000, 30, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-5', 'FOSC-INLINE-48C', 'Closure Splice Inline FO 48 Core', 'ACCESSORIES', 'Waterproof IP68, 4 Tray @12 Core', 'pcs', 275000, 40, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-6', 'ODC-PRECON-144C', 'Optical Distribution Cabinet 144 Core', 'ODC', 'Outdoor IP65 Powder Coated', 'unit', 4500000, 10, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-7', 'ODP-SOLID-16C', 'Optical Distribution Point 16 Core', 'ODP', 'Splitter 1:16 PLC Modular', 'unit', 550000, 25, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-8', 'ODP-SOLID-8C', 'Optical Distribution Point 8 Core', 'ODP', 'Splitter 1:8 PLC Modular', 'unit', 350000, 25, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-9', 'PRECAST-MH-TYP-B', 'Precast Manhole Beton Type B', 'CIVIL', 'Ukuran 200x120x150cm K-350', 'unit', 3200000, 15, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-10', 'HDPE-SUBDUCT-32', 'Subduct Pipa HDPE 32/28 mm', 'OSP', 'Roll @500 Meter Warna Orange', 'Meter', 6500, 2000, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-11', 'ACC-POLE-SET', 'Aksesoris Tiang & Bracket Suspension', 'ACCESSORIES', 'Bracket, Suspension Clamp, Banding 20mm', 'set', 75000, 100, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-12', 'SRV-PULL-FO', 'Jasa Penarikan Kabel FO Udara/Duct', 'SERVICE', 'Penarikan kabel fiber optik, tagging, sagging', 'm', 3500, 0, TRUE, '2026-09-19T02:01:16.155Z'),
  ('mat-13', 'SRV-PLANT-POLE', 'Jasa Pendirian & Penanaman Tiang', 'SERVICE', 'Gali lubang, tanam tiang 7/9m, cor pondasi', 'titik', 150000, 0, TRUE, '2026-09-19T02:01:16.155Z')
ON CONFLICT (material_code) DO UPDATE SET
  material_name = EXCLUDED.material_name, category = EXCLUDED.category, specification = EXCLUDED.specification, unit = EXCLUDED.unit, unit_price = EXCLUDED.unit_price;

-- SEED PROJECTS
INSERT INTO public.projects (id, project_name, customer, project_type, region, project_code, start_date, end_date, pic, status, scope, route_notes, survey_route, survey_validation, survey_kml, permits, boq_items, commercial, designator_items, daily_reports, evidences, issues, created_at)
VALUES
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856', '0001-YOI', 'PT Telkomsel Tbk', 'Backbone Fiber', 'DKI Jakarta', '0001', '2026-09-16T00:00:00.000Z', '2026-12-15T00:00:00.000Z', 'Budi Santoso, S.T.', 'PLANNING', '', 'Tarikan kabel FO sepanjang Jl. Sudirman menuju Site Sentul, melewati 4 titik Handhole dan 22 titik Tiang OSP eksisting.', '{"routeNotes":"Tarikan kabel FO sepanjang Jl. Sudirman menuju Site Sentul, melewati 4 titik Handhole dan 22 titik Tiang OSP eksisting.","startPoint":"ODC-01 Sentul City","endPoint":"Site BTS Tower Sukaresmi","totalLengthMeters":4850,"cableType":"Kabel Fiber Optik ADSS 24 Core","deploymentType":"Aerial (Tiang)","feederCapacity":"24 Core","updatedAt":"2026-09-18T10:00:00.000Z"}'::jsonb, '{"surveyDate":"2026-09-17","surveyorName":"Budi Santoso, S.T.","feasibility":"Layak dengan Catatan","poleCondition":"Mayoritas tiang Telkom dalam kondisi baik, dibutuhkan 6 tiang baru 7 meter di pertigaan jalan utama.","rowPermitRisk":"Sedang","findings":"Perlu koordinasi dengan dinas PU setempat untuk izin penyeberangan jalan (crossing).","recommendations":"Gunakan tiang 9 meter saat crossing jalan raya utama untuk keamanan lintasan armada logistik.","verifiedBy":"Ahmad Hidayat","updatedAt":"2026-09-18T10:00:00.000Z"}'::jsonb, '{"fileName":"Route_FO_0001_YOI_Sentul.kml","fileSize":"1.2 MB","uploadDate":"2026-09-17","verifiedBy":"Dedi Mulyadi","startCoord":"-6.553210, 106.854120","endCoord":"-6.578910, 106.883450","routeStatus":"Verified","notes":"Rute KML telah diverifikasi sesuai as-surveyed track GPS Garmin.","updatedAt":"2026-09-18T10:00:00.000Z"}'::jsonb, '[{"id":"pmt-001","siteId":"SITE-SENTUL-01","category":"PU Kota / Kab","status":"Perizinan","progressDetail":"2.4 Survey lokasi bersama PU","targetDate":"2026-09-30","picName":"Budi Santoso, S.T.","cost":2500000,"notes":"Menunggu jadwal survey lapangan bersama staf Dinas Bina Marga.","checklist":{"PU Kota / Kab":"4"},"createdAt":"2026-09-17T08:00:00.000Z","updatedAt":"2026-09-18T10:00:00.000Z"},{"id":"pmt-002","siteId":"SITE-SENTUL-02","category":"PU Nas","status":"Aanwijzing","progressDetail":"1.2 Penjadwalan aanwijzing","targetDate":"2026-10-10","picName":"Budi Santoso, S.T.","cost":5000000,"notes":"Pengajuan rekomendasi teknis crossing jalan nasional KM 37.","checklist":{"PU Nas":"3"},"createdAt":"2026-09-17T09:30:00.000Z","updatedAt":"2026-09-18T10:00:00.000Z"},{"id":"pmt-003","siteId":"SITE-SENTUL-03","category":"Izin Warga / Lingkungan","status":"Instalasi","progressDetail":"4.4 Proses Penanaman Tiang","targetDate":"2026-09-25","picName":"Ahmad Hidayat","cost":1500000,"notes":"Sosialisasi dan koordinasi bersama RW 05 dan tokoh masyarakat selesai.","checklist":{"Izin Warga / Lingkungan":"7"},"createdAt":"2026-09-18T07:15:00.000Z","updatedAt":"2026-09-18T10:00:00.000Z"}]'::jsonb, '[{"id":"boq-1","name":"Kabel Fiber Optik ADSS 24 Core","quantity":4850,"unit":"Meter","price":8500},{"id":"boq-2","name":"Tiang Besi 7 Meter 140 daN","quantity":22,"unit":"batang","price":850000},{"id":"boq-3","name":"ODC 144 Core","quantity":1,"unit":"unit","price":4500000},{"id":"boq-4","name":"ODP 16 Core","quantity":8,"unit":"unit","price":550000},{"id":"boq-5","name":"Jasa Penarikan Kabel FO","quantity":4850,"unit":"m","price":3500},{"id":"boq-6","name":"Jasa Pendirian Tiang","quantity":22,"unit":"titik","price":150000}]'::jsonb, '[]'::jsonb, '[{"idVolume":"VOL-001","designator":"GL-OPEN-TRENCH-1M","namaDeskripsi":"Galian Tanah Manual Kedalaman 1 Meter","jenis":"Galian","satuan":"Meter","bobotPersen":15,"volumeTarget":4500,"dailyVolumes":{"2026-09-17":250,"2026-09-18":320},"dailyRecords":{"2026-09-17":[{"volume":250,"alatKerja":"Excavator Mini","mandor":"Mandor Ujang","span":"MH-01 s/d MH-03","kendala":"Crossing jalan raya padat pada jam sibuk siang","solusi":"Pekerjaan penyeberangan kabel dialihkan ke malam hari pukul 22.00 WIB"}],"2026-09-18":[{"volume":320,"alatKerja":"Jackhammer Pneumatik","mandor":"Mandor Ujang","span":"MH-03 s/d MH-05","kendala":"Kondisi tanah berbatu di titik Handhole 03 sedikit memperlambat galian","solusi":"Penambahan alat jackhammer pneumatik untuk mempercepat penembusan batu"}]}},{"idVolume":"VOL-002","designator":"AC-OF-SM-ADSS-24D","namaDeskripsi":"Penarikan Kabel Fiber Optik ADSS 24 Core","jenis":"Kabel","satuan":"Meter","bobotPersen":25,"volumeTarget":15000,"dailyVolumes":{"2026-09-18":500},"dailyRecords":{"2026-09-18":[{"volume":500,"alatKerja":"Roll Kabel & Mobil Tangga","mandor":"Mandor Asep","span":"Span ODC-01 s/d Tiang 08","kendala":"-","solusi":"-"}]}},{"idVolume":"VOL-003","designator":"PU-S7.0-140","namaDeskripsi":"Pendirian Tiang Besi 7 Meter 140 daN","jenis":"Tiang","satuan":"batang","bobotPersen":15,"volumeTarget":180,"dailyVolumes":{"2026-09-17":6,"2026-09-18":8},"dailyRecords":{"2026-09-17":[{"volume":6,"alatKerja":"Mobil Crane 3T","mandor":"Mandor Joko","span":"Jl. Sentul Raya KM 1-2","kendala":"-","solusi":"-"}],"2026-09-18":[{"volume":8,"alatKerja":"Mobil Crane 3T","mandor":"Mandor Joko","span":"Jl. Sentul Raya KM 2-4","kendala":"-","solusi":"-"}]}},{"idVolume":"VOL-004","designator":"JB-SPAN-TRAYS-FO","namaDeskripsi":"Konstruksi Jembatan Kabel & Trays FO","jenis":"Jembatan","satuan":"Meter","bobotPersen":8,"volumeTarget":250,"dailyVolumes":{}},{"idVolume":"VOL-005","designator":"HH-PRECAST-TYPE-B","namaDeskripsi":"Pemasangan Precast Handhole Type B","jenis":"Handhole","satuan":"unit","bobotPersen":7,"volumeTarget":24,"dailyVolumes":{}},{"idVolume":"VOL-006","designator":"TM-ODC-144C","namaDeskripsi":"Terminasi ODC 144 Core","jenis":"Terminasi","satuan":"core","bobotPersen":10,"volumeTarget":144,"dailyVolumes":{}},{"idVolume":"VOL-007","designator":"UT-OTDR-OPM-TEST","namaDeskripsi":"Uji Terima (UT) Pengukuran OTDR & OPM End-to-End","jenis":"Uji Terima (UT)","satuan":"link","bobotPersen":8,"volumeTarget":12,"dailyVolumes":{}},{"idVolume":"VOL-008","designator":"CT-COMM-BER-TEST","namaDeskripsi":"Commisioning Test (CT) & Bit Error Rate Test","jenis":"Commisioning Test (CT)","satuan":"link","bobotPersen":7,"volumeTarget":12,"dailyVolumes":{}},{"idVolume":"VOL-009","designator":"BA-REKON-ASBUILT","namaDeskripsi":"Penyusunan Dokumen BA Rekon & As-Built Drawing","jenis":"BA Rekon","satuan":"dokumen","bobotPersen":5,"volumeTarget":1,"dailyVolumes":{}}]'::jsonb, '{"2026-09-17":{"tenagaKerja":"Tim OSP Telkom (16 Orang)","alatBerat":"Mobil Crane 3T, Excavator Mini","cuaca":"CERAH","kendala":"Crossing jalan raya padat pada jam sibuk siang","solusi":"Pekerjaan penyeberangan kabel dialihkan ke malam hari pukul 22.00 WIB","updatedAt":"2026-09-18T10:00:00.000Z"},"2026-09-18":{"tenagaKerja":"Tim Gabungan Teknisi & Mandor (24 Orang)","alatBerat":"Mobil Tangga, Mini Excavator, Genset 5kVA","cuaca":"BERAWAN","kendala":"Kondisi tanah berbatu di titik Handhole 03 sedikit memperlambat galian","solusi":"Penambahan alat jackhammer pneumatik untuk mempercepat penembusan batu","updatedAt":"2026-09-18T14:30:00.000Z"}}'::jsonb, '[{"id":"evd-001","title":"Galian Jalur Utama Handhole 01 - 03","category":"Galian","date":"2026-09-17","location":"Jl. Sentul KM 1.2, Depan Ruko Perumahan","uploader":"Budi Santoso, S.T.","imageUrl":"https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=60","notes":"Kedalaman galian 1.1 meter telah sesuai spesifikasi standar Telkom.","createdAt":"2026-09-17T11:30:00.000Z"},{"id":"evd-002","title":"Penarikan Kabel ADSS 24 Core Span 01","category":"Kabel FO","date":"2026-09-18","location":"ODC-01 Sentul City menuju Tiang OSP 05","uploader":"Budi Santoso, S.T.","imageUrl":"https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60","notes":"Pemasangan suspension clamp dan tension clamp terpasang kuat.","createdAt":"2026-09-18T15:00:00.000Z"}]'::jsonb, '[{"id":"iss-001","title":"Izin crossing jalan raya nasional KM 37 belum terbit","severity":"High","status":"In Progress","category":"Perizinan","reportDate":"2026-09-16","targetResolutionDate":"2026-09-25","reporter":"Budi Santoso, S.T.","pic":"Ahmad Hidayat","description":"Dibutuhkan rekomendasi teknis tambahan dari Balai PU Nasional sebelum crossing dapat dieksekusi.","mitigationPlan":"Menghadiri aanwijzing lapangan bersama tim Balai Pelaksanaan Jalan Nasional (BPJN).","createdAt":"2026-09-16T09:00:00.000Z","updatedAt":"2026-09-18T10:00:00.000Z"},{"id":"iss-002","title":"Lapisan tanah berbatu keras di Handhole 03","severity":"Medium","status":"Resolved","category":"Teknis","reportDate":"2026-09-17","targetResolutionDate":"2026-09-18","reporter":"Mandor Ujang","pic":"Budi Santoso, S.T.","description":"Penggalian manual terhambat batuan kali yang keras.","mitigationPlan":"Mobilisasi jackhammer pneumatik tambahan untuk mempercepat pemecahan batu.","createdAt":"2026-09-17T13:00:00.000Z","updatedAt":"2026-09-18T14:00:00.000Z"}]'::jsonb, '2026-09-16T06:45:05.662Z')
ON CONFLICT (id) DO UPDATE SET
  project_name = EXCLUDED.project_name, customer = EXCLUDED.customer, survey_route = EXCLUDED.survey_route, survey_validation = EXCLUDED.survey_validation, survey_kml = EXCLUDED.survey_kml, permits = EXCLUDED.permits, designator_items = EXCLUDED.designator_items;

-- SEED PROJECT PERMITS
INSERT INTO public.project_permits (id, project_id, site_id, category, status, progress_detail, target_date, actual_date, pic_name, cost, notes, checklist)
VALUES
  ('pmt-001', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'SITE-SENTUL-01', 'PU Kota / Kab', 'Perizinan', '2.4 Survey lokasi bersama PU', '2026-09-30', NULL, 'Budi Santoso, S.T.', 2500000, 'Menunggu jadwal survey lapangan bersama staf Dinas Bina Marga.', '{"PU Kota / Kab":"4"}'::jsonb),
  ('pmt-002', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'SITE-SENTUL-02', 'PU Nas', 'Aanwijzing', '1.2 Penjadwalan aanwijzing', '2026-10-10', NULL, 'Budi Santoso, S.T.', 5000000, 'Pengajuan rekomendasi teknis crossing jalan nasional KM 37.', '{"PU Nas":"3"}'::jsonb),
  ('pmt-003', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'SITE-SENTUL-03', 'Izin Warga / Lingkungan', 'Instalasi', '4.4 Proses Penanaman Tiang', '2026-09-25', NULL, 'Ahmad Hidayat', 1500000, 'Sosialisasi dan koordinasi bersama RW 05 dan tokoh masyarakat selesai.', '{"Izin Warga / Lingkungan":"7"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status, progress_detail = EXCLUDED.progress_detail, cost = EXCLUDED.cost;

-- SEED PROJECT DESIGNATOR ITEMS
INSERT INTO public.project_designator_items (id, project_id, id_volume, kode_designator, uraian_pekerjaan, jenis, satuan, volume_target, bobot_persen, daily_volumes, daily_records, change_history)
VALUES
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856-VOL-001', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'VOL-001', 'GL-OPEN-TRENCH-1M', 'Galian Tanah Manual Kedalaman 1 Meter', 'Galian', 'Meter', 4500, 15, '{"2026-09-17":250,"2026-09-18":320}'::jsonb, '{"2026-09-17":[{"volume":250,"alatKerja":"Excavator Mini","mandor":"Mandor Ujang","span":"MH-01 s/d MH-03","kendala":"Crossing jalan raya padat pada jam sibuk siang","solusi":"Pekerjaan penyeberangan kabel dialihkan ke malam hari pukul 22.00 WIB"}],"2026-09-18":[{"volume":320,"alatKerja":"Jackhammer Pneumatik","mandor":"Mandor Ujang","span":"MH-03 s/d MH-05","kendala":"Kondisi tanah berbatu di titik Handhole 03 sedikit memperlambat galian","solusi":"Penambahan alat jackhammer pneumatik untuk mempercepat penembusan batu"}]}'::jsonb, '[]'::jsonb),
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856-VOL-002', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'VOL-002', 'AC-OF-SM-ADSS-24D', 'Penarikan Kabel Fiber Optik ADSS 24 Core', 'Kabel', 'Meter', 15000, 25, '{"2026-09-18":500}'::jsonb, '{"2026-09-18":[{"volume":500,"alatKerja":"Roll Kabel & Mobil Tangga","mandor":"Mandor Asep","span":"Span ODC-01 s/d Tiang 08","kendala":"-","solusi":"-"}]}'::jsonb, '[]'::jsonb),
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856-VOL-003', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'VOL-003', 'PU-S7.0-140', 'Pendirian Tiang Besi 7 Meter 140 daN', 'Tiang', 'batang', 180, 15, '{"2026-09-17":6,"2026-09-18":8}'::jsonb, '{"2026-09-17":[{"volume":6,"alatKerja":"Mobil Crane 3T","mandor":"Mandor Joko","span":"Jl. Sentul Raya KM 1-2","kendala":"-","solusi":"-"}],"2026-09-18":[{"volume":8,"alatKerja":"Mobil Crane 3T","mandor":"Mandor Joko","span":"Jl. Sentul Raya KM 2-4","kendala":"-","solusi":"-"}]}'::jsonb, '[]'::jsonb),
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856-VOL-004', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'VOL-004', 'JB-SPAN-TRAYS-FO', 'Konstruksi Jembatan Kabel & Trays FO', 'Jembatan', 'Meter', 250, 8, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856-VOL-005', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'VOL-005', 'HH-PRECAST-TYPE-B', 'Pemasangan Precast Handhole Type B', 'Handhole', 'unit', 24, 7, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856-VOL-006', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'VOL-006', 'TM-ODC-144C', 'Terminasi ODC 144 Core', 'Terminasi', 'core', 144, 10, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856-VOL-007', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'VOL-007', 'UT-OTDR-OPM-TEST', 'Uji Terima (UT) Pengukuran OTDR & OPM End-to-End', 'Uji Terima (UT)', 'link', 12, 8, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856-VOL-008', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'VOL-008', 'CT-COMM-BER-TEST', 'Commisioning Test (CT) & Bit Error Rate Test', 'Commisioning Test (CT)', 'link', 12, 7, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('1d7b24bc-50b5-4993-a4f2-cd2f835cd856-VOL-009', '1d7b24bc-50b5-4993-a4f2-cd2f835cd856', 'VOL-009', 'BA-REKON-ASBUILT', 'Penyusunan Dokumen BA Rekon & As-Built Drawing', 'BA Rekon', 'dokumen', 1, 5, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  volume_target = EXCLUDED.volume_target, bobot_persen = EXCLUDED.bobot_persen, daily_volumes = EXCLUDED.daily_volumes;
