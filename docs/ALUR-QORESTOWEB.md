# Dokumentasi Lengkap Qorestoweb — Self-Order Restoran via QR Code

## Ringkasan

Qorestoweb adalah aplikasi web self-order untuk restoran. Pelanggan scan QR code di meja, langsung masuk ke menu tanpa login, pilih makanan, dan bayar (tunai di kasir atau digital via Xendit QRIS).

**Tech Stack:** React (CRA), MUI, SweetAlert2, react-qr-code

---

## 1. Entry Point — Scan QR Code

### URL Format
```
Server Utama  : http://192.168.100.13/qorestoweb/menu?table={NOMOR_MEJA}
Server Cadangan: http://192.168.100.85/qorestoweb-cad/menu?table={NOMOR_MEJA}
```
Contoh: `http://192.168.100.13/qorestoweb/menu?table=07`

### Proses Saat URL Dibuka
1. `App.js` mount → `initTableId()` baca `?table=07` dari URL → simpan ke `sessionStorage`
2. Jika `?table=` ada (scan baru) → **reset semua data pelanggan sebelumnya** (cart, session, dll)
3. `loadAppConfig()` fetch `app.cfg` dari server → simpan konfigurasi runtime
4. `PrivateRoute` deteksi QR mode + belum login → panggil `signinAsGuest()`
5. `signinAsGuest()` login ke backend CSA dengan credential dari `app.cfg` (`qr_guest_user`/`qr_guest_pass`)
6. Jika server utama gagal → otomatis coba ke server cadangan
7. Setelah login berhasil → render halaman menu

### Tidak Ada Form Login
Pelanggan **tidak pernah melihat form login** di mode QR. Semua proses autentikasi otomatis dan silent.

---

## 2. Halaman Menu (`/menu`)

### Fitur
- Tampilkan katalog menu dari `bstock_x` backend
- Pencarian dengan debounce 500ms (tidak fetch setiap keystroke)
- Filter kategori via tab
- Gambar produk dari `cimageurl`
- Tambah item ke cart
- Catatan per item (2 field: Catatan 1 + Catatan 2)
- Indikator meja di kanan atas (misal "Meja 07")
- Tombol back hanya tampil di mode non-QR (akses kasir biasa)

### Data yang Disimpan
- Cart → `localStorage` key `QoCart`
- Table ID → `sessionStorage` key `qoTableId`

---

## 3. Halaman Checkout (`/checkout`)

### Informasi Pemesan
- **No. Meja**: otomatis dari QR (read-only, tidak bisa diubah)
- **Nama Pemesan**: wajib diisi
- **No. Telp**: opsional (boleh kosong)

### Validasi Meja Terisi
Saat klik "Lanjutkan Pesanan":
1. Fetch `getActiveOrders` dari `bqo_x` (filter hari ini: `dqodate >= date()`)
2. Cek apakah meja ini ada pesanan aktif (status bukan kosong)
3. **Jika ada pesanan aktif** → tampilkan dialog:
   - "Meja ini ada pesanan aktif. Pesanan baru akan dibuat terpisah dengan nomor order baru. Lanjutkan?"
   - Tombol "Ya, Buat Pesanan Baru" → lanjut
   - Tombol "Batal" → kembali
4. **Jika tidak ada** → langsung lanjut ke pembayaran

### Normalisasi Nomor Meja
- URL QR: `?table=07` → seatNumber: `"07"`
- Backend simpan ctabid: `"7"` (tanpa leading zero)
- Perbandingan: kedua-duanya di-`parseInt` sebelum compare

---

## 4. Pembayaran

### Mode yang Tersedia (dikontrol `app.cfg`)
| Setting | Efek |
|---------|------|
| `show_tunai_button: true` | Tampilkan opsi "Tunai" + "Bayar Digital" |
| `show_tunai_button: false` | Skip langsung ke pilihan channel Xendit |

