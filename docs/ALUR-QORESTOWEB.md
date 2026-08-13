# Alur Lengkap Qorestoweb — Self-Order Restoran via QR Code

## Ringkasan

Qorestoweb adalah aplikasi web self-order untuk restoran. Pelanggan scan QR code di meja, langsung masuk ke menu tanpa login, pilih makanan, dan bayar (tunai di kasir atau digital via Xendit QRIS).

---

## 1. Entry Point — Scan QR Code

### URL Format
```
http://{SERVER_IP}/qorestoweb/menu?table={NOMOR_MEJA}
```
Contoh: `http://192.168.100.13/qorestoweb/menu?table=07`

### Proses Saat URL Dibuka
1. `App.js` mount → `initTableId()` baca `?table=07` dari URL → simpan ke `sessionStorage`
2. Jika `?table=` ada (scan baru) → **reset semua data pelanggan sebelumnya** (cart, session, dll)
3. `loadAppConfig()` fetch `app.cfg` dari server → simpan konfigurasi runtime
4. `PrivateRoute` deteksi QR mode + belum login → panggil `signinAsGuest()`
5. `signinAsGuest()` login ke backend CSA dengan credential dari `app.cfg` (`qr_guest_user`/`qr_guest_pass`)
6. Setelah login berhasil → render halaman menu

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
- Tombol back hanya tampil di mode non-QR

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
| `show_tunai_button: true` | Tampilkan opsi "Tunai" |
| `show_tunai_button: false` | Skip langsung ke Xendit |

### 4a. Bayar di Kasir (Tunai)
1. Submit pesanan ke `bqo_x` action `add`
2. Jika berhasil → tampilkan dialog "Pesanan Diterima!"
3. Pelanggan **wajib download bukti pesanan** (gambar PNG) sebelum bisa klik "Pesanan Baru"
4. Bukti pesanan berisi: nomor order, daftar item, total, meja, nama, waktu
5. Pelanggan tunjukkan gambar ini ke kasir saat bayar

### 4b. Bayar Digital (Xendit QRIS)
1. Pilih channel pembayaran (QRIS)
2. Generate QR Code pembayaran
3. Pelanggan scan QR dari e-wallet/mobile banking
4. Polling/SSE menunggu konfirmasi pembayaran
5. Setelah lunas → tampilkan "Pesanan Berhasil!"
6. Pelanggan **wajib download struk** sebelum bisa klik "Pesanan Baru"
7. Struk berisi: nomor bon, LUNAS, daftar item, total

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
    "cbnkid": "T000",
    "npctppn": 11,
    "namount": 71000,
    "ndp": 78810,
    ...
  },
  "lineItemsInfo": [
    {
      "nline": 1,
      "cstocode": "AA-00006",
      "cstoname": "AA 8x15 (PO)",
      "nqqo": 1,
      "cuom": "KG",
      "nhrgjua": 37500,
      "cremark": "Tidak pedas",
      "cremark2": "Tambah sambal"
    }
  ],
  "paymentInfo": { "cbnkid": "T000", "namount": 78810 }
}
```

### Field Catatan
| Field | Lokasi | Isi |
|-------|--------|-----|
| `qoHeaderInfo.cremark` | Header | Nama pemesan |
| `lineItemsInfo[].cremark` | Detail | Catatan 1 per item |
| `lineItemsInfo[].cremark2` | Detail | Catatan 2 per item |

---

## 6. Handling Skenario & Edge Cases

### A. Pelanggan Scan Berkali-kali (Meja Sama)
- Setiap kali URL `?table=XX` dibuka → **reset total** (cart, session)
- Login ulang otomatis → mulai fresh
- Pesanan sebelumnya tetap ada di backend (nomor QO berbeda)

### B. Dua Pelanggan Scan Meja Sama (HP Berbeda)
- Backend support multi-session untuk satu user
- Tidak saling menendang — masing-masing dapat `sessionid` berbeda
- Dialog "Meja ini ada pesanan aktif" muncul untuk pelanggan kedua
- Pelanggan kedua tetap bisa order (pesanan terpisah)

### C. Session Expired
| Lokasi | Handling |
|--------|----------|
| Halaman menu (getDatas gagal) | Silent re-login → retry fetch |
| Checkout (fetchOccupiedTables gagal) | Silent re-login → retry fetch |
| Submit pesanan (add gagal) | Silent re-login → retry submit |
| Redirect ke /login | Auto `signinAsGuest` → redirect balik |
| Idle timeout | Di-skip di QR mode (tidak invalidasi session) |

**Deteksi session error**: pesan mengandung "expired", "tidak valid", "di-LOCK", atau "proses lain".

### D. HP Mati/Tertutup, Buka Lagi
- Cart persist di `localStorage`
- Table ID persist di `sessionStorage` (per tab)
- Session mungkin expired → auto re-login saat fetch

### E. Pindah Meja (Scan Meja Baru)
- `initTableId()` update table ID baru
- Cart di-clear (pesanan lama ditinggalkan di frontend, tapi kalau sudah submit ke backend tetap ada)
- Mulai fresh di meja baru

### F. Internet Putus Saat Submit
- Try/catch → tampilkan "Server tidak bisa dijangkau. Coba lagi."
- Pesanan tidak terkirim, pelanggan bisa coba lagi

### G. Akses URL Tanpa `?table=`
- `PrivateRoute` redirect ke form login (mode kasir/admin biasa)
- Pelanggan normal tidak akan sampai sini jika scan QR

---

## 7. Konfigurasi Runtime (`public/app.cfg`)

File ini bisa diedit di server tanpa rebuild. Efek langsung setelah hard refresh browser.

```json
{
  "qr_guest_user": "xsv1",
  "qr_guest_pass": "xsv1",
  "qr_session_key": "8c5cf26a...",
  "show_print_button": false,
  "show_tunai_button": false,
  "xendit_show_simulate": false,
  "xendit_payment_timeout_minutes": 5,
  "debug_screen": true
}
```

| Key | Fungsi |
|-----|--------|
| `qr_guest_user` / `qr_guest_pass` | Credential login otomatis untuk pelanggan QR |
| `qr_session_key` | Fallback static key jika login gagal |
| `show_print_button` | `false` = hide tombol cetak (mode HP) |
| `show_tunai_button` | `false` = hide opsi tunai, langsung ke Xendit |
| `xendit_show_simulate` | `true` = tampilkan tombol simulasi bayar (test) |
| `debug_screen` | `true` = tampilkan debug panel di layar |

---

## 8. File-file Utama

| File | Fungsi |
|------|--------|
| `App.js` | Entry point, init table, load config |
| `PrivateRoute.js` | Auth guard, auto-login QR mode |
| `AuthContext.js` | Login biasa + `signinAsGuest` |
| `table-session.js` | Baca/simpan nomor meja dari URL |
| `app-config.js` | Baca `app.cfg` runtime config |
| `bqo_home.js` | Halaman menu/katalog |
| `bqo_checkout.js` | Halaman checkout + submit pesanan |
| `bqo_payment.js` | Halaman pembayaran Xendit |
| `bqo_api.js` | API calls ke backend CSA |
| `qr-tables.html` | Generator QR code per meja (static HTML) |

---

## 9. QR Code Generator

Akses: `http://{SERVER}/qorestoweb/qr-tables.html`

Fitur:
- Toggle Production / Development mode
- URL otomatis sesuai mode
- Generate QR untuk semua meja sekaligus
- Print-friendly (Ctrl+P)
- QR dev mode berwarna merah untuk pembeda visual
