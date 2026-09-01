# Konfigurasi Pajak / PPN

> Berlaku untuk: **Qorestoweb** dan **Webcsa-v2 (Trenly)**  
> Konfigurasi pajak dibaca dari `public/app.cfg` saat runtime.  
> **Tidak perlu rebuild** — cukup edit file dan hard-refresh browser.

---

## Status Implementasi per Web App

| Web App | Status | Catatan |
|---------|--------|---------|
| **Qorestoweb** | ✅ Implementasi penuh | Ketiga mode aktif langsung dari `app.cfg`. Customer hardcode `UMUM` — tax berlaku untuk semua transaksi |
| **Webcsa-v2 Trenly** | ✅ Implementasi penuh | `app.cfg` menentukan rate & mode. Tax aktif/tidak juga bergantung flag `lppn` di master customer |

### Perbedaan Perilaku

| | Qorestoweb | Webcsa-v2 Trenly |
|--|--|--|
| Tax dikontrol oleh | `app.cfg` saja | `app.cfg` × `lppn` customer |
| Customer | Hardcode (`UMUM`) — tidak bisa pilih | Dipilih dari lookup |
| Tax aktif saat | Selalu — sesuai `tax_mode` di `app.cfg` | `tax_mode ≠ NONE` **dan** customer `lppn = 'Y'` |
| Skema 3 (NONE) | ✅ Set `tax_mode: "NONE"` | ✅ Set `tax_mode: "NONE"` atau customer `lppn = 'N'` |
| File `app.cfg` | `public/app.cfg` (satu file) | `public/app.cfg.primary` dan `public/app.cfg.cadangan` |

---

## Tiga Key di `app.cfg`

```json
{
  "tax_mode":           "EXCLUSIVE",
  "tax_rate":           12,
  "tax_effective_rate": "11/12"
}
```

| Key | Tipe | Default | Keterangan |
|-----|------|---------|------------|
| `tax_mode` | string | `"EXCLUSIVE"` | Mode perhitungan PPN — `"EXCLUSIVE"`, `"INCLUSIVE"`, atau `"NONE"` |
| `tax_rate` | number | `12` | Rate PPN dasar dalam persen. Diabaikan saat `tax_mode = "NONE"` |
| `tax_effective_rate` | string \| number | `"11/12"` | Faktor DPP. Bisa angka (`1`) atau pecahan string (`"11/12"`). Diabaikan saat `tax_mode = "NONE"` |

**Pajak efektif yang dikenakan ke pelanggan:**
```
pajak_efektif = tax_rate × tax_effective_rate
Contoh: 12 × (11/12) = 11%
```

---

## Tiga Mode PPN

### EXCLUSIVE — Harga Belum Include PPN

Harga item di katalog **belum termasuk PPN**. Frontend menambahkan PPN di atas subtotal.

```
Subtotal (harga × qty)   = Rp 46.000
PPN 11%                  = Rp  5.060
─────────────────────────────────────
Total Pembayaran         = Rp 51.060
```

**Payload ke backend:**
```json
{
  "npctppn": 12,
  "namount": 46000,
  "ndp":     51060
}
```
- `namount` = nilai **sebelum** PPN
- `ndp` = nilai **sudah include** PPN (yang dibayar)
- `npctppn` = rate dasar (bukan efektif)

**Kapan dipakai:** Harga menu/barang di database CSA adalah harga nett (belum PPN). Backend CSA akan menghitung dan merekam PPN dari `npctppn`.

---

### INCLUSIVE — Harga Sudah Include PPN

Harga item di katalog **sudah all-in** (termasuk PPN, service charge, dll). Frontend hanya menampilkan breakdown PPN sebagai informasi.

```
Total (harga × qty)      = Rp 51.060   ← ini yang dibayar
Info PPN 11% (di dalam)  = Rp  5.060   ← informasi saja
```

**Payload ke backend:**
```json
{
  "npctppn": 12,
  "namount": 51060,
  "ndp":     51060
}
```
- `namount` = `ndp` = nilai **sudah include** PPN
- `npctppn` tetap diisi agar backend bisa reverse-hitung PPN untuk rekap faktur pajak

**Kapan dipakai:** Restoran/hotel yang mencantumkan harga all-in di menu, tapi backend CSA tetap butuh rekap PPN-nya.