### 4a. Bayar di Kasir (Tunai)
1. Submit pesanan ke `bqo_x` action `add`
2. Jika berhasil → tampilkan dialog "Pesanan Diterima!"
3. Pelanggan **wajib download bukti pesanan** (gambar PNG) sebelum bisa klik "Pesanan Baru"
4. Bukti pesanan berisi: nomor order, daftar item + catatan, total, meja, nama, waktu
5. Pelanggan tunjukkan gambar ini ke kasir saat bayar

### 4b. Bayar Digital (Xendit QRIS)
1. Pilih channel pembayaran (QRIS)
2. Generate QR Code pembayaran via Xendit Payment Request API
3. Pelanggan scan QR dari e-wallet/mobile banking
4. Polling/SSE menunggu konfirmasi pembayaran
5. Setelah lunas → submit pesanan ke `bqo_x` → tampilkan "Pesanan Berhasil!"
6. Pelanggan **wajib download struk** (gambar PNG bertuliskan LUNAS) sebelum bisa klik "Pesanan Baru"
7. Struk berisi: nomor bon, status LUNAS, daftar item, total

### Guard Download
- Mode HP (QR): wajib download dulu sebelum "Pesanan Baru"
- Mode PC (kasir): wajib cetak dulu sebelum "Pesanan Baru"
- Dikontrol via `show_print_button` di `app.cfg`

---

## 5. Payload ke Backend (`bqo_x` action `add`)

```json
{
  "qoHeaderInfo": {
    "dqodate": "20260813",
    "ctime": "14:30:00",
    "cqonum": "",
    "ctabid": "07",
    "cwhseid": "TOKO",
    "cremark": "Nama Pemesan",
    "customer": {
      "ccusid": "UMUM",
      "cinitial": "",
      "cnotelp": "08123456789",
      "cemail": ""
    },
    "csalesid": "TKO",
    "lmulsales": false,
    "creason": "-",
    "cadjdesc": "-",
    "creason2": "-",
    "cadjdesc2": "-",
    "cpaytype": "",
    "cbnkid": "T000",
    "ccrdnum": "",
    "nkupon": 0,
    "npctdisc": 0,
    "npctppn": 11,
    "namount": 71000,
    "ndp": 78810,
    "nsaleschg": 0,
    "cqofoot1": "",
    "cqofoot2": "",
    "cqofoot3": "",
    "referensi": {
      "crefnum": "1786521198",
      "creftrn": "1786521198"
    }
  },
  "lineItemsInfo": [
    {
      "nline": 1,
      "cgroup": "",
      "ctime": "",
      "crefnote": "",
      "cstocode": "AA-00006",
      "cstoname": "AA 8x15 (PO)",
      "csize": "",
      "cloc": "",
      "ncqo": 0,
      "nqqo": 1,
      "cuom": "KG",
      "ccpcode": "STD",
      "csalesid": "TKO",
      "nhrgjua": 37500,
      "cdisc": "",
      "ndisc": 0,
      "nrpdisc": 0,
      "cremark": "Tidak pedas",
      "cremark2": "Tambah sambal"
    }
  ],
  "paymentInfo": {
    "cbnkid": "T000",
    "namount": 78810
  }
}
```

### Field Catatan (3 cremark)
| Field | Lokasi | Isi |
|-------|--------|-----|
| `qoHeaderInfo.cremark` | Header | Nama pemesan |
| `lineItemsInfo[].cremark` | Detail per item | Catatan 1 |
| `lineItemsInfo[].cremark2` | Detail per item | Catatan 2 |

---

## 6. Handling Skenario & Edge Cases

### A. Pelanggan Scan Berkali-kali (Meja Sama)
- Setiap kali URL `?table=XX` dibuka → **reset total** (cart, session)
- Login ulang otomatis → mulai fresh
- Pesanan sebelumnya tetap ada di backend (nomor QO berbeda)

