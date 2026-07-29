# Major Update: Payment System, Dual Server & Printout

**Tanggal**: 29 Juli 2026  
**Project**: qorestoweb  
**Referensi**: webcsa-v2 (trenly) sebagai basis implementasi

---

## 1. Ringkasan Perubahan

Update ini menambahkan tiga fitur besar ke modul BQO (restoran):

| Fitur | Deskripsi |
|---|---|
| **Payment System** | Dialog pilihan bayar di kasir atau mandiri (Tunai / Xendit) |
| **Dual Server** | Fallback otomatis ke server lokal jika server utama mati |
| **Printout Struk** | Cetak struk thermal 80mm dengan variasi per kondisi server |
| **Build Otomatis** | Script build untuk server utama dan server cadangan |

---

## 2. Alur Baru Konsumen

```
Menu → Pilih Item → Checkout (isi info meja/nama/telp)
         ↓
  [ Dialog Pilihan Pembayaran ]
         │
   ┌─────┴─────────────────────┐
   │                           │
Bayar di Kasir          Bayar Mandiri
   │                           │
bqo_api.add()          Halaman /payment
Toast sukses                   │
Kembali ke menu         ┌──────┴──────────┐
                        │                 │
                      Tunai           Xendit
                        │          (QRIS/VA/Ewallet)
                   bqo_api.add()    PHP Gateway
                        │          SSE/Polling
                   Cetak Struk      bqo_api.add()
                                    Cetak Struk
```

---

## 3. File yang Dibuat (Baru)

### 3.1 Utilities

| File | Fungsi |
|---|---|
| `src/scripts/utils/app-config.js` | Baca runtime config dari `public/app.cfg` tanpa rebuild. Menyimpan ke sessionStorage sebagai cache. |
| `src/scripts/utils/payment-api.js` | `fetchPaymentAPI()` — fetch ke PHP Xendit gateway dengan auto-fallback ke server lokal jika primary tidak bisa dijangkau. |
| `src/scripts/utils/failed-trx-download.js` | Hook `useFailedTrxDownload` — download payload transaksi gagal sebagai JSON untuk rekonsiliasi manual. |

### 3.2 BQO Controllers

| File | Fungsi |
|---|---|
| `src/scripts/modules/BQO/controllers/bqo_api.js` | **Update:** Tambah method `addToLocal()` — kirim transaksi ke server lokal via auto-login/logout sementara. |

### 3.3 BQO Hooks

| File | Fungsi |
|---|---|
| `src/scripts/modules/BQO/hooks/useXenditPayment.js` | Lifecycle penuh Xendit: create invoice/payment-request → SSE status → polling fallback → callback sukses/gagal. |
| `src/scripts/modules/BQO/hooks/usePrintReceipt.js` | Cetak struk via popup window (tidak butuh library tambahan, aman saat server mati). |

### 3.4 BQO Reports

| File | Fungsi |
|---|---|
| `src/scripts/modules/BQO/reports/BQOReceipt.jsx` | Komponen struk thermal 80mm. Menampilkan nomor meja, pemesan, item pesanan, total, pajak, metode bayar. Mendukung flag `isLocalServer`, `showArchiveCopy`, `isUnrecorded`. |

### 3.5 BQO Views

| File | Fungsi |
|---|---|
| `src/scripts/modules/BQO/views/bqo_payment.js` | **Halaman payment baru** (`/payment`). Menangani: pilih metode (tunai/xendit), save ke backend, fallback server lokal, retry, cetak struk, new order. |

### 3.6 BBANK Module

| File | Fungsi |
|---|---|
| `src/scripts/modules/BBANK/controllers/bbank_api.js` | `getList()` — ambil daftar channel pembayaran dari backend (QRIS, OVO, BCA VA, dll). |

### 3.7 Build & Config

