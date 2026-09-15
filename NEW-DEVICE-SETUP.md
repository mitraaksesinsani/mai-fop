# 🚀 Panduan Setup Proyek di Perangkat / Laptop Baru (MAI-FOP)

Panduan ini ditujukan agar Anda atau anggota tim dapat memulai proses development di laptop/PC baru dari nol hingga siap digunakan dalam waktu kurang dari 5 menit.

---

## 📋 Checklist Kebutuhan Awal (Prerequisites)

Sebelum mendownload proyek, pastikan laptop baru Anda sudah terinstal software berikut:

| Software | Versi Rekomendasi | Tautan Download |
| :--- | :--- | :--- |
| **Node.js** | v20.x atau v22.x (LTS) | [nodejs.org](https://nodejs.org/) |
| **Git** | Versi terbaru | [git-scm.com](https://git-scm.com/) |
| **Visual Studio Code** | Versi terbaru | [code.visualstudio.com](https://code.visualstudio.com/) |

> **Cek Instalasi di Terminal / PowerShell:**
> ```bash
> node -v
> npm -v
> git --version
> ```

---

## 🛠️ Langkah-Langkah Setup Step-by-Step

### 1. Clone Repository dari Git
Buka terminal (Git Bash, Command Prompt, atau PowerShell), arahkan ke folder proyek Anda (misal `C:\Projects`), lalu jalankan:
```bash
git clone <URL_REPOSITORY_ANDA>
cd mai-fop
```

---

### 2. Install Seluruh Dependensi Proyek
Jalankan perintah berikut untuk mengunduh semua library (`node_modules`):
```bash
npm install
```
*(Tunggu sekitar 1–2 menit hingga proses selesai).*

---

### 3. Siapkan File Konfigurasi Lingkungan (`.env.local`)
File `.env.local` **tidak diikutsertakan di Git** demi keamanan kredensial. Anda perlu membuatnya secara manual di laptop baru.

1. Duplikasi file template yang sudah disediakan:
   - **Di Windows (PowerShell / CMD):**
     ```powershell
     copy .env.example .env.local
     ```
   - **Di macOS / Linux / Git Bash:**
     ```bash
     cp .env.example .env.local
     ```

2. Buka file `.env.local` di VS Code, lalu isi 2 baris kunci Supabase:
   ```env
   # Kredensial Supabase Project MAI-FOP
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxxxxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

   # Port Aplikasi
   NEXT_PUBLIC_APP_URL="http://localhost:3002"
   ```

> 💡 **Di mana mengambil URL dan Anon Key jika lupa?**
> 1. Buka [supabase.com/dashboard](https://supabase.com/dashboard)
> 2. Pilih project `mai-fop`
> 3. Buka menu **Project Settings** (ikon gerigi di kiri bawah) ➔ **API**
> 4. Salin **Project URL** dan **anon public key**.

---

### 4. Jalankan Server Development
Jalankan aplikasi di mode lokal:
```bash
npm run dev
```

Jika berhasil, terminal akan menampilkan output:
```text
▲ Next.js 16.3.0 (Turbopack)
- Local:        http://localhost:3002
- Environments: .env.local
✓ Ready in ...ms
```

Buka browser Anda di:
👉 **[http://localhost:3002](http://localhost:3002)**

---

## 🔍 Checklist Verifikasi (Memastikan Semuanya Normal)

- [ ] **Halaman Utama (`/`)**: Buka `http://localhost:3002`, daftar proyek tampil normal.
- [ ] **Master Data Users (`/master-data/users`)**: Data 4 akun pengguna (`@admin`, `@owner`, `@sitemanager`, `@management`) otomatis tampil karena ditarik langsung dari Supabase.
- [ ] **Uji Simpan Data**: Coba tambahkan 1 pengguna baru di laptop baru tersebut, lalu cek di dashboard Supabase bahwa datanya langsung bertambah.

---

## ⚠️ Troubleshooting (Kendala Umum di Windows)

#### 1. Pesan Error: *`Execution of scripts is disabled on this system` (PowerShell)*
Buka PowerShell as Administrator, lalu jalankan:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Port 3002 Sudah Terpakai (*Port in use*)
Jika port 3002 sedang dipakai aplikasi lain, Next.js akan otomatis mengalihkan ke port 3003, atau Anda bisa matikan proses yang memakai port 3002:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess -Force
```

#### 3. Data Users Tidak Muncul (Kosong)
Pastikan isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env.local` tidak ada spasi tambahan di awal/akhir dan diapit tanda kutip dua (`"`).
