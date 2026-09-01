# Code Changes Summary

## 1 September 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260901_143237]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: app-config; Tambah fungsi: getTax  
**Lines:** 39, 51-55, 298-307, 431-452, 514-515, 652, 953-958, 975-978, 1197

```javascript
// Line 36:
- import { getAppConfig } from '../../../utils/app-config';
+ import { getAppConfig, getTaxConfig } from '../../../utils/app-config';
// Line 48:
- // Pajak — BASE_TAX × EFFECTIVE_RATE dari env (pola webcsa-v2)
- // Contoh: 12 × (11/12) = 11%
- const TAX_BASE = parseFloat(process.env.REACT_APP_TAX_BASE || '12');
- const TAX_RATE_STR = (process.env.REACT_APP_TAX_EFFECTIVE_RATE || '11/12').trim();
- const TAX_RATE = TAX_RATE_STR.includes('/')
-   ? (() => { const [a, b] = TAX_RATE_STR.split('/'); return parseFloat(a) / parseFloat(b); })() // "11/12" → 0.9166...
-   : parseFloat(TAX_RATE_STR);
- const TAX_PERCENT = TAX_BASE * TAX_RATE; // 12 * (11/12) = 11
+ // Pajak — dibaca dari app.cfg saat runtime (bisa ganti tanpa rebuild)
+ // getTaxConfig() mengembalikan { mode, rate, effectiveRate, effectivePct }
+ // mode: 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE'
+ // Dipanggil di dalam fungsi agar selalu baca nilai terkini dari app.cfg
+ const getTax = () => getTaxConfig();
// Line 295:
-     return Math.floor(parseFloat(calculatePriceItem() * (TAX_PERCENT / 100)));
+     const { mode, effectivePct } = getTax();
+     if (mode === 'NONE') return 0;
+     const subtotal = calculatePriceItem();
+     if (mode === 'INCLUSIVE') {
+       // PPN sudah di dalam harga — reverse-hitung untuk tampilan breakdown
+       // taxAmount = subtotal - subtotal / (1 + effectivePct/100)
  // ... (truncated)
// Line 511:
-           npctppn:   TAX_PERCENT,
-           namount:   subtotal,
+           npctppn:   mode === 'NONE' ? 0 : rate,
+           namount:   mode === 'INCLUSIVE' ? total : subtotal,
// Line 649:
-     ctx.fillText(`Pajak (${TAX_PERCENT}%)`, padding, y + 12);
+     ctx.fillText(`Pajak (${getTax().effectivePct}%)`, padding, y + 12);
// Line 950:
-                 Pajak ({TAX_PERCENT}%)
+                 Pajak ({getTax().mode === 'NONE' ? '0' : getTax().effectivePct}%)
+                 {getTax().mode === 'INCLUSIVE' && (
+                   <Typography variant="caption" display="block" color="text.secondary">
+                     sudah termasuk dalam harga
+                   </Typography>
+                 )}
// Line 972:
-                 Rp {toCurrencyIDR(calculatePriceItem() + calculateTaxItem())}
+                 Rp {toCurrencyIDR(getTax().mode === 'EXCLUSIVE'
+                   ? calculatePriceItem() + calculateTaxItem()
+                   : calculatePriceItem()
+                 )}
// Line 1194:
-             <Typography variant="caption" color="text.secondary">Pajak ({TAX_PERCENT}%)</Typography>
+             <Typography variant="caption" color="text.secondary">Pajak ({getTax().effectivePct}%)</Typography>
```

---

### 📖 Documentation

#### 1. docs/ALUR-QORESTOWEB.md [20260901_143237]
**Fungsi:** Implementasi: ALUR-QORESTOWEB  
**Perubahan:** Pembaruan kode  
**Lines:** 273-275, 277-293

```javascript
// Line 270:
+ | `tax_mode` | `"EXCLUSIVE"` | Mode perhitungan PPN — lihat penjelasan di bawah |
+ | `tax_rate` | `12` | Rate PPN dasar dalam persen. Diabaikan saat `tax_mode = "NONE"` |
+ | `tax_effective_rate` | `"11/12"` | Faktor DPP — angka (`1`) atau pecahan string (`"11/12"`). Sesuai PMK 131/2024. Diabaikan saat `tax_mode = "NONE"` |
+ ### Konfigurasi Tax Mode
+ 
+ `tax_mode` mengontrol bagaimana PPN dihitung dan dikirim ke backend:
+ 
+ | Mode | Harga di Katalog | Yang Ditampilkan | `npctppn` di Payload | Contoh |
+ |------|-----------------|-----------------|----------------------|--------|
+ | `EXCLUSIVE` | Belum include PPN | Subtotal + PPN terpisah, Total = subtotal + PPN | `tax_rate` (misal 12) | Soda Rp23.000 → +PPN 11% = Total Rp25.530 |
+ | `INCLUSIVE` | Sudah include PPN | Total langsung, PPN di-breakdown sebagai info | `tax_rate` (misal 12) | Soda Rp25.530 → info PPN Rp2.530 → Total tetap Rp25.530 |
+ | `NONE` | Terserah (frontend tidak peduli) | Total saja, tidak ada baris PPN | `0` | Soda Rp25.530 → Total Rp25.530 |
+ 
+ **Pajak efektif ke pelanggan** = `tax_rate × tax_effective_rate`
+ Contoh: `12 × (11/12) = 11%` — ini yang muncul di struk dan payload.
+ 
+ **Kapan pakai mode apa:**
+ - `EXCLUSIVE` → harga menu belum termasuk PPN, cocok untuk invoice B2B
+ - `INCLUSIVE` → harga menu sudah all-in (termasuk service charge, tax, dll), cocok untuk restoran yang mau breakdown PPN di struk
+ - `NONE` → backend CSA yang menangani PPN sepenuhnya dari konfigurasi master, frontend tidak perlu tahu rate-nya
```