| File | Fungsi |
|---|---|
| `build-deploy.cjs` | Script build otomatis untuk server utama dan cadangan. Menggantikan fungsi `vite-plugin-static-copy` di webcsa-v2. |
| `public/app.cfg` | Runtime config server utama. Bisa diedit di server **tanpa rebuild**. |
| `public/app.cfg.cadangan` | Runtime config server cadangan. Di-copy ke `build/app.cfg` saat `yarn build:cadangan`. |

---

## 4. File yang Diupdate

| File | Perubahan |
|---|---|
| `src/scripts/routes/ApiRoute.js` | Tambah `BBANK_X` endpoint |
| `src/scripts/modules/BQO/index.js` | Tambah route `/payment` → `BQOPayment` |
| `src/scripts/modules/BQO/views/bqo_checkout.js` | Tambah dialog pilihan kasir/mandiri. Bayar kasir: langsung submit. Bayar mandiri: navigate ke `/payment`. |
| `src/scripts/App.js` | Tambah `loadAppConfig()` saat app pertama mount |
| `env/qorestoweb/.env` | Tambah shared env vars (xendit, bank code) |
| `env/qorestoweb/.env.prod` | Env production primary dengan `BUILD_PATH` dan `PUBLIC_URL` |
| `env/qorestoweb/.env.prod.cadangan` | Env production cadangan dengan `BUILD_PATH` dan `PUBLIC_URL` berbeda |
| `package.json` | Script build diganti ke pola trenly (`prod:qorestoweb`, `prod:qorestoweb-cadangan`, dll) |

---

## 5. Environment Variables Baru

Ditambahkan ke `env/qorestoweb/.env` (shared) dan masing-masing file env:

| Key | File | Nilai Default | Keterangan |
|---|---|---|---|
| `REACT_APP_API_LOCAL_ENDPOINT` | `.env.prod` / `.env.prod.cadangan` | `http://192.168.100.85/api` | URL server lokal (fallback) |
| `REACT_APP_PAYMENT_API_ENDPOINT` | `.env.prod` / `.env.prod.cadangan` | `http://192.168.100.13/xendit-csa/endpoints` | PHP Xendit gateway utama |
| `REACT_APP_PAYMENT_API_LOCAL_ENDPOINT` | `.env.prod` / `.env.prod.cadangan` | `http://192.168.100.85/xendit-csa/endpoints` | PHP Xendit gateway lokal |
| `REACT_APP_USE_XENDIT_PAYMENT` | `.env` (shared) | `N` | `Y` untuk aktifkan pilihan Xendit di dialog |
| `REACT_APP_XENDIT_MODE` | `.env` (shared) | `invoice` | `invoice` atau `payment-request` |
| `REACT_APP_CASH_BANK_CODE` | `.env` (shared) | `TUNAI` | Kode bank untuk pembayaran tunai |
| `REACT_APP_XENDIT_BANK_CODE` | `.env` (shared) | `XENDIT` | Kode bank untuk pembayaran Xendit |

---

## 6. Runtime Config — `app.cfg`

File ini bisa diedit langsung di server tanpa perlu rebuild ulang.

```json
{
  "enable_fail_download": true,
  "debug_save_fail": "",
  "debug_local_save_fail": "",
  "server_mode": "primary",
  "server_label": "",
  "xendit_payment_timeout_minutes": 5,
  "xendit_show_simulate": false
}
```

| Key | Nilai | Efek |
|---|---|---|
| `server_mode` | `"primary"` / `"local"` | Label server di struk dan dialog retry |
| `server_label` | string | Override label server di UI (opsional) |
| `enable_fail_download` | `true` / `false` | Tampilkan tombol unduh JSON saat kedua server gagal |
| `xendit_payment_timeout_minutes` | angka | Timeout polling Xendit (default 5 menit) |
| `debug_save_fail` | `"network_error"` / `"backend_reject"` / `""` | Simulasi kegagalan save — hanya untuk testing |
| `debug_local_save_fail` | `"network_error"` / `""` | Simulasi kegagalan server lokal — hanya untuk testing |