---

### NONE — Frontend Tidak Peduli PPN

Frontend tidak menghitung PPN sama sekali. Backend CSA yang memutuskan penanganan PPN dari konfigurasi master-nya.

```
Total (harga × qty)      = Rp 51.060   ← langsung ini yang dibayar
(tidak ada baris PPN)
```

**Payload ke backend:**
```json
{
  "npctppn": 0,
  "namount": 51060,
  "ndp":     51060
}
```
- `npctppn = 0` — frontend tidak menyinggung PPN
- Backend yang memutuskan apakah transaksi ini kena PPN atau tidak

**Kapan dipakai:** Backend CSA sudah dikonfigurasi otomatis menerapkan PPN berdasarkan master customer/site, tanpa perlu input dari frontend.

---

## Perbandingan Ringkas

| | EXCLUSIVE | INCLUSIVE | NONE |
|--|-----------|-----------|------|
| Harga di katalog | Belum PPN | Sudah include PPN | Terserah |
| Baris PPN di UI | ✅ Tampil, ditambahkan | ✅ Tampil, sebagai info | ❌ Tidak tampil |
| Total yang dibayar | Subtotal + PPN | = Harga katalog | = Harga katalog |
| `npctppn` di payload | `tax_rate` (mis. 12) | `tax_rate` (mis. 12) | `0` |
| `namount` di payload | Nilai sebelum PPN | Nilai sudah include PPN | Nilai yang dibayar |
| Backend rekam PPN? | Ya, dari `npctppn` | Ya, reverse dari `namount` | Terserah backend |

---

## Contoh Konfigurasi per Skenario

### Skenario A — Production Indonesia (PMK 131/2024, PPN 12% DPP 11/12)

Harga nett, PPN efektif 11% ke pelanggan.

```json
{
  "tax_mode":           "EXCLUSIVE",
  "tax_rate":           12,
  "tax_effective_rate": "11/12"
}
```

Hasil: `Subtotal + 11% = Total` — label: `"Pajak (11%)"`

---

### Skenario B — Database Testing (PPN lama 10%)

```json
{
  "tax_mode":           "EXCLUSIVE",
  "tax_rate":           10,
  "tax_effective_rate": "1"
}
```

Hasil: `Subtotal + 10% = Total` — label: `"Pajak (10%)"`

> Backend testing hanya menerima `npctppn = 0` atau `10`.  
> Dengan konfigurasi ini, `npctppn = 10` yang dikirim ke backend.

---

### Skenario C — Restoran Harga All-In (Include PPN + Service Charge)

Harga di menu sudah final, tapi backend perlu tahu PPN-nya untuk rekap.

```json
{
  "tax_mode":           "INCLUSIVE",
  "tax_rate":           12,
  "tax_effective_rate": "11/12"
}
```

Hasil: Total = harga menu, tampil info PPN 11% di struk.

---

### Skenario D — Backend Handle PPN Sepenuhnya

Frontend tidak perlu tahu rate PPN — backend CSA yang atur.

```json
{
  "tax_mode":           "NONE",
  "tax_rate":           0,
  "tax_effective_rate": "1"
}
```

Hasil: Tidak ada baris PPN di UI, `npctppn = 0` di payload.

---

### Skenario E — Tidak Ada PPN (Tax-Free)

```json
{
  "tax_mode":           "NONE",
  "tax_rate":           0,
  "tax_effective_rate": "1"
}
```

Sama dengan Skenario D — NONE selalu kirim `npctppn = 0`.

---

## Cara Ganti Konfigurasi di Server

### Qorestoweb

1. Buka file `app.cfg` di folder deploy (misal `/var/www/html/qorestoweb/app.cfg`)
2. Edit tiga key: `tax_mode`, `tax_rate`, `tax_effective_rate`
3. Simpan
4. Hard-refresh browser (`Ctrl+Shift+R`)

### Webcsa-v2 Trenly

Trenly punya dua `app.cfg` terpisah per server:

| Server | File yang diedit setelah deploy |
|--------|--------------------------------|
| Server utama (`.13`) | `app.cfg` di folder `/pos/` |
| Server cadangan (`.85`) | `app.cfg` di folder `/pos-cad/` |

