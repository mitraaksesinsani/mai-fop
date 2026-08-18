# 🏢 MAI FOP (Fiber Optic Project Lifecycle & Profitability Platform)

MAI FOP (Fiber Optic Project Lifecycle & Profitability Platform) adalah aplikasi *enterprise-grade* berbasis web yang dirancang khusus untuk mengelola seluruh siklus hidup proyek fiber optik (*End-to-End FOPLP Lifecycle*), mulai dari Inisiasi, Survey, GIS Spatial Mapping, Design Review Meeting (DRM), Konstruksi, Uji Terima (BAUT), hingga Analisa Profitabilitas Akhir secara *real-time*.

Aplikasi ini dibangun menggunakan arsitektur modern untuk memastikan performa tinggi, keamanan yang solid, serta pengalaman pengguna (UX) yang sangat responsif.

---

## 🌟 Core Modules & Detailed Features

Aplikasi ini terbagi menjadi beberapa modul utama sesuai dengan 7 Tahap FOPLP Lifecycle:

### 1. 📊 Executive Dashboard & Customizer
- **Real-Time Lifecycle Pipeline**: Pemantauan 14 proyek aktif di 7 tahap lifecycle.
- **Dynamic Dashboard Customizer**: Pengaturan tampilan widget & KPI cards secara interaktif dengan auto-resizing grid.
- **LocalStorage Preference**: Menyimpan preferensi tampilan pengguna secara otomatis.

### 2. 🗺️ GIS Multi-Project Spatial Platform
- **Google Earth KML Parser**: Upload dan visualisasi file `.kml` per proyek dengan warna layer unik.
- **Direct Layer & Project Focus**: Zoom/FlyTo otomatis ke lokasi proyek atau layer individual.
- **Search Coordinate Engine**: Pencarian titik koordinat `Lat, Lng` presisi dengan penancapan pin marker otomatis.
- **Google Earth Path Drawer**: Penarikan rute KML langsung di dalam aplikasi.

### 3. 📋 Project Lifecycle & Engineering
- **Planning & BOQ**: Penyusunan Bill of Quantities dan pemetaan rute Duct/Aerial.
- **Survey & Permits**: Logging kendala lapangan (Reason Code) dan perizinan PUPR/Jasa Marga.
- **DRM & Baseline Lock**: Locking baseline resmi sebelum eksekusi konstruksi.
- **Implementation & Evidence**: Evidence Vault foto geotagged, Change Requests (CR), dan Issues Log.
- **Commissioning & BAUT**: Test OTDR/OPM, Punch List Defects, dan penandatanganan BAUT Customer.
- **Closing & Asset Handover**: Inventory Aset Fiber, Garansi Vendor, dan Final Profitability Report.

---

## 🛠️ Technology Stack & Architecture

- **Framework**: [Next.js 16 (Turbopack)](https://nextjs.org/) - App Router.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Modern utility-first CSS.
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Clean, accessible UI components with zero outer card border & shadow design.
- **Icons**: [Lucide React](https://lucide.dev/)
- **GIS Mapping**: Leaflet & React-Leaflet dengan CartoDB, Esri Satellite, & Google Earth 3D tiles.
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Cross-Platform Compatibility**: Windows (PowerShell/Cmd/Git Bash) & macOS / Linux.

---

## 💻 Getting Started (Installation & Setup)

### 1. Clone Repository
```bash
git clone https://github.com/mitraaksesinsani/mai-fop.git
cd mai-fop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Aplikasi kini dapat diakses melalui browser pada:  
👉 **https://localhost:3002** (atau `http://localhost:3002`)

---

## 🚀 Deployment (Production)

Untuk meluncurkan aplikasi ini ke Vercel / Server Produksi:

1. **Build Aplikasi**:
   ```bash
   npm run build
   ```

2. **Jalankan Production Server**:
   ```bash
   npm run start
   ```

---

*Hak Cipta &copy; 2026 PT Mitra Akses Insani (MAI FOP Platform). Seluruh hak dilindungi.*