---

## 7. Dual Server — Cara Kerja

```
bqo_api.add()  →  Server Utama (timeout 15 detik)
      ✅ sukses    → simpan, set nomorBon, tampilkan cetak struk
      ❌ network   → ConfirmDialog:
                       [Simpan ke Server Lokal]  [Coba Lagi]
                              ↓
                     bqo_api.addToLocal()
                              ↓
                    ✅ sukses → isSavedToLocal = true
                               struk tampil dengan label "SERVER CADANGAN"
                    ❌ gagal  → AlertDialog unduh JSON (jika enable_fail_download)
```

**Mekanisme `addToLocal()`:**
1. Baca credential dari `localStorage` (`auth_local_user`, `auth_local_pass`)
2. Login sementara ke server lokal → dapat `secretkey` & `sessionid`
3. Kirim transaksi ke `{LOCAL_URL}/csa/resto/bqo_x`
4. Logout dari server lokal
5. Bersihkan safety-net di `sessionStorage`

**Setelah cetak struk** (jika `isSavedToLocal === true`):
- App ping server utama (`HEAD` request, timeout 2 detik)
- Jika masih mati → `ToastBar` warning
- Jika sudah hidup → lanjut seperti biasa

---

## 8. Xendit Payment — Cara Kerja

```
Konsumen pilih channel (QRIS / VA / Ewallet)
      ↓
useXenditPayment.handleFetchXenditPayment(item)
      ↓
POST ke PHP Gateway (create-invoice.php / create-payment-request.php)
      ↓
Response PENDING → simpan referenceId + paymentRequestId
      ↓
SSE: EventSource /payment-stream.php
  ↓ jika SSE tidak support / error → fallback polling tiap 5 detik
      ↓
Status SUCCEEDED/PAID
  → onPaymentSuccess callback
  → executeSave() dengan cbnkid = XENDIT_BANK_CODE
  → bqo_api.add() → simpan ke backend
  → tampilkan cetak struk
```

**Mode Xendit** (via `REACT_APP_XENDIT_MODE`):

| Mode | Endpoint | Keterangan |
|---|---|---|
| `invoice` | `create-invoice.php` | Konsumen buka link invoice, pilih metode sendiri |
| `payment-request` | `create-payment-request.php` | QR/VA tampil langsung di layar |

---

## 9. Printout Struk

Komponen: `BQOReceipt.jsx` — thermal 80mm, font monospace.

**Isi struk:**
- Nama toko: QORESTO
- No. Bon (dari backend atau externalId)
- Tanggal & waktu cetak
- Nomor meja, nama pemesan, no. telepon
- Daftar item: nama, qty × harga, subtotal
- Catatan per item (jika ada)
- Subtotal → Pajak (11%) → Total Pembayaran
- Metode pembayaran

**Variasi struk berdasarkan kondisi:**

| Kondisi | Tampilan Tambahan |
|---|---|
| Server utama berhasil | Struk normal |
| Disimpan ke server lokal (`isSavedToLocal`) | Badge `[ SERVER CADANGAN ]` + salinan arsip kedua |
| Kedua server gagal, payload diunduh (`isManuallyCompleted`) | Watermark `⚠ BELUM TEREKAM DI SERVER` |
| Build cadangan aktif (`server_mode: "local"` di app.cfg) | Selalu tampilkan badge `[ SERVER CADANGAN ]` |

---

## 10. Build Otomatis

### Scripts di `package.json` (pola tiruan webcsa-v2/trenly):

```bash
yarn dev:qorestoweb             # Dev server (API: .13)
yarn qa:qorestoweb              # Dev server QA (API: localhost:3002)
yarn prod:qorestoweb            # Build server UTAMA  → build/prod/qorestoweb/
yarn prod:qorestoweb-cadangan   # Build server CADANGAN → build/prod/qorestoweb-cad/
yarn prod:qorestoweb-all        # Build keduanya sekaligus
```

