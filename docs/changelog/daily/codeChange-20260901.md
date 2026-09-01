# Code Changes Summary

## 1 September 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260901_143236]
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

#### 1. ocs/ALUR-QORESTOWEB.md [20260901_143236]
**Fungsi:** Implementasi: ALUR-QORESTOWEB  
**Perubahan:** Pembaruan kode  

---

#### 2. docs/TAX-CONFIG.md [20260901_143236]
**Fungsi:** Konfigurasi aplikasi (base URL, konstanta)  
**Perubahan:** Pembaruan kode  

---

### ⚙️ Others

#### 1. public/app.cfg [20260901_143236]
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

#### 2. src/scripts/utils/app-config.js [20260901_143236]
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
- **📖 Documentation:** 2 items
- **⚙️ Others:** 2 items
- **Total Files Modified:** 5
- **Main Focus:** 📖 Documentation