---

#### 2. docs/TAX-CONFIG.md [20260901_143237]
**Fungsi:** Konfigurasi aplikasi (base URL, konstanta)  
**Perubahan:** Import: app-config  
**Lines:** 1-237

```javascript
// Line 1:
+ # Konfigurasi Pajak / PPN — Qorestoweb
+ 
+ > Konfigurasi pajak dibaca dari `public/app.cfg` saat runtime.  
+ > **Tidak perlu rebuild** — cukup edit file dan hard-refresh browser.
+ 
+ ---
+ 
+ ## Tiga Key di `app.cfg`
+ 
+ ```json
+ {
+   "tax_mode":           "EXCLUSIVE",
+   "tax_rate":           12,
+   "tax_effective_rate": "11/12"
+ }
+ ```
+ 
+ | Key | Tipe | Default | Keterangan |
+ |-----|------|---------|------------|
+ | `tax_mode` | string | `"EXCLUSIVE"` | Mode perhitungan PPN — `"EXCLUSIVE"`, `"INCLUSIVE"`, atau `"NONE"` |
+ | `tax_rate` | number | `12` | Rate PPN dasar dalam persen. Diabaikan saat `tax_mode = "NONE"` |
+ | `tax_effective_rate` | string \| number | `"11/12"` | Faktor DPP. Bisa angka (`1`) atau pecahan string (`"11/12"`). Diabaikan saat `tax_mode = "NONE"` |
+ 
+ **Pajak efektif yang dikenakan ke pelanggan:**
  // ... (truncated)
+ 
+ ## Implementasi Teknis
+ 
+ Konfigurasi dibaca oleh `getTaxConfig()` di `src/scripts/utils/app-config.js`:
+ 
+ ```javascript
+ import { getTaxConfig } from '../utils/app-config';
+ 
+ const { mode, rate, effectiveRate, effectivePct } = getTaxConfig();
+ // mode        : 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE'
+ // rate        : 12   (tax_rate)
+ // effectiveRate: 0.9166... (hasil parse "11/12")
+ // effectivePct: 11   (rate × effectiveRate — persen efektif ke pelanggan)
+ ```
+ 
+ Fungsi ini dipanggil saat runtime (bukan saat build), sehingga perubahan `app.cfg` langsung terbaca tanpa rebuild.
+ 
+ ---
+ 
+ ## Referensi
+ 
+ - PMK 131 Tahun 2024 — DPP Nilai Lain untuk PPN: faktor `11/12` dari harga jual
+ - `public/app.cfg` — runtime config qorestoweb
+ - `src/scripts/utils/app-config.js` — `getTaxConfig()`, `getAppConfig()`
+ - `src/scripts/modules/BQO/views/bqo_checkout.js` — implementasi kalkulasi & payload
```

---

