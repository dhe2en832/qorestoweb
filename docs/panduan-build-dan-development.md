# Panduan Build Production & Mode Development

**Project**: qorestoweb  
**Build tool**: Create React App (CRA) + `env-cmd` + `build-deploy.cjs`

---

## Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Struktur Environment](#2-struktur-environment)
3. [Mode Development](#3-mode-development)
4. [Build Production — Server Utama](#4-build-production--server-utama)
5. [Build Production — Server Cadangan](#5-build-production--server-cadangan)
6. [Build Keduanya Sekaligus](#6-build-keduanya-sekaligus)
7. [Deploy ke Server](#7-deploy-ke-server)
8. [Edit Config Tanpa Rebuild](#8-edit-config-tanpa-rebuild-appcfg)
9. [Referensi Semua Scripts](#9-referensi-semua-scripts)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prasyarat

Pastikan sudah terinstall:

```bash
# Cek Node.js (minimal v16)
node --version

# Cek Yarn
yarn --version

# Install dependencies jika belum
yarn install
```

---

## 2. Struktur Environment

File konfigurasi tersimpan di folder `env/qorestoweb/` (pola tiruan webcsa-v2/trenly).

```
env/qorestoweb/
├── .env                  → shared config (xendit, bank code, dll)
├── .env.dev              → dev server lokal, API ke 192.168.100.13
├── .env.qa               → testing lokal, API ke localhost:3002
├── .env.prod             → build SERVER UTAMA (.13 sebagai utama)
└── .env.prod.cadangan    → build SERVER CADANGAN (.85 sebagai utama)
```

### Peta IP per environment

| Environment | API Utama | API Fallback | Payment API |
|---|---|---|---|
| `.env.dev` | 192.168.100.13 | 192.168.100.85 | 192.168.100.13 |
| `.env.qa` | localhost:3002 | — | — |
| `.env.prod` (utama) | **192.168.100.13** | 192.168.100.85 | **192.168.100.13** |
| `.env.prod.cadangan` | **192.168.100.85** | 192.168.100.13 | **192.168.100.85** |

> **Aturan**: Server utama selalu `.13`, server cadangan `.85` sebagai utama dengan `.13` sebagai fallback-nya.

---

## 3. Mode Development

Untuk menjalankan aplikasi di komputer pengembang (hot-reload aktif):

```bash
yarn dev:qorestoweb
```

Ini menjalankan dev server CRA dengan env dari `.env` + `.env.dev`:
- API → `http://192.168.100.13/api`
- URL app → `http://localhost:3000/qorestoweb/`
- Xendit payment → **nonaktif** (`REACT_APP_USE_XENDIT_PAYMENT=N`)

### Aktifkan Xendit saat development

Edit `env/qorestoweb/.env`:

```
REACT_APP_USE_XENDIT_PAYMENT=Y
REACT_APP_XENDIT_MODE=invoice
```

Kemudian restart dev server:

```bash
yarn dev:qorestoweb
```

### Mode QA (localhost API)

Jika API berjalan di komputer sendiri (port 3002):

```bash
yarn qa:qorestoweb
```

---

## 4. Build Production — Server Utama

Server utama = **192.168.100.13** sebagai API utama, 192.168.100.85 sebagai fallback.

```bash
yarn prod:qorestoweb
```

### Yang dilakukan otomatis:

1. Hapus folder `build/prod/qorestoweb/` lama
2. Build CRA dengan env `.env` + `.env.prod`:
   - `REACT_APP_API_ENDPOINT` = `http://192.168.100.13/api`
   - `REACT_APP_API_LOCAL_ENDPOINT` = `http://192.168.100.85/api`
   - `PUBLIC_URL` = `/qorestoweb/`
   - `BUILD_PATH` = `build/prod/qorestoweb`
3. Copy `public/app.cfg` → `build/prod/qorestoweb/app.cfg`:
   ```json
   { "server_mode": "primary", "server_label": "" }
   ```

### Output:

```
build/prod/qorestoweb/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── index.html
├── app.cfg          ← server_mode: "primary"
├── favicon.ico
└── ...
```

### Contoh output terminal:

```
╔══════════════════════════════════════════════════╗
║  QORESTOWEB BUILD — PRIMARY                      ║
╠══════════════════════════════════════════════════╣
║  Mode       : primary                            ║
║  PUBLIC_URL : /qorestoweb/                       ║
║  BUILD_PATH : build/prod/qorestoweb              ║
║  app.cfg    : app.cfg                            ║
╚══════════════════════════════════════════════════╝

🧹  Membersihkan build lama...
⚙️   Menjalankan CRA build...
📋  Menyalin app.cfg (primary)...
    ✅  app.cfg → build/prod/qorestoweb/app.cfg

╔══════════════════════════════════════════════════╗
║  ✅  BUILD PRIMARY SELESAI!                      ║
║  📁  Output: ./build/prod/qorestoweb/            ║
╚══════════════════════════════════════════════════╝
```

---

## 5. Build Production — Server Cadangan

Server cadangan = **192.168.100.85** sebagai API utama, 192.168.100.13 sebagai fallback.

```bash
yarn prod:qorestoweb-cadangan
```

### Yang dilakukan otomatis:

1. Hapus folder `build/prod/qorestoweb-cad/` lama
2. Build CRA dengan env `.env` + `.env.prod.cadangan`:
   - `REACT_APP_API_ENDPOINT` = `http://192.168.100.85/api`
   - `REACT_APP_API_LOCAL_ENDPOINT` = `http://192.168.100.13/api`
   - `PUBLIC_URL` = `/qorestoweb-cad/`
   - `BUILD_PATH` = `build/prod/qorestoweb-cad`
3. Copy `public/app.cfg.cadangan` → `build/prod/qorestoweb-cad/app.cfg`:
   ```json
   { "server_mode": "local", "server_label": "SERVER CADANGAN" }
   ```

### Efek `server_mode: "local"` pada aplikasi:

- Struk menampilkan badge **[ SERVER CADANGAN ]**
- Dialog retry saat gagal menyebut "Server Ini" dan "Server Utama" (bukan "Server Pusat")
- Salinan arsip otomatis ditampilkan di struk

### Output:

```
build/prod/qorestoweb-cad/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── index.html
├── app.cfg          ← server_mode: "local", server_label: "SERVER CADANGAN"
├── favicon.ico
└── ...
```

---

## 6. Build Keduanya Sekaligus

Build ini menjalankan dua proses secara **berurutan**. Hasil masing-masing tersimpan di folder terpisah — tidak saling menimpa.

```bash
yarn prod:qorestoweb-all
```

Hasil:
```
build/prod/
├── qorestoweb/        ← PRIMARY  (URL: /qorestoweb/)
└── qorestoweb-cad/    ← CADANGAN (URL: /qorestoweb-cad/)
```

---

## 7. Deploy ke Server

Setelah build selesai, salin isi folder hasil build ke web server.

### Deploy ke server utama (192.168.100.13):

Salin isi `build/prod/qorestoweb/` ke direktori web server:
```
htdocs/qorestoweb/
```

Pastikan struktur file di server:
```
/qorestoweb/
├── index.html
├── app.cfg          ← server_mode: "primary"
├── static/
└── ...
```

### Deploy ke server cadangan (192.168.100.85):

Salin isi `build/prod/qorestoweb-cad/` ke:
```
htdocs/qorestoweb-cad/
```

File `app.cfg` akan otomatis berisi `server_mode: "local"`.

### Web server config (Apache `.htaccess`)

Untuk React Router (SPA) agar refresh halaman tidak 404, buat file `.htaccess` di masing-masing folder:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

Pastikan `mod_rewrite` aktif di Apache (`httpd.conf`):
```
LoadModule rewrite_module modules/mod_rewrite.so
```

---

## 8. Edit Config Tanpa Rebuild (`app.cfg`)

File `app.cfg` di folder build bisa diedit langsung di server **tanpa perlu rebuild dan deploy ulang**.

Lokasi di server:
- Utama: `htdocs/qorestoweb/app.cfg`
- Cadangan: `htdocs/qorestoweb-cad/app.cfg`

### Contoh: Aktifkan download failsafe

```json
{
  "enable_fail_download": true
}
```

### Contoh: Ubah timeout Xendit menjadi 10 menit

```json
{
  "xendit_payment_timeout_minutes": 10
}
```

### Contoh: Simulasi error save (untuk testing)

```json
{
  "debug_save_fail": "network_error"
}
```

> Setelah selesai testing, kosongkan kembali: `"debug_save_fail": ""`

### Semua key yang tersedia di `app.cfg`:

| Key | Tipe | Default | Keterangan |
|---|---|---|---|
| `server_mode` | `"primary"` / `"local"` | `"primary"` | Menentukan label server di UI dan struk |
| `server_label` | string | `""` | Override label server (kosong = pakai default) |
| `enable_fail_download` | boolean | `true` | Tampilkan tombol unduh JSON jika kedua server gagal |
| `xendit_payment_timeout_minutes` | number | `5` | Timeout polling status Xendit (menit) |
| `xendit_show_simulate` | boolean | `false` | Tampilkan tombol simulasi bayar (testing only) |
| `debug_save_fail` | `""` / `"network_error"` / `"backend_reject"` | `""` | Simulasi gagal save ke server utama |
| `debug_local_save_fail` | `""` / `"network_error"` | `""` | Simulasi gagal save ke server lokal |

> **Perubahan langsung efektif** setelah refresh browser — tidak perlu restart server.

---

## 9. Referensi Semua Scripts

```bash
# ── Development ──────────────────────────────────────────────────────────────
yarn dev:qorestoweb             # Dev server (API: .13, URL: /qorestoweb/)
yarn qa:qorestoweb              # Dev server QA (API: localhost:3002)

# ── Build Production ──────────────────────────────────────────────────────────
yarn prod:qorestoweb            # Build SERVER UTAMA  → build/prod/qorestoweb/
yarn prod:qorestoweb-cadangan   # Build SERVER CADANGAN → build/prod/qorestoweb-cad/
yarn prod:qorestoweb-all        # Build keduanya berurutan

# ── Utilities ─────────────────────────────────────────────────────────────────
yarn changelog                  # Generate changelog harian
yarn ship                       # Commit + push ke Git
yarn new-package                # Hapus node_modules + yarn.lock, install ulang
```

---

## 10. Troubleshooting

### Build gagal: `env-cmd: command not found`

```bash
yarn install
```

Pastikan `env-cmd` ada di `devDependencies`.

### Build gagal: `Cannot read properties of undefined (reading 'trim')`

Berarti env var `REACT_APP_API_ENDPOINT` tidak terbaca. Pastikan:
- File `env/qorestoweb/.env.prod` atau `.env.prod.cadangan` ada
- Menjalankan lewat `prod:qorestoweb` atau `prod:qorestoweb-cadangan`, bukan `yarn build` langsung

### Dev server tidak bisa akses API (CORS error)

API server di 192.168.100.13 harus mengizinkan origin `http://localhost:3000`.  
Atau gunakan proxy di `package.json`:

```json
"proxy": "http://192.168.100.13"
```

### `app.cfg` tidak terbaca di browser

Pastikan file ada di root folder build (bukan di subfolder):
```
build/prod/qorestoweb/app.cfg   ✅
build/prod/qorestoweb/static/app.cfg  ❌
```

Jika pakai `prod:qorestoweb` atau `prod:qorestoweb-cadangan`, ini ditangani otomatis.

### Setelah edit `app.cfg` di server, perubahan tidak efektif

Hard refresh browser: **Ctrl + Shift + R** (Windows) atau **Cmd + Shift + R** (Mac).  
Config di-cache di `sessionStorage` — tab baru atau hard refresh akan membaca ulang dari server.

### Struk tidak tercetak (popup diblokir)

Browser memblokir popup. Izinkan popup untuk domain aplikasi:
- Chrome: klik ikon 🔒 di address bar → **Izinkan pop-up**
- Atau buka `chrome://settings/content/popups` dan tambahkan pengecualian

---

*Dokumen ini berlaku untuk qorestoweb versi setelah update 29 Juli 2026.*
