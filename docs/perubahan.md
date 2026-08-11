# Perubahan Konsep Meja — qorestoweb

**Tanggal**: 8 Agustus 2026  
**Status**: Implemented

---

## Ringkasan

Konsep pemilihan nomor meja diubah dari **input manual oleh customer** menjadi **otomatis dari URL parameter** yang sudah ditentukan per meja.

---

## Konsep Lama

Customer membuka app lalu **memilih sendiri nomor mejanya** dari dropdown di halaman checkout.

```
Buka App → Menu → Checkout → [Pilih Meja dari Dropdown] → Pesan
```

**Masalah:**
- Customer bisa salah pilih meja
- Tidak ada jaminan meja yang dipilih sesuai posisi fisik customer
- UX kurang intuitif — customer harus tahu nomor mejanya sendiri

---

## Konsep Baru

Setiap meja dilengkapi **QR Code** atau **stiker URL** yang sudah berisi nomor meja di dalamnya. Customer cukup scan QR code — app langsung tahu customer ada di meja berapa.

```
Scan QR Meja → App buka otomatis dengan ?table=01 → Menu → Checkout (meja sudah terisi) → Pesan
```

**Keunggulan:**
- Nomor meja **100% akurat** — tidak bisa salah pilih
- Customer tidak perlu input apapun untuk nomor meja
- UX lebih simpel dan cepat

---

## Format URL

```
http://{SERVER}/qorestoweb/menu?table={NOMOR_MEJA}
```

Contoh per meja:

| Meja | URL |
|------|-----|
| 01 | `http://192.168.100.13/qorestoweb/menu?table=01` |
| 02 | `http://192.168.100.13/qorestoweb/menu?table=02` |
| 10 | `http://192.168.100.13/qorestoweb/menu?table=10` |

---

## Implementasi Teknis

### 1. Utility: `table-session.js`

File baru: `src/scripts/utils/table-session.js`

Fungsi:
- `initTableId()` — baca `?table=XX` dari URL, simpan ke `sessionStorage`
- `getTableId()` — ambil table ID yang tersimpan
- `setTableId(id)` — set manual (untuk testing)
- `clearTableId()` — hapus saat logout/sesi berakhir

### 2. `App.js`

`initTableId()` dipanggil saat app pertama mount, **sebelum render halaman manapun**.  
Nilai `table` dari URL langsung disimpan ke `sessionStorage['qoTableId']`.

### 3. `bqo_home.js` — Halaman Menu

- Badge **"Meja XX"** ditampilkan di AppBar kanan atas
- Hanya muncul jika ada table ID dari URL

### 4. `bqo_checkout.js` — Halaman Checkout

- `seatNumber` otomatis diisi dari `getTableId()`
- Jika table ID dari URL → field **read-only** (tidak bisa diubah)
- Jika tidak ada table ID → field tetap dropdown manual (fallback)

### 5. `bqo_payment.js` — Halaman Payment

- `ctabid` (ID meja ke backend) diambil dari `orderInfo.seatNumber`
- `orderInfo` disimpan dari checkout dengan `seatNumber = getTableId()`
- Tidak perlu perubahan di payment karena data sudah benar dari checkout

---

## Flow Lengkap

```
[QR Code di Meja 03]
        ↓
Scan → http://192.168.100.13/qorestoweb/menu?table=03
        ↓
App.js: initTableId() → sessionStorage['qoTableId'] = "03"
        ↓
BQOHome: Badge "Meja 03" tampil di AppBar
        ↓
Customer pilih menu → ke Checkout
        ↓
BQOCheckout: seatNumber = "03" (otomatis, read-only)
        ↓
Submit → QoOrderInfo.seatNumber = "03" → localStorage
        ↓
BQOPayment / Backend: ctabid = "03"
```

---

## Cara Generate QR Code untuk Meja

### Opsi A — Online QR Generator

Buka [qr-code-generator.com](https://www.qr-code-generator.com) atau tools sejenis, masukkan URL per meja, download, print, tempel di meja.

### Opsi B — Halaman Admin di App (Rekomendasi)

Buat halaman `/admin/qr-tables` di app yang:
- Menampilkan QR code untuk semua meja sekaligus
- Bisa langsung di-print dari browser
- QR code sudah include URL lengkap per meja

> Fitur halaman admin QR ini **belum diimplementasikan** — bisa dikembangkan sebagai next step.

---

## Backward Compatibility

Jika URL dibuka **tanpa** `?table=` (misal langsung ketik di browser), app tetap berjalan normal:
- Tidak ada badge meja di AppBar
- Field nomor meja di checkout tetap muncul sebagai dropdown manual
- Customer bisa pilih meja sendiri seperti konsep lama

Ini memastikan app tetap bisa dipakai meski QR code belum terpasang di semua meja.

---

## File yang Berubah

| File | Perubahan |
|------|-----------|
| `src/scripts/utils/table-session.js` | **Baru** — utility table ID |
| `src/scripts/App.js` | Tambah `initTableId()` saat mount |
| `src/scripts/modules/BQO/views/bqo_home.js` | Badge meja di AppBar |
| `src/scripts/modules/BQO/views/bqo_checkout.js` | Auto-fill + lock field meja |