### B. Dua Pelanggan Scan Meja Sama (HP Berbeda)
- Backend support multi-session untuk satu secretkey
- Tidak saling menendang — masing-masing dapat `sessionid` berbeda
- Dialog "Meja ini ada pesanan aktif" muncul untuk pelanggan kedua
- Pelanggan kedua tetap bisa order (pesanan terpisah, nomor QO baru)

### C. Session Expired / Session di-LOCK
| Lokasi | Handling |
|--------|----------|
| Halaman menu (getDatas gagal) | Silent re-login → retry fetch |
| Checkout (fetchOccupiedTables gagal) | Silent re-login → retry fetch |
| Submit pesanan (add gagal) | Silent re-login → retry submit |
| Halaman login (redirect) | Auto `signinAsGuest` → redirect balik tanpa tampilkan form |
| Idle timeout | Di-skip di QR mode (tidak invalidasi session) |

**Deteksi session error**: pesan mengandung "expired", "tidak valid", "di-LOCK", atau "proses lain".

**Semua handling silent** — pelanggan tidak melihat pesan error session. Proses re-login dan retry terjadi di belakang layar.

### D. HP Mati/Tertutup, Buka Lagi
- Cart persist di `localStorage` → item pesanan masih ada
- Table ID persist di `sessionStorage` (per tab)
- Session mungkin expired → auto re-login saat fetch berikutnya

### E. Pindah Meja (Scan Meja Baru)
- `initTableId()` update table ID baru
- Cart di-clear otomatis
- Session di-reset → login ulang
- Mulai fresh di meja baru

### F. Internet Putus Saat Submit
- Try/catch → tampilkan "Server tidak bisa dijangkau. Coba lagi."
- Pesanan tidak terkirim, pelanggan bisa coba lagi

### G. Akses URL Tanpa `?table=`
- `PrivateRoute` redirect ke form login (mode kasir/admin biasa)
- Pelanggan restoran tidak akan sampai sini jika scan QR

### H. Server Utama Mati
- **App sudah load (dari cache/server lain)**: API fallback otomatis ke server cadangan
- **App belum load (kunjungan pertama)**: halaman tidak bisa load → pelanggan scan QR cadangan

---

## 7. Konfigurasi Runtime (`public/app.cfg`)

File ini bisa diedit langsung di server tanpa rebuild. Efek langsung setelah hard refresh browser.

```json
{
  "enable_fail_download": true,
  "debug_save_fail": "",
  "debug_local_save_fail": "",
  "server_mode": "primary",
  "server_label": "",
  "xendit_payment_timeout_minutes": 5,
  "xendit_show_simulate": false,
  "use_mock_bqo": false,
  "qr_session_key": "8c5cf26a7040c57dd4ae2e0feeec76e1",
  "qr_guest_user": "xsv1",
  "qr_guest_pass": "xsv1",
  "debug_screen": false,
  "show_print_button": false,
  "show_tunai_button": false
}
```

| Key | Default | Fungsi |
|-----|---------|--------|
| `qr_guest_user` | `"GUEST"` | Username untuk auto-login pelanggan QR |
| `qr_guest_pass` | `""` | Password untuk auto-login pelanggan QR |
| `qr_session_key` | `""` | Fallback static key jika login gagal |
| `show_print_button` | `true` | `false` = hide tombol cetak, tampilkan download |
| `show_tunai_button` | `true` | `false` = hide opsi tunai, langsung ke Xendit |
| `xendit_show_simulate` | `false` | `true` = tampilkan tombol simulasi bayar (test mode) |
| `xendit_payment_timeout_minutes` | `5` | Timeout pembayaran Xendit (menit) |
| `debug_screen` | `false` | `true` = tampilkan debug panel di layar |
| `enable_fail_download` | `false` | `true` = tampilkan opsi unduh data gagal (mode kasir) |
| `use_mock_bqo` | `false` | `true` = pakai data mock tanpa backend |
| `server_mode` | `"primary"` | `"primary"` atau `"local"` |

---

## 8. Environment Variables

