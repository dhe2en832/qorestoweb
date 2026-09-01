# Konfigurasi Pajak / PPN — Qorestoweb

> Konfigurasi pajak dibaca dari `public/app.cfg` saat runtime.  
> **Tidak perlu rebuild** — cukup edit file dan hard-refresh browser.

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

1. Buka file `app.cfg` di folder deploy (misal `/var/www/html/qorestoweb/app.cfg`)
2. Edit tiga key: `tax_mode`, `tax_rate`, `tax_effective_rate`
3. Simpan
4. Hard-refresh browser (`Ctrl+Shift+R`)

**Tidak perlu rebuild, tidak perlu restart server.**

---

## Implementasi Teknis

Konfigurasi dibaca oleh `getTaxConfig()` di `src/scripts/utils/app-config.js`:

```javascript
import { getTaxConfig } from '../utils/app-config';

const { mode, rate, effectiveRate, effectivePct } = getTaxConfig();
// mode        : 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE'
// rate        : 12   (tax_rate)
// effectiveRate: 0.9166... (hasil parse "11/12")
// effectivePct: 11   (rate × effectiveRate — persen efektif ke pelanggan)
```

Fungsi ini dipanggil saat runtime (bukan saat build), sehingga perubahan `app.cfg` langsung terbaca tanpa rebuild.

---

## Referensi

- PMK 131 Tahun 2024 — DPP Nilai Lain untuk PPN: faktor `11/12` dari harga jual
- `public/app.cfg` — runtime config qorestoweb
- `src/scripts/utils/app-config.js` — `getTaxConfig()`, `getAppConfig()`
- `src/scripts/modules/BQO/views/bqo_checkout.js` — implementasi kalkulasi & payload