### Struktur env file (tiruan trenly):

```
env/qorestoweb/
├── .env                  → shared (xendit config, bank code)
├── .env.dev              → development
├── .env.qa               → qa / testing
├── .env.prod             → production primary
└── .env.prod.cadangan    → production cadangan
```

### Yang dilakukan `build-deploy.cjs`:

1. Baca `BUILD_PATH` dan `PUBLIC_URL` dari env (sudah di-inject `env-cmd`)
2. Hapus folder target lama
3. Jalankan CRA build — CRA v5 otomatis pakai `BUILD_PATH` dari env
4. Copy `app.cfg` yang sesuai ke dalam folder hasil build:
   - `primary` → `public/app.cfg` (server_mode: primary)
   - `cadangan` → `public/app.cfg.cadangan` (server_mode: local)
5. Tampilkan ringkasan isi `app.cfg` yang diterapkan

### Output folder:

```
build/prod/
├── qorestoweb/        ← URL: /qorestoweb/   (PRIMARY)
└── qorestoweb-cad/    ← URL: /qorestoweb-cad/ (CADANGAN)
```

### Perbedaan env primary vs cadangan:

| Setting | Primary (`.env.prod`) | Cadangan (`.env.prod.cadangan`) |
|---|---|---|
| `PUBLIC_URL` | `/qorestoweb/` | `/qorestoweb-cad/` |
| `BUILD_PATH` | `build/prod/qorestoweb` | `build/prod/qorestoweb-cad` |
| `REACT_APP_API_ENDPOINT` | `192.168.100.13` | `192.168.100.85` |
| `REACT_APP_API_LOCAL_ENDPOINT` | `192.168.100.85` | `192.168.100.13` |
| `REACT_APP_PAYMENT_API_ENDPOINT` | `192.168.100.13` | `192.168.100.85` |
| `app.cfg server_mode` | `"primary"` | `"local"` |

---

## 11. Perbandingan dengan webcsa-v2 (trenly)

| Aspek | webcsa-v2 trenly | qorestoweb |
|---|---|---|
| Build tool | Vite | CRA (react-scripts) |
| Config runtime | `vite-plugin-static-copy` copy app.cfg | `build-deploy.cjs` copy app.cfg |
| Payment module | `bjual_payment.jsx` + `BJUAL_X` | `bqo_payment.js` + `BQO_X` |
| Save ke lokal | `bjual_api.addToLocal()` | `bqo_api.addToLocal()` |
| Template struk | `xrprnjua.js` (external, runtime) | `BQOReceipt.jsx` (inline JSX) |
| Print library | `react-to-print` | Native popup window |
| Dialog pilih metode | `handleGoToPaymentPage()` + SweetAlert2 | Dialog MUI inline di `bqo_checkout.js` |
| Pilihan bayar kasir | ❌ (kasir yang input) | ✅ Konsumen bisa pilih bayar di kasir |

---

## 12. Yang Belum Diimplementasikan (Roadmap)

| Item | Keterangan |
|---|---|
| `BBANK_X` data di backend | Backend perlu menyediakan data channel bayar untuk endpoint `bbank_x` |
| Auto-sync lokal → utama | Setelah server utama hidup kembali, transaksi lokal perlu di-sync manual atau otomatis |
| Credential fallback yang aman | `auth_local_user` / `auth_local_pass` di localStorage adalah solusi sementara — perlu shared session store |
| Aktivasi Xendit | Set `REACT_APP_USE_XENDIT_PAYMENT=Y` di `env/qorestoweb/.env` dan pastikan PHP gateway server sudah berjalan |
| Backend `bqo_x` terima `paymentInfo` | Backend perlu handle field `paymentInfo: { cbnkid, namount }` dalam action `add` |

---

*Dokumentasi ini dibuat berdasarkan implementasi pada 29 Juli 2026.*  
*Referensi: `webcsa-v2/src/scripts/modules/BJUAL/` (trenly payment system)*