### Shared (`.env`)
```env
REACT_APP_USE_XENDIT_PAYMENT=Y
REACT_APP_XENDIT_MODE=payment-request
REACT_APP_CASH_BANK_CODE=T000
REACT_APP_XENDIT_BANK_CODE=X000
REACT_APP_TAX_BASE=12
REACT_APP_TAX_EFFECTIVE_RATE=11/12
REACT_APP_TABLE_COUNT=20
REACT_APP_BQO_DEFAULT_CUSTOMER=UMUM
REACT_APP_BQO_DEFAULT_WHSE=TOKO
REACT_APP_BQO_DEFAULT_SALES=TKO
REACT_APP_BQO_DEFAULT_CPCODE=STD
REACT_APP_MENU_GETIMAGE=Y
```

### Production Primary (`.env.prod`)
```env
PUBLIC_URL=/qorestoweb/
BUILD_PATH=build/prod/qorestoweb
REACT_APP_API_ENDPOINT=http://192.168.100.13/api
REACT_APP_API_LOCAL_ENDPOINT=http://192.168.100.85/api
```

### Production Cadangan (`.env.prod.cadangan`)
```env
PUBLIC_URL=/qorestoweb-cad/
BUILD_PATH=build/prod/qorestoweb-cad
REACT_APP_API_ENDPOINT=http://192.168.100.85/api
REACT_APP_API_LOCAL_ENDPOINT=http://192.168.100.13/api
```

### Pajak
- BASE = 12%, Effective Rate = 11/12
- Pajak efektif ke pelanggan = 12 × (11/12) = **11%**

---

## 9. Arsitektur Server & Fallback

### Infrastruktur
```
┌─────────────────────┐        ┌─────────────────────┐
│  Server Utama .13   │        │  Server Cadangan .85│
│  ─────────────────  │        │  ─────────────────  │
│  /qorestoweb/       │        │  /qorestoweb-cad/  │
│  /api/csa/resto/    │        │  /api/csa/resto/    │
│  /xendit-csa/       │        │  /xendit-csa/       │
└─────────────────────┘        └─────────────────────┘
         ▲                              ▲
         │ Primary                      │ Fallback
         └──────────── APP ─────────────┘
```

### Fallback API (di level aplikasi)
Semua API call (`bqo_api.js`) menggunakan `_fetchWithFallback()`:
1. Coba request ke server utama (timeout 15 detik)
2. Jika gagal (network error/timeout) → otomatis retry ke server cadangan
3. Response dari fallback ditandai `_source: 'fallback'`

Berlaku untuk:
- `signinAsGuest()` — login
- `fetchStock()` — ambil menu
- `fetching()` — semua operasi BQO (getlist, add)

### Keterbatasan
- Jika server utama mati dan pelanggan belum pernah akses → halaman tidak bisa load
- Solusi: **2 QR per meja** (utama + cadangan)

---

## 10. QR Code Generator

### Akses
```
http://192.168.100.13/qorestoweb/qr-tables.html
```

### Fitur
- Toggle Production / Development mode
- **Dual QR per meja**: QR utama (besar, 150x150) + QR cadangan (kecil, 80x80)
- QR utama → `http://192.168.100.13/qorestoweb/menu?table=XX`
- QR cadangan → `http://192.168.100.85/qorestoweb-cad/menu?table=XX`
- Label "⚠️ Jika tidak bisa dibuka, scan ini:" di QR cadangan
- URL server utama dan cadangan bisa diedit manual
- Generate QR untuk semua meja sekaligus
- Print-friendly (Ctrl+P) — layout 3 kolom
- QR dev mode berwarna merah untuk pembeda visual
- Library QR: CDN + fallback lokal (`vendor/qrcode.min.js`)