#### 3. docs/changelog/daily/codeChange-20260901.md [20260901_143237]
**Fungsi:** Implementasi: codeChange-20260901  
**Perubahan:** Pembaruan kode  
**Lines:** 1-167

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 1 September 2026
+ 
+ ### ✨ Features
+ 
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260901_143236]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Import: app-config; Tambah fungsi: getTax  
+ **Lines:** 39, 51-55, 298-307, 431-452, 514-515, 652, 953-958, 975-978, 1197
+ 
+ ```javascript
+ // Line 36:
+ - import { getAppConfig } from '../../../utils/app-config';
+ + import { getAppConfig, getTaxConfig } from '../../../utils/app-config';
+ // Line 48:
+ - // Pajak — BASE_TAX × EFFECTIVE_RATE dari env (pola webcsa-v2)
+ - // Contoh: 12 × (11/12) = 11%
+ - const TAX_BASE = parseFloat(process.env.REACT_APP_TAX_BASE || '12');
+ - const TAX_RATE_STR = (process.env.REACT_APP_TAX_EFFECTIVE_RATE || '11/12').trim();
+ - const TAX_RATE = TAX_RATE_STR.includes('/')
+ -   ? (() => { const [a, b] = TAX_RATE_STR.split('/'); return parseFloat(a) / parseFloat(b); })() // "11/12" → 0.9166...
+ -   : parseFloat(TAX_RATE_STR);
+ - const TAX_PERCENT = TAX_BASE * TAX_RATE; // 12 * (11/12) = 11
  // ... (truncated)
+ + 
+ +   // tax_effective_rate bisa string "11/12" atau angka 1
+ +   const rawEffRate = config.tax_effective_rate ?? 1;
+ +   let effectiveRate;
+ +   if (typeof rawEffRate === 'string' && rawEffRate.includes('/')) {
+ +     const [a, b] = rawEffRate.split('/');
+ +     effectiveRate = parseFloat(a) / parseFloat(b);
+ +   } else {
+ +     effectiveRate = parseFloat(rawEffRate) || 1;
+ +   }
+ + 
+ +   const effectivePct = rate * effectiveRate; // mis: 12 × (11/12) = 11
+ + 
+ +   return { mode, rate, effectiveRate, effectivePct };
+ + };
+ ```
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **✨ Features:** 1 item
+ - **📖 Documentation:** 2 items
+ - **⚙️ Others:** 2 items
+ - **Total Files Modified:** 5
+ - **Main Focus:** 📖 Documentation
```

---

#### 4. ocs/TAX-CONFIG.md [20260901_154326]
**Fungsi:** Konfigurasi aplikasi (base URL, konstanta)  
**Perubahan:** Pembaruan kode  

---

### ⚙️ Others

#### 1. public/app.cfg [20260901_143237]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 15-19

```javascript
// Line 12:
-   "show_tunai_button": false
+   "show_tunai_button": false,
+ 
+   "tax_mode": "EXCLUSIVE",
+   "tax_rate": 12,
+   "tax_effective_rate": "11/12"
```

---

#### 2. src/scripts/utils/app-config.js [20260901_143237]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Tambah fungsi: getTaxConfig; Tambah fungsi: mode  
**Lines:** 31-53, 97-138

```javascript
// Line 28:
+ 
+   // ── Konfigurasi Pajak / PPN ──────────────────────────────────────────────
+   // tax_mode          : 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE'
+   //   EXCLUSIVE → harga item BELUM include PPN; frontend tambahkan PPN di akhir;
+   //               payload kirim npctppn = tax_rate
+   //   INCLUSIVE → harga item SUDAH include PPN; tampilkan breakdown PPN sebagai
+   //               informasi; payload tetap kirim npctppn = tax_rate (backend
+   //               reverse-hitung PPN dari nilai transaksi)
+   //   NONE      → frontend tidak peduli PPN; payload kirim npctppn = 0;
+   //               backend yang memutuskan penanganan PPN sepenuhnya
+   //
+   // tax_rate          : rate PPN dasar dalam persen (angka), contoh: 12
+   //                     Diabaikan saat tax_mode = 'NONE'
+   //
+   // tax_effective_rate: faktor DPP — bisa angka (1) atau pecahan string ("11/12")
+   //                     Sesuai PMK 131/2024: DPP Nilai Lain = 11/12 dari harga
+   //                     Diabaikan saat tax_mode = 'NONE'
+   //                     Contoh: tax_rate=12, tax_effective_rate="11/12"
+   //                             → pajak efektif ke pelanggan = 12 × 11/12 = 11%
+   // ────────────────────────────────────────────────────────────────────────
+   tax_mode:           'EXCLUSIVE', // 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE'
+   tax_rate:           12,
+   tax_effective_rate: '11/12',
// Line 94:
  // ... (truncated)
+ export const getTaxConfig = () => {
+   const config = getAppConfig();
+ 
+   const mode = (config.tax_mode || 'EXCLUSIVE').toUpperCase();
+ 
+   if (mode === 'NONE') {
+     return { mode: 'NONE', rate: 0, effectiveRate: 1, effectivePct: 0 };
+   }
+ 
+   const rate = parseFloat(config.tax_rate ?? 12);
+ 
+   // tax_effective_rate bisa string "11/12" atau angka 1
+   const rawEffRate = config.tax_effective_rate ?? 1;
+   let effectiveRate;
+   if (typeof rawEffRate === 'string' && rawEffRate.includes('/')) {
+     const [a, b] = rawEffRate.split('/');
+     effectiveRate = parseFloat(a) / parseFloat(b);
+   } else {
+     effectiveRate = parseFloat(rawEffRate) || 1;
+   }
+ 
+   const effectivePct = rate * effectiveRate; // mis: 12 × (11/12) = 11
+ 
+   return { mode, rate, effectiveRate, effectivePct };
+ };
```

---

## 📊 **Summary**
- **✨ Features:** 1 item
- **📖 Documentation:** 4 items
- **⚙️ Others:** 2 items
- **Total Files Modified:** 7
- **Main Focus:** 📖 Documentation