File ini berasal dari `public/app.cfg.primary` atau `public/app.cfg.cadangan` saat build, dan bisa diedit langsung di server setelah deploy.

**Contoh untuk database testing (PPN 10%, flat):**
```json
{
  "tax_mode": "EXCLUSIVE",
  "tax_rate": 10,
  "tax_effective_rate": "11/12"
}
```
> Catatan: Sesuaikan `tax_effective_rate` dengan konfigurasi backend. Jika backend menggunakan faktor DPP 11/12, gunakan `"11/12"`. Jika flat, gunakan `"1"`.

**Tidak perlu rebuild, tidak perlu restart server.**

---

## Implementasi Teknis

### Fungsi Utama: `getTaxConfig()`

Tersedia di kedua web app di `src/scripts/utils/app-config.js`:

```javascript
import { getTaxConfig } from '../utils/app-config';

const { mode, rate, effectiveRate, effectivePct } = getTaxConfig();
// mode        : 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE'
// rate        : 12   (tax_rate dari app.cfg)
// effectiveRate: 0.9166... (hasil parse "11/12")
// effectivePct: 11   (rate × effectiveRate — persen efektif ke pelanggan)
```

Fungsi ini dipanggil saat runtime (bukan saat build), sehingga perubahan `app.cfg` langsung terbaca tanpa rebuild.

---

### Detail per Web App

#### Qorestoweb

| File | Peran |
|------|-------|
| `public/app.cfg` | Satu file runtime config — edit langsung di server |
| `src/scripts/utils/app-config.js` | `getTaxConfig()`, `getAppConfig()` |
| `src/scripts/modules/BQO/views/bqo_checkout.js` | Kalkulasi & payload — semua 3 mode ditangani |

**Alur kalkulasi di `bqo_checkout.js`:**
```
EXCLUSIVE → subtotal + taxAmount = total
            npctppn = rate, namount = subtotal

INCLUSIVE → total = rawSubtotal (harga sudah all-in)
            taxAmount = di-extract untuk info struk
            npctppn = rate, namount = total

NONE      → total = rawSubtotal, taxAmount = 0
            npctppn = 0, namount = total
```

---

#### Webcsa-v2 Trenly

| File | Peran |
|------|-------|
| `public/app.cfg.primary` | Runtime config server utama (.13) |
| `public/app.cfg.cadangan` | Runtime config server cadangan (.85) |
| `src/scripts/utils/app-config.js` | `getTaxConfig()`, `getAppConfig()` |
| `src/scripts/modules/BJUAL/hooks/useExternalSystem.jsx` | Baca `getTaxConfig()` saat customer dipilih — set `taxPercent` dan `effectiveTaxRate` ke state |
| `src/scripts/modules/BJUAL/hooks/useCashierSystem.js` | State `taxPercent` dan `effectiveTaxRate` — diupdate dari `headerInfo` setelah customer dipilih |
| `src/scripts/modules/BJUAL/views/bjual_payment.jsx` | Payload `npctppn = taxPercent`, `csalesid` dari customer |

**Catatan khusus Trenly:**
Tax hanya aktif jika customer yang dipilih memiliki `lppn = 'Y'` di master customer. `app.cfg` mengontrol rate dan mode, tapi flag `lppn` di master customer yang menentukan apakah transaksi ini kena PPN atau tidak. Jika `lppn = 'N'` → `taxPercent = 0` terlepas dari `tax_mode` di `app.cfg`.

---

## Referensi

- PMK 131 Tahun 2024 — DPP Nilai Lain untuk PPN: faktor `11/12` dari harga jual
- **Qorestoweb:**
  - `public/app.cfg`
  - `src/scripts/utils/app-config.js`
  - `src/scripts/modules/BQO/views/bqo_checkout.js`
- **Webcsa-v2 Trenly:**
  - `public/app.cfg.primary` / `public/app.cfg.cadangan`
  - `src/scripts/utils/app-config.js`
  - `src/scripts/modules/BJUAL/hooks/useExternalSystem.jsx`
  - `src/scripts/modules/BJUAL/hooks/useCashierSystem.js`
  - `src/scripts/modules/BJUAL/views/bjual_payment.jsx`