### Layout Card Meja (Production)
```
┌──────────────────────────┐
│        🏪 PROD           │
│        QORESTO           │
│       Meja 07            │
│                          │
│   ┌────────────────┐     │
│   │   QR UTAMA     │     │
│   │   (150×150)    │     │
│   │   → .13        │     │
│   └────────────────┘     │
│   📱 Scan untuk memesan  │
│                          │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│ ⚠️ Jika tidak bisa:     │
│                          │
│      ┌──────────┐        │
│      │ QR CADG  │        │
│      │ (80×80)  │        │
│      │  → .85   │        │
│      └──────────┘        │
│ http://192.168.100.85/   │
│ qorestoweb-cad/menu...  │
└──────────────────────────┘
```

---

## 11. File-file Utama

| Path | Fungsi |
|------|--------|
| `src/scripts/App.js` | Entry point, init table, load config |
| `src/scripts/routes/PrivateRoute.js` | Auth guard, auto-login QR mode |
| `src/scripts/contexts/AuthContext.js` | Login biasa + `signinAsGuest` + idle timer |
| `src/scripts/utils/table-session.js` | Baca/simpan nomor meja dari URL |
| `src/scripts/utils/app-config.js` | Baca `app.cfg` runtime config |
| `src/scripts/modules/BQO/views/bqo_home.js` | Halaman menu/katalog |
| `src/scripts/modules/BQO/views/bqo_checkout.js` | Halaman checkout + submit pesanan |
| `src/scripts/modules/BQO/views/bqo_payment.js` | Halaman pembayaran Xendit |
| `src/scripts/modules/BQO/controllers/bqo_api.js` | API calls + fallback server |
| `src/scripts/modules/LOGIN/index.js` | Halaman login (+ auto-redirect QR mode) |
| `src/scripts/Config.js` | Config statis (BASE_URL, USE_BRWDEF, dll) |
| `src/scripts/routes/ApiRoute.js` | URL endpoint API |
| `public/app.cfg` | Runtime config (bisa edit tanpa rebuild) |
| `public/qr-tables.html` | Generator QR code per meja |
| `public/vendor/qrcode.min.js` | Library QR (offline fallback) |
| `env/qorestoweb/.env` | Shared env variables |
| `env/qorestoweb/.env.prod` | Production primary env |
| `env/qorestoweb/.env.prod.cadangan` | Production cadangan env |
| `env/qorestoweb/.env.dev` | Development env |

---

## 12. Build & Deploy

### Build Production (Primary)
```bash
yarn prod:qorestoweb
```
Output: `build/prod/qorestoweb/` → deploy ke `.13` di path `/qorestoweb/`

### Build Production (Cadangan)
```bash
yarn prod:qorestoweb-cad
```
Output: `build/prod/qorestoweb-cad/` → deploy ke `.85` di path `/qorestoweb-cad/`

### Development
```bash
yarn dev:qorestoweb
```
Berjalan di `http://localhost:3000/qorestoweb/`

### File yang Perlu Di-deploy
- Seluruh isi folder build
- `app.cfg` (bisa diedit post-deploy tanpa rebuild)

---

## 13. Catatan Teknis

### Pajak
- Formula: `TAX_BASE × TAX_EFFECTIVE_RATE = 12 × (11/12) = 11%`
- Dikonfigurasi via env: `REACT_APP_TAX_BASE` dan `REACT_APP_TAX_EFFECTIVE_RATE`

### Session
- Backend CSA support multi-session per secretkey
- Satu user (`xsv1`) bisa punya banyak `sessionid` aktif bersamaan
- Cocok untuk skenario banyak pelanggan scan QR bersamaan

### Cart Storage
- `localStorage` key `QoCart` — format: `{ [itemId]: { item, qty, note, note2 } }`
- Persist antar page navigation, hilang saat scan QR baru atau clear browser

### Debug Mode
- Set `debug_screen: true` di `app.cfg`
- Panel debug muncul di bagian atas layar (tidak menghalangi klik — `pointerEvents: none`)
- Tampilkan: table ID, session key, log fetch, error login
- **Matikan di production** (`debug_screen: false`)
