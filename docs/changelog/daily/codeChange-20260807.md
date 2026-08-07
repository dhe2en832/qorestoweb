# Code Changes Summary

## 7 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_161320]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  
**Lines:** 341, 343, 351-353, 356-358, 360-366, 375, 377, 379-403

```javascript
// Line 338:
+       const externalId = String(+today).substring(0, 10); // timestamp 10 char untuk referensi
-       // Field sesuai dokumentasi BQO (Header + BITMQO)
+       // Field sesuai dokumentasi BQO draft.4
// Line 348:
+           cgroup:   '',
+           ctime:    '',
+           crefnote: 'ONLINE',
-           csize:    '-',
+           csize:    '',
+           cloc:     '',
+           ncqo:     '',
-           cuom:     (d.item?.csatuan || d.item?.cuom || 'PCS').trim(),
-           nhrgjua,
-           ndisc:    discPct,
-           nrpdisc,
+           cuom:     (d.item?.csatuan || d.item?.cuom || '').trim(),
+           nhrgjua:  String(nhrgjua),
+           cdisc:    '',
+           ndisc:    discPct > 0 ? String(discPct) : '',
+           nrpdisc:  String(nrpdisc),
+           csalesid: '',
+           nkomisi:  '',
// Line 372:
-           ccusid:   BQO_DEFAULT_CUSTOMER,          // dari env REACT_APP_BQO_DEFAULT_CUSTOMER
  // ... (truncated)
+           customer: {                              // nested object sesuai spec
+             ccusid:   BQO_DEFAULT_CUSTOMER,        // dari env REACT_APP_BQO_DEFAULT_CUSTOMER
+             cinitial: '',
+             cnotelp:  info.phoneNumber || '',
+             cemail:   '',
+           },
+           cshiptoadr: '',                          // alamat kirim (kosong untuk dine-in)
+           nexchrate:  '1',
+           csalesid:   'ONLINE',                    // sales person
+           lmulsales:  'false',
+           npctdisc:   '0',                         // discount header
+           npctppn:    String(TAX_PERCENT),         // pajak
+           namount:    String(subtotal),            // total sebelum pajak
+           ndp:        String(total),               // pembayaran diterima (DP)
+           cpaytype:   '',                          // blank = tunai
+           cbnkid:     CASH_BANK_CODE,              // dari env REACT_APP_CASH_BANK_CODE
+           nsaleschg:  '0',
+           ccrdnum:    '',
+           cqofoot1:   '',
+           cqofoot2:   '',
+           cqofoot3:   '',
+           referensi: {
+             crefnum: externalId.substring(0, 10), // ref order (max 10 char)
+             creftrn: externalId.substring(0, 10), // ref transaksi (max 10 char)
+           },
```

---

#### 2. src/scripts/modules/BQO/views/bqo_payment.js [20260807_161320]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Pembaruan kode  
**Lines:** 136-138, 153-155, 158-160, 162-168, 177-195, 197-205

```javascript
// Line 133:
-   // Field sesuai dokumentasi BQO:
-   //   qoHeaderInfo: DQODATE, CCUSID, CWHSEID, CTABID, CREMARK, NPCTPPN, NAMOUNT, CBNKID
-   //   lineItemsInfo: NLINE, CSTOCODE, CSTONAME, NQQO, CUOM, NHRGJUA, NDISC, NRPDISC
+   // Field sesuai dokumentasi BQO draft.4:
+   //   qoHeaderInfo: struktur lengkap dengan nested customer object
+   //   lineItemsInfo: detail item per spec
// Line 150:
+         cgroup:   '',
+         ctime:    '',
+         crefnote: 'ONLINE',
-         csize:    '-',
+         csize:    '',
+         cloc:     '',
+         ncqo:     '',
-         cuom:     (d.item?.csatuan || d.item?.cuom || 'PCS').trim(),
-         nhrgjua,
-         ndisc:    discPct,
-         nrpdisc,
+         cuom:     (d.item?.csatuan || d.item?.cuom || '').trim(),
+         nhrgjua:  String(nhrgjua),
+         cdisc:    '',
+         ndisc:    discPct > 0 ? String(discPct) : '',
+         nrpdisc:  String(nrpdisc),
+         csalesid: '',
  // ... (truncated)
+         customer: {
+           ccusid:   BQO_DEFAULT_CUSTOMER,
+           cinitial: '',
+           cnotelp:  orderInfo.phoneNumber || '',
+           cemail:   '',
+         },
+         cshiptoadr: '',
+         nexchrate:  '1',
+         csalesid:   'ONLINE',
+         lmulsales:  'false',
+         npctdisc:   '0',
+         npctppn:    String(TAX_PERCENT),
+         namount:    String(subtotal),
+         ndp:        String(total),
+         cpaytype:   '',
-         cpaytype: cbnkid ? '' : '',              // kosong = Cash
+         nsaleschg:  '0',
+         ccrdnum:    '',
+         cqofoot1:   '',
+         cqofoot2:   '',
+         cqofoot3:   '',
+         referensi: {
+           crefnum: externalId.substring(0, 10),
+           creftrn: externalId.substring(0, 10),
+         },
```

---

#### 3. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_160440]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Tambah fungsi: TAX_RATE_STR; Tambah fungsi: BQO_DEFAULT_WHSE  
**Lines:** 36-43, 48, 50, 363, 366-370, 373-374, 378

```javascript
// Line 32:
- import Config from '../../../Config';
- // Pajak — mengikuti pola webcsa-v2 (trenly):
- //   BASE_TAX_PERCENTAGE × EFFECTIVE_TAX_RATE = pajak efektif yang dibebankan
- //   Default: 12% × (11/12) = 11%  (PMK 131 Tahun 2024)
- const TAX_PERCENT = Config.BASE_TAX_PERCENTAGE * Config.EFFECTIVE_TAX_RATE;
+ // Pajak — BASE_TAX × EFFECTIVE_RATE dari env (pola webcsa-v2)
+ // Contoh: 12 × (11/12) = 11%
+ const TAX_BASE = parseFloat(process.env.REACT_APP_TAX_BASE || '12');
+ const TAX_RATE_STR = (process.env.REACT_APP_TAX_EFFECTIVE_RATE || '11/12').trim();
+ const TAX_RATE = TAX_RATE_STR.includes('/')
+   ? eval(TAX_RATE_STR) // "11/12" → 0.9166...
+   : parseFloat(TAX_RATE_STR);
+ const TAX_PERCENT = TAX_BASE * TAX_RATE; // 12 * (11/12) = 11
- // Customer ID default untuk walk-in / self-order BQO (wajib ada di backend)
+ // Customer ID dan Warehouse ID default — baca langsung dari env
+ const BQO_DEFAULT_WHSE     = (process.env.REACT_APP_BQO_DEFAULT_WHSE     || '').trim();
// Line 360:
-         headerInfo: {
+         qoHeaderInfo: {
-           ccusid:   BQO_DEFAULT_CUSTOMER,          // Customer ID dari env (walk-in/umum)
-           ctabid:   info.seatNumber  || '',         // Nomor Meja
-           cremark:  info.orderByName || '',         // Nama pemesan
-           cnotelp:  info.phoneNumber || '',         // No telepon
+           ccusid:   BQO_DEFAULT_CUSTOMER,          // dari env REACT_APP_BQO_DEFAULT_CUSTOMER
+           cwhseid:  BQO_DEFAULT_WHSE,              // dari env REACT_APP_BQO_DEFAULT_WHSE
+           ctabid:   info.seatNumber  || '',        // Nomor Meja
+           cremark:  info.orderByName || '',        // Nama pemesan
+           cnotelp:  info.phoneNumber || '',        // No telepon
-           namount:  subtotal,                       // Total sebelum pajak
-           cbnkid:   CASH_BANK_CODE,                 // Kode bank tunai dari env
+           namount:  subtotal,                      // Total sebelum pajak
+           cbnkid:   CASH_BANK_CODE,                // dari env REACT_APP_CASH_BANK_CODE
-         paymentInfo: { cbnkid: CASH_BANK_CODE, namount: total }, // bayar di kasir = total
+         paymentInfo: { cbnkid: CASH_BANK_CODE, namount: total },
```

---

#### 4. src/scripts/modules/BQO/views/bqo_home.js [20260807_160440]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Import: Config  
**Lines:** 35, 101-104, 107

```javascript
// Line 32:
+ import Config from '../../../Config';
// Line 98:
-    * Mode dikontrol via env:
-    *   REACT_APP_MENU_USE_BRWDEF=Y → usebrwdef:true, response array of arrays
-    *   REACT_APP_MENU_USE_BRWDEF=N → usebrwdef:false, response array of objects (cfamcode tersedia)
-    *   REACT_APP_MENU_GETIMAGE=Y   → request gambar dari server
+    * Mode dikontrol via Config.USE_BRWDEF (true/false di Config.js):
+    *   true  → usebrwdef:true, response array of arrays
+    *   false → usebrwdef:false, response array of objects (cfamcode tersedia)
+    *   REACT_APP_MENU_GETIMAGE=Y → request gambar dari server
-     const useBrwDef = process.env.REACT_APP_MENU_USE_BRWDEF === 'Y';
+     const useBrwDef = Config.USE_BRWDEF;
```

---

#### 5. src/scripts/modules/BQO/views/bqo_payment.js [20260807_160440]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Tambah fungsi: BQO_DEFAULT_WHSE; Tambah fungsi: TAX_RATE_STR  
**Lines:** 40, 42, 44-51, 137-139, 167, 170-171, 173-174, 177

```javascript
// Line 20:
- import Config from '../../../Config';
// Line 37:
- // Customer ID default untuk walk-in / self-order BQO (wajib ada di backend)
+ // Customer ID dan Warehouse ID default — baca langsung dari env
+ const BQO_DEFAULT_WHSE     = (process.env.REACT_APP_BQO_DEFAULT_WHSE     || '').trim();
- // Pajak — mengikuti pola webcsa-v2 (trenly): BASE_TAX_PERCENTAGE × EFFECTIVE_TAX_RATE
- const TAX_PERCENT = Config.BASE_TAX_PERCENTAGE * Config.EFFECTIVE_TAX_RATE;
+ // Pajak — BASE_TAX × EFFECTIVE_RATE dari env (pola webcsa-v2)
+ // Contoh: 12 × (11/12) = 11%
+ const TAX_BASE = parseFloat(process.env.REACT_APP_TAX_BASE || '12');
+ const TAX_RATE_STR = (process.env.REACT_APP_TAX_EFFECTIVE_RATE || '11/12').trim();
+ const TAX_RATE = TAX_RATE_STR.includes('/')
+   ? eval(TAX_RATE_STR) // "11/12" → 0.9166...
+   : parseFloat(TAX_RATE_STR);
+ const TAX_PERCENT = TAX_BASE * TAX_RATE; // 12 * (11/12) = 11
// Line 134:
-   //   Header: DQODATE, CTABID, CWHSEID, CREMARK, NPCTPPN, NAMOUNT, CBNKID
-   //   Item:   NLINE, CSTOCODE, CSTONAME, NQQO, CUOM, NHRGJUA, NDISC, NRPDISC
+   //   qoHeaderInfo: DQODATE, CCUSID, CWHSEID, CTABID, CREMARK, NPCTPPN, NAMOUNT, CBNKID
+   //   lineItemsInfo: NLINE, CSTOCODE, CSTONAME, NQQO, CUOM, NHRGJUA, NDISC, NRPDISC
+   //   paymentInfo: CBNKID, NAMOUNT
// Line 164:
-       headerInfo: {
+       qoHeaderInfo: {
-         ccusid:   BQO_DEFAULT_CUSTOMER,          // Customer ID dari env (walk-in/umum)
+         ccusid:   BQO_DEFAULT_CUSTOMER,          // dari env REACT_APP_BQO_DEFAULT_CUSTOMER
+         cwhseid:  BQO_DEFAULT_WHSE,              // dari env REACT_APP_BQO_DEFAULT_WHSE
-         cremark:  orderInfo.orderByName || '',   // Nama pemesan sebagai keterangan
-         cnotelp:  orderInfo.phoneNumber || '',   // No telepon (jika backend support)
+         cremark:  orderInfo.orderByName || '',   // Nama pemesan
+         cnotelp:  orderInfo.phoneNumber || '',   // No telepon
-         namount:  subtotal,                       // Total sebelum pajak
+         namount:  subtotal,                      // Total sebelum pajak
```

---

#### 6. src/scripts/modules/BQO/views/bqo_payment.js [20260807_152704]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Import: Config  
**Lines:** 23

```javascript
// Line 20:
+ import Config from '../../../Config';
// Line 41:
- import Config from '../../../Config';
- 
```

---

#### 7. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_152307]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Tambah fungsi: BQO_DEFAULT_CUSTOMER; Tambah fungsi: CASH_BANK_CODE  
**Lines:** 44-49, 362-365, 368-370, 373

```javascript
// Line 41:
+ 
+ // Customer ID default untuk walk-in / self-order BQO (wajib ada di backend)
+ const BQO_DEFAULT_CUSTOMER = (process.env.REACT_APP_BQO_DEFAULT_CUSTOMER || 'UMUM').trim();
+ 
+ // Kode bank per metode pembayaran — harus sama dengan yang dikonfigurasi di master BBANK
+ const CASH_BANK_CODE = (process.env.REACT_APP_CASH_BANK_CODE || 'T000').trim();
// Line 359:
-           ctabid:   info.seatNumber  || '',   // Nomor Meja
-           cremark:  info.orderByName || '',   // Nama pemesan
-           cnotelp:  info.phoneNumber || '',   // No telepon
+           ccusid:   BQO_DEFAULT_CUSTOMER,          // Customer ID dari env (walk-in/umum)
+           ctabid:   info.seatNumber  || '',         // Nomor Meja
+           cremark:  info.orderByName || '',         // Nama pemesan
+           cnotelp:  info.phoneNumber || '',         // No telepon
-           namount:  subtotal,                  // Total sebelum pajak
-           cbnkid:   '',                        // Kosong = bayar di kasir
-           cpaytype: '',                        // Kosong = Cash
+           namount:  subtotal,                       // Total sebelum pajak
+           cbnkid:   CASH_BANK_CODE,                 // Kode bank tunai dari env
+           cpaytype: '',
-         paymentInfo: { cbnkid: '', namount: 0 }, // belum dibayar
+         paymentInfo: { cbnkid: CASH_BANK_CODE, namount: total }, // bayar di kasir = total
```

---

#### 8. src/scripts/modules/BQO/views/bqo_payment.js [20260807_152307]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Tambah fungsi: BQO_DEFAULT_CUSTOMER; Import: Config  
**Lines:** 40-46, 164

```javascript
// Line 37:
- const TAX_PERCENT = 11;
+ // Customer ID default untuk walk-in / self-order BQO (wajib ada di backend)
+ const BQO_DEFAULT_CUSTOMER = (process.env.REACT_APP_BQO_DEFAULT_CUSTOMER || 'UMUM').trim();
+ 
+ import Config from '../../../Config';
+ 
+ // Pajak — mengikuti pola webcsa-v2 (trenly): BASE_TAX_PERCENTAGE × EFFECTIVE_TAX_RATE
+ const TAX_PERCENT = Config.BASE_TAX_PERCENTAGE * Config.EFFECTIVE_TAX_RATE;
// Line 161:
+         ccusid:   BQO_DEFAULT_CUSTOMER,          // Customer ID dari env (walk-in/umum)
```

---

#### 9. src/scripts/modules/BQO/views/bqo_home.js [20260807_150216]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Import: LinearProgress; Import: Skeleton; Tambah state management  
**Lines:** 19-20, 96, 198, 205, 215, 217, 237, 239, 430-435, 461-480

```javascript
// Line 16:
+ import LinearProgress from '@mui/material/LinearProgress';
+ import Skeleton from '@mui/material/Skeleton';
// Line 93:
+   const [isLoading, setIsLoading] = useState(false);
// Line 195:
+       setIsLoading(true);
+       setIsLoading(false);
// Line 212:
+     setIsLoading(true);
+     setIsLoading(false);
// Line 234:
+     setIsLoading(true);
+     setIsLoading(false);
// Line 427:
+           {/* Progress bar muncul di bawah toolbar saat fetch */}
+           {isLoading && (
+             <LinearProgress
+               sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 }}
+             />
+           )}
// Line 458:
-           {lists.length !== 0 ? (
+           {isLoading ? (
+             /* Skeleton cards saat fetch data */
+             Array.from({ length: 4 }).map((_, i) => (
+               <Paper key={`skel_${i}`} sx={{ my: 2 }}>
+                 <Grid container sx={{ px: 1, py: 0.2 }} justifyContent="flex-start" spacing={1}>
+                   <Grid item>
+                     <Skeleton variant="rectangular" width={smUp ? 85 : 75} height={smUp ? 85 : 75} sx={{ borderRadius: 1 }} />
+                   </Grid>
+                   <Grid item xs={7}>
+                     <Skeleton variant="text" width="70%" height={28} />
+                     <Skeleton variant="text" width="40%" height={20} />
+                     <Skeleton variant="text" width="30%" height={24} />
+                   </Grid>
+                   <Grid container item xs={12} justifyContent="flex-end" mb={1}>
+                     <Skeleton variant="rounded" width={88} height={36} />
+                   </Grid>
+                 </Grid>
+               </Paper>
+             ))
+           ) : lists.length !== 0 ? (
```

---

#### 10. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_145524]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: MenuItem; Import: Config; Tambah state management; Tambah fungsi: fetchOccupiedTables; Tambah error handling; Tambah fungsi: status; Tambah side effect  
**Lines:** 16, 35, 37-43, 134-175, 300-303, 540, 543, 547-570, 618, 854

```javascript
// Line 13:
+ import MenuItem from '@mui/material/MenuItem';
// Line 32:
+ import Config from '../../../Config';
- const TAX_PERCENT = 11;
+ // Pajak — mengikuti pola webcsa-v2 (trenly):
+ //   BASE_TAX_PERCENTAGE × EFFECTIVE_TAX_RATE = pajak efektif yang dibebankan
+ //   Default: 12% × (11/12) = 11%  (PMK 131 Tahun 2024)
+ const TAX_PERCENT = Config.BASE_TAX_PERCENTAGE * Config.EFFECTIVE_TAX_RATE;
+ 
+ // Jumlah meja dari env
+ const TABLE_COUNT = parseInt(process.env.REACT_APP_TABLE_COUNT || '10', 10);
// Line 131:
+   // Daftar meja: status tersedia / terisi
+   // occupiedTables: Set dari ctabid yang sedang ada pesanan aktif
+   const [occupiedTables, setOccupiedTables] = useState(new Set());
+   const [loadingTables, setLoadingTables] = useState(false);
+ 
+   const fetchOccupiedTables = async () => {
+     setLoadingTables(true);
+     try {
+       const res = await bqo_api.getActiveOrders();
+       if (res && res.result && Array.isArray(res.data)) {
+         // Status pesanan yang dianggap "masih aktif" (meja masih terisi)
+         // Sesuaikan dengan status yang dipakai di backend BQO
  // ... (truncated)
+                 }
+                 FormHelperTextProps={{ sx: { color: 'warning.main' } }}
+                 sx={{ minWidth: 160 }}
+               >
+                 <MenuItem value="" disabled>
+                   <em>— Pilih Nomor Meja —</em>
+                 </MenuItem>
+                 {tableOptions.map((opt) => (
+                   <MenuItem
+                     key={opt.value}
+                     value={opt.value}
+                     disabled={opt.occupied}
+                     sx={opt.occupied ? { color: '#aaa' } : {}}
+                   >
+                     {opt.label}
+                     {opt.occupied ? ' (Terisi)' : ''}
+                   </MenuItem>
+                 ))}
+               </TextField>
// Line 615:
-                 Pajak
+                 Pajak ({TAX_PERCENT}%)
// Line 851:
-             <Typography variant="caption" color="text.secondary">Pajak (11%)</Typography>
+             <Typography variant="caption" color="text.secondary">Pajak ({TAX_PERCENT}%)</Typography>
```

---

#### 11. src/scripts/modules/BQO/views/bqo_home.js [20260807_143952]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Pembaruan kode  
**Lines:** 461-466, 611, 613

```javascript
// Line 458:
-                     <img src={Placeholder} style={styles.imageList} alt="Foods & Drinks" />
+                     <img
+                       src={data.picture || Placeholder}
+                       style={styles.imageList}
+                       alt={data.name}
+                       onError={(e) => { e.target.onerror = null; e.target.src = Placeholder; }}
+                     />
// Line 608:
-                   src={data.picture}
+                   src={data.picture || Placeholder}
+                   onError={(e) => { e.target.onerror = null; e.target.src = Placeholder; }}
```

---

#### 12. src/scripts/modules/BQO/views/bqo_home.js [20260807_143143]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Tambah fungsi: findIdx; Tambah fungsi: parseNum  
**Lines:** 96-100, 103, 107, 109-179

```javascript
// Line 93:
-    * getDatas — ambil menu dari bstock_x dengan usebrwdef:false.
-    * Menggunakan getList() agar response berupa object dengan cfamcode
-    * (untuk kategori) dan getimage sesuai konfigurasi bqo_api.
+    * getDatas — ambil menu dari bstock_x.
+    * Mode dikontrol via env:
+    *   REACT_APP_MENU_USE_BRWDEF=Y → usebrwdef:true, response array of arrays
+    *   REACT_APP_MENU_USE_BRWDEF=N → usebrwdef:false, response array of objects (cfamcode tersedia)
+    *   REACT_APP_MENU_GETIMAGE=Y   → request gambar dari server
+     const useBrwDef = process.env.REACT_APP_MENU_USE_BRWDEF === 'Y';
-     const datas = res.data.map((item) => ({
-       id:        (item.cstocode || '').trim(),
-       name:      (item.cstoname || '').trim(),
-       desc:      (item.cstoname2 || item.cnotes1 || '').trim(),
-       price:     String(parseFloat(item.nhrgjua || 0)),
-       sellPrice: String(parseFloat(item.nhrgjua || 0)),
-       category:  (item.cfamcode || 'UMUM').trim(),
-       picture:   item.picture || null,
-       cstocode:  (item.cstocode || '').trim(),
-       cstoname:  (item.cstoname || '').trim(),
-       nhrgjua:   parseFloat(item.nhrgjua || 0),
-       csatuan:   (item.csatuan || 'PCS').trim(),
-       ndisc:     parseFloat(item.ndisc || 0),
-     }));
+     let datas;
  // ... (truncated)
+           cstoname,
+           nhrgjua,
+           csatuan,
+           ndisc,
+         };
+       });
+     } else {
+       // ── Format non-brwdef: data berupa array of objects dengan cfamcode ──
+       datas = res.data.map((item) => ({
+         id:        (item.cstocode || '').trim(),
+         name:      (item.cstoname || '').trim(),
+         desc:      (item.cstoname2 || item.cnotes1 || '').trim(),
+         price:     String(parseFloat(item.nhrgjua || 0)),
+         sellPrice: String(parseFloat(item.nhrgjua || 0)),
+         category:  (item.cfamcode || 'UMUM').trim(),
+         picture:   item.picture || null,
+         cstocode:  (item.cstocode || '').trim(),
+         cstoname:  (item.cstoname || '').trim(),
+         nhrgjua:   parseFloat(item.nhrgjua || 0),
+         csatuan:   (item.csatuan || 'PCS').trim(),
+         ndisc:     parseFloat(item.ndisc || 0),
+       }));
+     }
+ 
+     // Bangun daftar kategori dari data yang ada
```

---

#### 13. src/scripts/modules/BQO/views/bqo_home.js [20260807_142211]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Pembaruan kode  
**Lines:** 96-98, 101, 104-117

```javascript
// Line 93:
-    * getDatas — ambil menu dari bstock_x.
-    * Coba usebrwdef:true dulu — data berformat array of arrays sesuai columns brwdef.
-    * Fallback ke usebrwdef:false jika brwdef gagal.
+    * getDatas — ambil menu dari bstock_x dengan usebrwdef:false.
+    * Menggunakan getList() agar response berupa object dengan cfamcode
+    * (untuk kategori) dan getimage sesuai konfigurasi bqo_api.
-     // Coba brwdef dulu
-     let res = await bqo_api.getListBrwdef({});
-     let useBrwDef = !!(res?.result && res?.columns?.length > 0 && Array.isArray(res?.data?.[0]));
- 
-     if (!useBrwDef) {
-       // Fallback ke non-brwdef
-       res = await bqo_api.getList({});
-     }
- 
+     const res = await bqo_api.getList({});
-     let datas;
- 
-     if (useBrwDef) {
-       // ── Format brwdef: array of arrays ───────────────────────────────────
-       // Mapping berdasarkan title kolom dari response
-       const cols = res.columns; // [{ title, alignment, width }]
-       const findIdx = (keywords) => {
-         const idx = cols.findIndex((c) =>
  // ... (truncated)
-         price:     String(parseFloat(item.nhrgjua || 0)),
-         sellPrice: String(parseFloat(item.nhrgjua || 0)),
-         category:  (item.cfamcode || 'UMUM').trim(),
-         picture:   null,
-         cstocode:  (item.cstocode || '').trim(),
-         cstoname:  (item.cstoname || '').trim(),
-         nhrgjua:   parseFloat(item.nhrgjua || 0),
-         csatuan:   (item.csatuan || 'PCS').trim(),
-         ndisc:     parseFloat(item.ndisc || 0),
-       }));
-     }
+     const datas = res.data.map((item) => ({
+       id:        (item.cstocode || '').trim(),
+       name:      (item.cstoname || '').trim(),
+       desc:      (item.cstoname2 || item.cnotes1 || '').trim(),
+       price:     String(parseFloat(item.nhrgjua || 0)),
+       sellPrice: String(parseFloat(item.nhrgjua || 0)),
+       category:  (item.cfamcode || 'UMUM').trim(),
+       picture:   item.picture || null,
+       cstocode:  (item.cstocode || '').trim(),
+       cstoname:  (item.cstoname || '').trim(),
+       nhrgjua:   parseFloat(item.nhrgjua || 0),
+       csatuan:   (item.csatuan || 'PCS').trim(),
+       ndisc:     parseFloat(item.ndisc || 0),
+     }));
```

---

#### 14. src/scripts/modules/BQO/views/bqo_home.js [20260807_140514]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Tambah fungsi: findIdx; Tambah fungsi: parseHarga  
**Lines:** 97-98, 101, 103, 105-106, 114-129, 131-134, 137-156, 158

```javascript
// Line 94:
-    * Coba usebrwdef:true dulu (mengikuti pola trenly).
-    * Jika response punya columns → data berformat array, map pakai index kolom.
-    * Jika tidak punya columns → data berformat object {key:value}, map langsung.
+    * Coba usebrwdef:true dulu — data berformat array of arrays sesuai columns brwdef.
+    * Fallback ke usebrwdef:false jika brwdef gagal.
-     const useBrwRef = { current: true };
- 
-     // Pertama coba dengan usebrwdef: true
+     // Coba brwdef dulu
+     let useBrwDef = !!(res?.result && res?.columns?.length > 0 && Array.isArray(res?.data?.[0]));
-     // Jika brwdef gagal atau tidak return columns, fallback ke usebrwdef: false
-     if (!res || !res.result || !res.data || res.data.length === 0) {
+     if (!useBrwDef) {
+       // Fallback ke non-brwdef
-       useBrwRef.current = false;
-     if (useBrwRef.current && res.columns && res.columns.length > 0) {
-       // ── Format brwdef: data adalah array of arrays ────────────────────────
-       // Buat map dari title kolom → index
-       const colMap = {};
-       res.columns.forEach((col, idx) => {
-         const key = (col.field || col.title || '').toLowerCase().trim();
-         colMap[key] = idx;
-       });
+     if (useBrwDef) {
  // ... (truncated)
-       }));
+       datas = res.data.map((row) => {
+         const cstocode = String(row[idxKodeItem >= 0 ? idxKodeItem : idxKey] || '').trim();
+         const cstoname = String(row[idxName >= 0 ? idxName : 1] || '').trim();
+         const nhrgjua  = parseHarga(row[idxHarga >= 0 ? idxHarga : 4]);
+         const csatuan  = String(row[idxSatuan >= 0 ? idxSatuan : 3] || 'PCS').trim();
+         return {
+           id:        cstocode,
+           name:      cstoname,
+           desc:      '',
+           price:     String(nhrgjua),
+           sellPrice: String(nhrgjua),
+           category:  'UMUM', // brwdef tidak sertakan cfamcode — pakai default
+           picture:   null,
+           cstocode,
+           cstoname,
+           nhrgjua,
+           csatuan,
+           ndisc: 0,
+         };
+       });
-       // ── Format non-brwdef: data adalah array of objects ───────────────────
+       // ── Format non-brwdef: array of objects ───────────────────────────────
// Line 172:
-     // Bangun kategori unik dari cfamcode
```

---

#### 15. src/scripts/modules/BQO/views/bqo_home.js [20260807_135032]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Tambah fungsi: key; Tambah fungsi: get  
**Lines:** 96-99, 102-112, 115-161

```javascript
// Line 93:
-    * getDatas — ambil menu dari bstock_x dan map ke format yang dipakai frontend.
-    * bstock_x response: { result, data: [{ cstocode, cstoname, nhrgjua, cfamcode, ... }] }
-    * Frontend format:   { datas: [...], categories: [...] }
+    * getDatas — ambil menu dari bstock_x.
+    * Coba usebrwdef:true dulu (mengikuti pola trenly).
+    * Jika response punya columns → data berformat array, map pakai index kolom.
+    * Jika tidak punya columns → data berformat object {key:value}, map langsung.
-     const res = await bqo_api.getList({});
+     const useBrwRef = { current: true };
+ 
+     // Pertama coba dengan usebrwdef: true
+     let res = await bqo_api.getListBrwdef({});
+ 
+     // Jika brwdef gagal atau tidak return columns, fallback ke usebrwdef: false
+     if (!res || !res.result || !res.data || res.data.length === 0) {
+       res = await bqo_api.getList({});
+       useBrwRef.current = false;
+     }
+ 
-     // Map bstock_x fields → format menu restoran
-     // Simpan juga csatuan dan ndisc agar tersedia saat build payload order
-     const datas = res.data.map((item) => ({
-       id:        (item.cstocode || '').trim(),
-       name:      (item.cstoname || '').trim(),
  // ... (truncated)
+         category:  String(get(row, 'cfamcode') || 'UMUM').trim(),
+         picture:   null,
+         cstocode:  String(get(row, 'cstocode') || '').trim(),
+         cstoname:  String(get(row, 'cstoname') || '').trim(),
+         nhrgjua:   parseFloat(get(row, 'nhrgjua') || 0),
+         csatuan:   String(get(row, 'csatuan') || 'PCS').trim(),
+         ndisc:     parseFloat(get(row, 'ndisc') || 0),
+       }));
+     } else {
+       // ── Format non-brwdef: data adalah array of objects ───────────────────
+       datas = res.data.map((item) => ({
+         id:        (item.cstocode || '').trim(),
+         name:      (item.cstoname || '').trim(),
+         desc:      (item.cstoname2 || item.cnotes1 || '').trim(),
+         price:     String(parseFloat(item.nhrgjua || 0)),
+         sellPrice: String(parseFloat(item.nhrgjua || 0)),
+         category:  (item.cfamcode || 'UMUM').trim(),
+         picture:   null,
+         cstocode:  (item.cstocode || '').trim(),
+         cstoname:  (item.cstoname || '').trim(),
+         nhrgjua:   parseFloat(item.nhrgjua || 0),
+         csatuan:   (item.csatuan || 'PCS').trim(),
+         ndisc:     parseFloat(item.ndisc || 0),
+       }));
+     }
```

---

#### 16. src/scripts/modules/BQO/views/bqo_home.js [20260807_133241]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Pembaruan kode  
**Lines:** 112, 122, 125, 161

```javascript
// Line 109:
-       // Gunakan cprocod sebagai kategori (lebih deskriptif dari cfamcode kode 2-3 huruf)
-       // Fallback ke cfamcode jika cprocod kosong
-       category:  (item.cprocod || item.cfamcode || 'UMUM').trim(),
+       category:  (item.cfamcode || 'UMUM').trim(),
// Line 119:
-     // Bangun kategori unik
+     // Bangun kategori unik dari cfamcode
-     // Tab Promo hanya muncul jika ada item yang punya diskon
-     const hasPromo = datas.some((item) => item.ndisc > 0);
-     if (hasPromo) catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
+     catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
// Line 158:
-         datasFilter = resJson.datas.filter((data) => data.ndisc > 0);
+         datasFilter = resJson.datas.filter((data) => data.price !== data.sellPrice);
```

---

#### 17. src/scripts/modules/BQO/views/bqo_home.js [20260807_131834]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Pembaruan kode  
**Lines:** 112-114, 124, 126-129, 132, 165

```javascript
// Line 109:
-       category:  (item.cfamcode || item.cprocod || 'UMUM').trim(),
+       // Gunakan cprocod sebagai kategori (lebih deskriptif dari cfamcode kode 2-3 huruf)
+       // Fallback ke cfamcode jika cprocod kosong
+       category:  (item.cprocod || item.cfamcode || 'UMUM').trim(),
// Line 121:
-     // Bangun kategori unik dari cfamcode
+     // Bangun kategori unik
-     catMap['all']   = { id: 'all',   label: 'Semua' };
-     catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
+     catMap['all']    = { id: 'all',    label: 'Semua' };
+     // Tab Promo hanya muncul jika ada item yang punya diskon
+     const hasPromo = datas.some((item) => item.ndisc > 0);
+     if (hasPromo) catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
-       if (key && !catMap[key]) catMap[key] = { id: key, label: key };
+       if (key && key !== '-' && !catMap[key]) catMap[key] = { id: key, label: key };
// Line 162:
-         datasFilter = resJson.datas.filter((data) => data.price !== data.sellPrice);
+         datasFilter = resJson.datas.filter((data) => data.ndisc > 0);
```

---

#### 18. src/scripts/modules/BQO/controllers/bqo_mock.js [20260807_114122]
**Fungsi:** Modul: bqo_mock  
**Perubahan:** Hapus debug log  
**Lines:** 130, 133-143, 146-147, 154-160, 164-166

```javascript
// Line 127:
-       // ── getList ──────────────────────────────────────────────────────────
+       // ── getList — return format bstock_x agar konsisten dengan backend ───
-         console.log('[BQO MOCK] getList called', data);
+         // Map MOCK_MENU ke format bstock_x response
+         const mockData = MOCK_MENU.map((item) => ({
+           key:       item.id,
+           cstocode:  item.id,
+           cstoname:  item.name,
+           cstoname2: item.desc,
+           nhrgjua:   parseFloat(item.sellPrice),
+           cfamcode:  item.category,
+           cprocod:   item.category,
+           npict:     0,
+         }));
-           datas: MOCK_MENU,
-           categories: MOCK_CATEGORIES,
+           data:   mockData,
+           metadata: { offset: 0, limit: mockData.length, count: mockData.length },
-         console.log('[BQO MOCK] add called', { bon, data });
-         console.table(
-           (data.cart || []).map((item) => ({
-             nama:  item.item?.name,
-             qty:   item.qty,
-             harga: item.item?.sellPrice,
-             note:  item.note || '-',
-           }))
-         );
+         // Log detail order untuk debugging
+         const items = data.lineItemsInfo || data.cart || [];
+         console.log('[BQO MOCK] add called', {
+           bon,
+           headerInfo: data.headerInfo || data.info,
+           itemCount: items.length,
+         });
-             cordernum: bon,
-             cmeja:     data.info?.seatNumber  || '-',
-             cnama:     data.info?.orderByName || '-',
+             cordernum:    bon,
+             cseatno:      data.headerInfo?.cseatno      || data.info?.seatNumber  || '-',
+             corderbyname: data.headerInfo?.corderbyname || data.info?.orderByName || '-',
```

---

#### 19. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_114122]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Tambah fungsi: pad  
**Lines:** 273-315

```javascript
// Line 270:
-       const payload = { info, cart: cartItems };
-       const result  = await bqo_api.add(payload);
+       const today   = new Date();
+       const pad     = (n) => String(n).padStart(2, '0');
+       const dqodate = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
+       const ctime   = `${pad(today.getHours())}:${pad(today.getMinutes())}:${pad(today.getSeconds())}`;
+ 
+       // Field sesuai dokumentasi BQO (Header + BITMQO)
+       const lineItemsInfo = cartItems.map((d, idx) => {
+         const nhrgjua = parseFloat(d.item?.nhrgjua || d.item?.sellPrice || 0);
+         const nqqo    = parseInt(d.qty || 1);
+         const discPct = parseFloat(d.item?.ndisc || 0);
+         const nrpdisc = discPct > 0 ? Math.round(nhrgjua * nqqo * discPct / 100) : 0;
+         return {
+           nline:    idx + 1,
+           cstocode: (d.item?.cstocode || d.item?.id || '').trim(),
+           cstoname: (d.item?.cstoname || d.item?.name || '').trim(),
+           csize:    '-',
+           nqqo,
+           cuom:     (d.item?.csatuan || d.item?.cuom || 'PCS').trim(),
+           nhrgjua,
+           ndisc:    discPct,
+           nrpdisc,
+           cremark:  d.note || '',
+         };
+       });
+ 
+       const payload = {
+         headerInfo: {
+           dqodate,
+           ctime,
+           ctabid:   info.seatNumber  || '',   // Nomor Meja
+           cremark:  info.orderByName || '',   // Nama pemesan
+           cnotelp:  info.phoneNumber || '',   // No telepon
+           npctdisc: 0,
+           npctppn:  TAX_PERCENT,
+           namount:  subtotal,                  // Total sebelum pajak
+           cbnkid:   '',                        // Kosong = bayar di kasir
+           cpaytype: '',                        // Kosong = Cash
+         },
+         lineItemsInfo,
+         paymentInfo: { cbnkid: '', namount: 0 }, // belum dibayar
+       };
+ 
+       const result = await bqo_api.add(payload);
-         // Tampilkan dialog konfirmasi + struk
```

---

#### 20. src/scripts/modules/BQO/views/bqo_home.js [20260807_114122]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Pembaruan kode  
**Lines:** 95-99, 101-132

```javascript
// Line 90:
-   // List
+   /**
+    * getDatas — ambil menu dari bstock_x dan map ke format yang dipakai frontend.
+    * bstock_x response: { result, data: [{ cstocode, cstoname, nhrgjua, cfamcode, ... }] }
+    * Frontend format:   { datas: [...], categories: [...] }
+    */
-     return await bqo_api.getList({});
+     const res = await bqo_api.getList({});
+     if (!res || !res.result || !res.data) return null;
+ 
+     // Map bstock_x fields → format menu restoran
+     // Simpan juga csatuan dan ndisc agar tersedia saat build payload order
+     const datas = res.data.map((item) => ({
+       id:        (item.cstocode || '').trim(),
+       name:      (item.cstoname || '').trim(),
+       desc:      (item.cstoname2 || item.cnotes1 || '').trim(),
+       price:     String(parseFloat(item.nhrgjua || 0)),
+       sellPrice: String(parseFloat(item.nhrgjua || 0)),
+       category:  (item.cfamcode || item.cprocod || 'UMUM').trim(),
+       picture:   null, // getimage tidak tersedia — pakai placeholder
+       // field tambahan untuk payload order
+       cstocode:  (item.cstocode || '').trim(),
+       cstoname:  (item.cstoname || '').trim(),
+       nhrgjua:   parseFloat(item.nhrgjua || 0),
+       csatuan:   (item.csatuan || 'PCS').trim(),
+       ndisc:     parseFloat(item.ndisc || 0),
+     }));
+ 
+     // Bangun kategori unik dari cfamcode
+     const catMap = {};
+     catMap['all']   = { id: 'all',   label: 'Semua' };
+     catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
+     datas.forEach((item) => {
+       const key = item.category;
+       if (key && !catMap[key]) catMap[key] = { id: key, label: key };
+     });
+     const categories = Object.values(catMap);
+ 
+     return { datas, categories };
// Line 141:
-       // jika API belum siap / 404, biarkan state tetap [] (initial value)
```

---

#### 21. src/scripts/modules/BQO/views/bqo_payment.js [20260807_114122]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Tambah fungsi: buildPayload; Tambah fungsi: pad; Tambah fungsi: buildCurrentPayload  
**Lines:** 125-170, 237-238

```javascript
// Line 122:
-   const buildPayload = (cbnkid) => ({
-     info: orderInfo,
-     cart: cartItems,
-     paymentInfo: { cbnkid, namount: total },
-     taxAmount,
-     subtotal,
-     total,
-   });
+   // Field sesuai dokumentasi BQO:
+   //   Header: DQODATE, CTABID, CWHSEID, CREMARK, NPCTPPN, NAMOUNT, CBNKID
+   //   Item:   NLINE, CSTOCODE, CSTONAME, NQQO, CUOM, NHRGJUA, NDISC, NRPDISC
+   const buildPayload = (cbnkid) => {
+     const today   = new Date();
+     const pad     = (n) => String(n).padStart(2, '0');
+     const dqodate = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
+     const ctime   = `${pad(today.getHours())}:${pad(today.getMinutes())}:${pad(today.getSeconds())}`;
+ 
+     const lineItemsInfo = cartItems.map((d, idx) => {
+       const nhrgjua = parseFloat(d.item?.nhrgjua || d.item?.sellPrice || 0);
+       const nqqo    = parseInt(d.qty || 1);
+       const discPct = parseFloat(d.item?.ndisc || 0);
+       const nrpdisc = discPct > 0 ? Math.round(nhrgjua * nqqo * discPct / 100) : 0;
+       return {
+         nline:    idx + 1,
  // ... (truncated)
+         ctabid:   orderInfo.seatNumber  || '',   // Nomor Meja
+         cremark:  orderInfo.orderByName || '',   // Nama pemesan sebagai keterangan
+         cnotelp:  orderInfo.phoneNumber || '',   // No telepon (jika backend support)
+         npctdisc: 0,
+         npctppn:  TAX_PERCENT,
+         namount:  subtotal,                       // Total sebelum pajak
+         cbnkid,
+         cpaytype: cbnkid ? '' : '',              // kosong = Cash
+       },
+       lineItemsInfo,
+       paymentInfo: { cbnkid, namount: total },
+     };
+   };
// Line 234:
-   // ── Rebuild payload dari state saat ini ───────────────────────────────────
-   const buildCurrentPayload = (cbnkid) => ({
-     info: orderInfo,
-     cart: cartItems,
-     paymentInfo: { cbnkid, namount: total },
-     taxAmount,
-     subtotal,
-     total,
-   });
+   // ── Rebuild payload dari state saat ini (untuk retry) ────────────────────
+   const buildCurrentPayload = (cbnkid) => buildPayload(cbnkid);
```

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260807.md [20260807_162431]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 7-129, 174, 197, 241, 256, 289, 310, 363, 424, 446, 507, 568, 629, 690, 715, 744, 795, 852, 904, 965, 967-968, 970, 973-997, 999-1023, 1028, 1089, 1150, 1211, 1272, 1333, 1394, 1455, 1516, 1577, 1638, 1699, 1760, 1821, 1882, 1943, 2400-2405, 2458, 2460, 2462

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_160440]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_161320]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 341, 343, 351-353, 356-358, 360-366, 375, 377, 379-403
+ 
+ ```javascript
+ // Line 338:
+ +       const externalId = String(+today).substring(0, 10); // timestamp 10 char untuk referensi
+ -       // Field sesuai dokumentasi BQO (Header + BITMQO)
+ +       // Field sesuai dokumentasi BQO draft.4
+ // Line 348:
+ +           cgroup:   '',
+ +           ctime:    '',
+ +           crefnote: 'ONLINE',
+ -           csize:    '-',
+ +           csize:    '',
+ +           cloc:     '',
+ +           ncqo:     '',
+ -           cuom:     (d.item?.csatuan || d.item?.cuom || 'PCS').trim(),
+ -           nhrgjua,
+ -           ndisc:    discPct,
+ -           nrpdisc,
+ +           cuom:     (d.item?.csatuan || d.item?.cuom || '').trim(),
  // ... (truncated)
- #### 13. docs/changelog/daily/codeChange-20260807.md [20260807_130318]
+ #### 14. docs/changelog/daily/codeChange-20260807.md [20260807_130318]
// Line 1818:
- #### 14. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
+ #### 15. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
// Line 1879:
- #### 15. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
+ #### 16. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
// Line 1940:
- #### 16. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
+ #### 17. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
// Line 2397:
+ #### 5. nv/qorestoweb/.env [20260807_162427]
+ **Fungsi:** Implementasi: .env  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ 
+ ---
+ 
// Line 2455:
- - **📖 Documentation:** 16 items
+ - **📖 Documentation:** 17 items
- - **⚙️ Config:** 4 items
+ - **⚙️ Config:** 5 items
- - **Total Files Modified:** 54
+ - **Total Files Modified:** 56
```

---

#### 2. docs/changelog/daily/codeChange-20260807.md [20260807_161320]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 7-119, 134, 167, 188, 241, 302, 324, 385, 446, 507, 568, 593, 622, 673, 730, 782, 843, 845, 849-852, 855-905, 910-915, 918-968, 973, 1034, 1095, 1156, 1217, 1278, 1339, 1400, 1461, 1522, 1583, 1644, 1705, 1766, 1827, 1870-1926, 1955, 1989, 2009, 2062, 2103, 2118, 2179, 2192, 2203-2208, 2211-2227, 2232, 2247, 2262, 2284, 2286-2288, 2290-2301, 2303, 2321, 2335-2336, 2340

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_payment.js [20260807_152704]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_160440]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Tambah fungsi: TAX_RATE_STR; Tambah fungsi: BQO_DEFAULT_WHSE  
+ **Lines:** 36-43, 48, 50, 363, 366-370, 373-374, 378
+ 
+ ```javascript
+ // Line 32:
+ - import Config from '../../../Config';
+ - // Pajak — mengikuti pola webcsa-v2 (trenly):
+ - //   BASE_TAX_PERCENTAGE × EFFECTIVE_TAX_RATE = pajak efektif yang dibebankan
+ - //   Default: 12% × (11/12) = 11%  (PMK 131 Tahun 2024)
+ - const TAX_PERCENT = Config.BASE_TAX_PERCENTAGE * Config.EFFECTIVE_TAX_RATE;
+ + // Pajak — BASE_TAX × EFFECTIVE_RATE dari env (pola webcsa-v2)
+ + // Contoh: 12 × (11/12) = 11%
+ + const TAX_BASE = parseFloat(process.env.REACT_APP_TAX_BASE || '12');
+ + const TAX_RATE_STR = (process.env.REACT_APP_TAX_EFFECTIVE_RATE || '11/12').trim();
+ + const TAX_RATE = TAX_RATE_STR.includes('/')
+ +   ? eval(TAX_RATE_STR) // "11/12" → 0.9166...
+ +   : parseFloat(TAX_RATE_STR);
+ + const TAX_PERCENT = TAX_BASE * TAX_RATE; // 12 * (11/12) = 11
+ - // Customer ID default untuk walk-in / self-order BQO (wajib ada di backend)
+ + // Customer ID dan Warehouse ID default — baca langsung dari env
+ + const BQO_DEFAULT_WHSE     = (process.env.REACT_APP_BQO_DEFAULT_WHSE     || '').trim();
  // ... (truncated)
- #### 2. public/app.cfg [20260807_083315]
+ #### 3. public/app.cfg [20260807_083315]
// Line 2331:
- #### 3. src/scripts/Config.js [20260807_160437]
- **Fungsi:** Konfigurasi aplikasi (base URL, konstanta)  
- **Perubahan:** Pembaruan kode  
- 
- ```javascript
- // Line 13:
- - 
- -   // Pajak/PPN — mengikuti pola webcsa-v2 (trenly):
- -   //   BASE_TAX_PERCENTAGE: rate dasar (12% sesuai UU HPP)
- -   //   EFFECTIVE_TAX_RATE : DPP Nilai Lain per PMK 131/2024 (11/12)
- -   //   Pajak efektif yang dibebankan ke pelanggan = 12 * (11/12) = 11%
- -   BASE_TAX_PERCENTAGE: 12,
- -   EFFECTIVE_TAX_RATE: 11 / 12,   // PMK 131 Tahun 2024
- ```
- 
- 
- - **✨ Features:** 19 items
- - **📖 Documentation:** 15 items
+ - **✨ Features:** 21 items
+ - **📖 Documentation:** 16 items
- - **Total Files Modified:** 51
+ - **Total Files Modified:** 54
```

---

#### 3. docs/changelog/daily/codeChange-20260807.md [20260807_160440]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 7-22, 55, 76, 129, 190, 212, 273, 334, 395, 456, 481, 510, 561, 618, 670, 731-799, 801-839, 845-906, 967, 1028, 1089, 1150, 1211, 1272, 1333, 1394, 1455, 1516, 1577, 1638, 1699, 2019-2074, 2129-2134, 2168-2184, 2186-2191

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_152307]
+ #### 1. src/scripts/modules/BQO/views/bqo_payment.js [20260807_152704]
+ **Fungsi:** Modul: bqo_payment  
+ **Perubahan:** Import: Config  
+ **Lines:** 23
+ 
+ ```javascript
+ // Line 20:
+ + import Config from '../../../Config';
+ // Line 41:
+ - import Config from '../../../Config';
+ - 
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_152307]
// Line 52:
- #### 2. src/scripts/modules/BQO/views/bqo_payment.js [20260807_152307]
+ #### 3. src/scripts/modules/BQO/views/bqo_payment.js [20260807_152307]
// Line 73:
- #### 3. src/scripts/modules/BQO/views/bqo_home.js [20260807_150216]
+ #### 4. src/scripts/modules/BQO/views/bqo_home.js [20260807_150216]
// Line 126:
  // ... (truncated)
+ ```javascript
+ // Line 13:
+ - 
+ -   // Pajak/PPN — mengikuti pola webcsa-v2 (trenly):
+ -   //   BASE_TAX_PERCENTAGE: rate dasar (12% sesuai UU HPP)
+ -   //   EFFECTIVE_TAX_RATE : DPP Nilai Lain per PMK 131/2024 (11/12)
+ -   //   Pajak efektif yang dibebankan ke pelanggan = 12 * (11/12) = 11%
+ -   BASE_TAX_PERCENTAGE: 12,
+ -   EFFECTIVE_TAX_RATE: 11 / 12,   // PMK 131 Tahun 2024
+ ```
+ 
+ ---
+ 
- - **✨ Features:** 16 items
- - **📖 Documentation:** 14 items
- - **🔌 API:** 9 items
- - **⚙️ Config:** 3 items
- - **⚙️ Others:** 2 items
- - **Total Files Modified:** 44
+ - **✨ Features:** 19 items
+ - **📖 Documentation:** 15 items
+ - **🔌 API:** 10 items
+ - **⚙️ Config:** 4 items
+ - **⚙️ Others:** 3 items
+ - **Total Files Modified:** 51
```

---

#### 4. docs/changelog/daily/codeChange-20260807.md [20260807_152704]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Tambah state management  
**Lines:** 7-61, 114, 175, 197, 258, 319, 380, 441, 466, 495, 546, 603, 655, 716-718, 722-727, 730-735, 737-768, 770-780, 785, 846, 907, 968, 1029, 1090, 1151, 1212, 1273, 1334, 1395, 1456, 1517, 1839-1854, 1869, 1925-1926, 1930

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_150216]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_152307]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Tambah fungsi: BQO_DEFAULT_CUSTOMER; Tambah fungsi: CASH_BANK_CODE  
+ **Lines:** 44-49, 362-365, 368-370, 373
+ 
+ ```javascript
+ // Line 41:
+ + 
+ + // Customer ID default untuk walk-in / self-order BQO (wajib ada di backend)
+ + const BQO_DEFAULT_CUSTOMER = (process.env.REACT_APP_BQO_DEFAULT_CUSTOMER || 'UMUM').trim();
+ + 
+ + // Kode bank per metode pembayaran — harus sama dengan yang dikonfigurasi di master BBANK
+ + const CASH_BANK_CODE = (process.env.REACT_APP_CASH_BANK_CODE || 'T000').trim();
+ // Line 359:
+ -           ctabid:   info.seatNumber  || '',   // Nomor Meja
+ -           cremark:  info.orderByName || '',   // Nama pemesan
+ -           cnotelp:  info.phoneNumber || '',   // No telepon
+ +           ccusid:   BQO_DEFAULT_CUSTOMER,          // Customer ID dari env (walk-in/umum)
+ +           ctabid:   info.seatNumber  || '',         // Nomor Meja
+ +           cremark:  info.orderByName || '',         // Nama pemesan
+ +           cnotelp:  info.phoneNumber || '',         // No telepon
+ -           namount:  subtotal,                  // Total sebelum pajak
+ -           cbnkid:   '',                        // Kosong = bayar di kasir
  // ... (truncated)
+ + # ── Customer Default BQO ─────────────────────────────────────────────────────
+ + # Customer ID untuk transaksi walk-in / self-order (field ccusid wajib di backend)
+ + REACT_APP_BQO_DEFAULT_CUSTOMER=UMUM
+ + 
+ ```
+ 
+ ---
+ 
+ #### 2. env/qorestoweb/.env [20260807_145524]
// Line 1866:
- #### 2. env/qorestoweb/.env [20260807_142211]
+ #### 3. env/qorestoweb/.env [20260807_142211]
// Line 1888:
- #### 3. nv/qorestoweb/.env [20260807_152303]
- **Fungsi:** Implementasi: .env  
- **Perubahan:** Ubah konfigurasi environment / API endpoint  
- 
- 
// Line 1922:
- - **✨ Features:** 15 items
- - **📖 Documentation:** 13 items
+ - **✨ Features:** 16 items
+ - **📖 Documentation:** 14 items
- - **Total Files Modified:** 42
+ - **Total Files Modified:** 44
```

---

#### 5. docs/changelog/daily/codeChange-20260807.md [20260807_152307]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Tambah state management  
**Lines:** 7-60, 121, 143, 204, 265, 326, 387, 412, 441, 492, 549, 601, 662-712, 718-779, 840, 901, 962, 1023, 1084, 1145, 1206, 1267, 1328, 1389, 1450, 1809-1814, 1849-1850, 1852, 1854

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_145524]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_150216]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Import: LinearProgress; Import: Skeleton; Tambah state management  
+ **Lines:** 19-20, 96, 198, 205, 215, 217, 237, 239, 430-435, 461-480
+ 
+ ```javascript
+ // Line 16:
+ + import LinearProgress from '@mui/material/LinearProgress';
+ + import Skeleton from '@mui/material/Skeleton';
+ // Line 93:
+ +   const [isLoading, setIsLoading] = useState(false);
+ // Line 195:
+ +       setIsLoading(true);
+ +       setIsLoading(false);
+ // Line 212:
+ +     setIsLoading(true);
+ +     setIsLoading(false);
+ // Line 234:
+ +     setIsLoading(true);
+ +     setIsLoading(false);
+ // Line 427:
+ +           {/* Progress bar muncul di bawah toolbar saat fetch */}
+ +           {isLoading && (
  // ... (truncated)
// Line 1325:
- #### 10. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
+ #### 11. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
// Line 1386:
- #### 11. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
+ #### 12. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
// Line 1447:
- #### 12. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
+ #### 13. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
// Line 1806:
+ #### 3. nv/qorestoweb/.env [20260807_152303]
+ **Fungsi:** Implementasi: .env  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ 
+ ---
+ 
// Line 1846:
- - **✨ Features:** 13 items
- - **📖 Documentation:** 12 items
+ - **✨ Features:** 15 items
+ - **📖 Documentation:** 13 items
- - **⚙️ Config:** 2 items
+ - **⚙️ Config:** 3 items
- - **Total Files Modified:** 38
+ - **Total Files Modified:** 42
```

---

#### 6. docs/changelog/daily/codeChange-20260807.md [20260807_150216]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Tambah state management; Tambah error handling  
**Lines:** 7-68, 90, 151, 212, 273, 334, 359, 388, 439, 496, 548, 609-620, 623-628, 630-643, 645-647, 649-673, 678, 739, 800, 861, 922, 983, 1044, 1105, 1166, 1227, 1288, 1331-1360, 1394, 1414, 1467, 1508, 1523, 1584, 1597, 1608-1613, 1616-1619, 1625, 1649, 1667-1679, 1681-1682, 1686

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_143952]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_145524]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Import: MenuItem; Import: Config; Tambah state management; Tambah fungsi: fetchOccupiedTables; Tambah error handling; Tambah fungsi: status; Tambah side effect  
+ **Lines:** 16, 35, 37-43, 134-175, 300-303, 540, 543, 547-570, 618, 854
+ 
+ ```javascript
+ // Line 13:
+ + import MenuItem from '@mui/material/MenuItem';
+ // Line 32:
+ + import Config from '../../../Config';
+ - const TAX_PERCENT = 11;
+ + // Pajak — mengikuti pola webcsa-v2 (trenly):
+ + //   BASE_TAX_PERCENTAGE × EFFECTIVE_TAX_RATE = pajak efektif yang dibebankan
+ + //   Default: 12% × (11/12) = 11%  (PMK 131 Tahun 2024)
+ + const TAX_PERCENT = Config.BASE_TAX_PERCENTAGE * Config.EFFECTIVE_TAX_RATE;
+ + 
+ + // Jumlah meja dari env
+ + const TABLE_COUNT = parseInt(process.env.REACT_APP_TABLE_COUNT || '10', 10);
+ // Line 131:
+ +   // Daftar meja: status tersedia / terisi
+ +   // occupiedTables: Set dari ctabid yang sedang ada pesanan aktif
+ +   const [occupiedTables, setOccupiedTables] = useState(new Set());
+ +   const [loadingTables, setLoadingTables] = useState(false);
  // ... (truncated)
- ```
- 
- 
- #### 2. src/scripts/Config.js [20260807_145520]
+ #### 1. src/scripts/Config.js [20260807_145524]
// Line 1664:
+ #### 2. public/app.cfg [20260807_083315]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 8
+ 
+ ```javascript
+ // Line 5:
+ -   "xendit_show_simulate": true,
+ +   "xendit_show_simulate": false,
+ ```
+ 
+ ---
+ 
- - **✨ Features:** 12 items
- - **📖 Documentation:** 11 items
+ - **✨ Features:** 13 items
+ - **📖 Documentation:** 12 items
- - **Total Files Modified:** 36
+ - **Total Files Modified:** 38
```

---

#### 7. docs/changelog/daily/codeChange-20260807.md [20260807_145524]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Tambah state management; Tambah error handling  
**Lines:** 7-29, 90, 151, 212, 273, 298, 327, 378, 435, 487, 548-605, 611-672, 733, 794, 855, 916, 977, 1038, 1099, 1160, 1221, 1512-1540, 1565-1570, 1586-1603, 1605-1610

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_143143]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_143952]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 461-466, 611, 613
+ 
+ ```javascript
+ // Line 458:
+ -                     <img src={Placeholder} style={styles.imageList} alt="Foods & Drinks" />
+ +                     <img
+ +                       src={data.picture || Placeholder}
+ +                       style={styles.imageList}
+ +                       alt={data.name}
+ +                       onError={(e) => { e.target.onerror = null; e.target.src = Placeholder; }}
+ +                     />
+ // Line 608:
+ -                   src={data.picture}
+ +                   src={data.picture || Placeholder}
+ +                   onError={(e) => { e.target.onerror = null; e.target.src = Placeholder; }}
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_home.js [20260807_143143]
  // ... (truncated)
+ ```javascript
+ // Line 13:
+ + 
+ +   // Pajak/PPN — mengikuti pola webcsa-v2 (trenly):
+ +   //   BASE_TAX_PERCENTAGE: rate dasar (12% sesuai UU HPP)
+ +   //   EFFECTIVE_TAX_RATE : DPP Nilai Lain per PMK 131/2024 (11/12)
+ +   //   Pajak efektif yang dibebankan ke pelanggan = 12 * (11/12) = 11%
+ +   BASE_TAX_PERCENTAGE: 12,
+ +   EFFECTIVE_TAX_RATE: 11 / 12,   // PMK 131 Tahun 2024
+ ```
+ 
+ ---
+ 
- - **✨ Features:** 11 items
- - **📖 Documentation:** 10 items
- - **🔌 API:** 8 items
- - **⚙️ Config:** 1 item
- - **⚙️ Others:** 1 item
- - **Total Files Modified:** 31
+ - **✨ Features:** 12 items
+ - **📖 Documentation:** 11 items
+ - **🔌 API:** 9 items
+ - **⚙️ Config:** 2 items
+ - **⚙️ Others:** 2 items
+ - **Total Files Modified:** 36
```

---

#### 8. docs/changelog/daily/codeChange-20260807.md [20260807_143952]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 7-68, 129, 190, 251, 276, 305, 356, 413, 465, 526, 534-595, 656, 717, 778, 839, 900, 961, 1022, 1083, 1414-1415, 1419

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_142211]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_143143]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Tambah fungsi: findIdx; Tambah fungsi: parseNum  
+ **Lines:** 96-100, 103, 107, 109-179
+ 
+ ```javascript
+ // Line 93:
+ -    * getDatas — ambil menu dari bstock_x dengan usebrwdef:false.
+ -    * Menggunakan getList() agar response berupa object dengan cfamcode
+ -    * (untuk kategori) dan getimage sesuai konfigurasi bqo_api.
+ +    * getDatas — ambil menu dari bstock_x.
+ +    * Mode dikontrol via env:
+ +    *   REACT_APP_MENU_USE_BRWDEF=Y → usebrwdef:true, response array of arrays
+ +    *   REACT_APP_MENU_USE_BRWDEF=N → usebrwdef:false, response array of objects (cfamcode tersedia)
+ +    *   REACT_APP_MENU_GETIMAGE=Y   → request gambar dari server
+ +     const useBrwDef = process.env.REACT_APP_MENU_USE_BRWDEF === 'Y';
+ -     const datas = res.data.map((item) => ({
+ -       id:        (item.cstocode || '').trim(),
+ -       name:      (item.cstoname || '').trim(),
+ -       desc:      (item.cstoname2 || item.cnotes1 || '').trim(),
+ -       price:     String(parseFloat(item.nhrgjua || 0)),
+ -       sellPrice: String(parseFloat(item.nhrgjua || 0)),
+ -       category:  (item.cfamcode || 'UMUM').trim(),
  // ... (truncated)
// Line 775:
- #### 4. docs/changelog/daily/codeChange-20260807.md [20260807_133241]
+ #### 5. docs/changelog/daily/codeChange-20260807.md [20260807_133241]
// Line 836:
- #### 5. docs/changelog/daily/codeChange-20260807.md [20260807_131834]
+ #### 6. docs/changelog/daily/codeChange-20260807.md [20260807_131834]
// Line 897:
- #### 6. docs/changelog/daily/codeChange-20260807.md [20260807_130318]
+ #### 7. docs/changelog/daily/codeChange-20260807.md [20260807_130318]
// Line 958:
- #### 7. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
+ #### 8. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
// Line 1019:
- #### 8. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
+ #### 9. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
// Line 1080:
- #### 9. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
+ #### 10. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
// Line 1411:
- - **✨ Features:** 10 items
- - **📖 Documentation:** 9 items
+ - **✨ Features:** 11 items
+ - **📖 Documentation:** 10 items
- - **Total Files Modified:** 29
+ - **Total Files Modified:** 31
```

---

#### 9. docs/changelog/daily/codeChange-20260807.md [20260807_143143]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 7-68, 129, 190, 215, 244, 295, 352, 404, 465, 468-476, 479-503, 505-529, 534, 595, 656, 717, 778, 839, 900, 961, 1004-1038, 1058, 1111, 1152, 1167, 1228, 1241, 1254, 1257-1272, 1292-1293, 1297

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_140514]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_142211]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 96-98, 101, 104-117
+ 
+ ```javascript
+ // Line 93:
+ -    * getDatas — ambil menu dari bstock_x.
+ -    * Coba usebrwdef:true dulu — data berformat array of arrays sesuai columns brwdef.
+ -    * Fallback ke usebrwdef:false jika brwdef gagal.
+ +    * getDatas — ambil menu dari bstock_x dengan usebrwdef:false.
+ +    * Menggunakan getList() agar response berupa object dengan cfamcode
+ +    * (untuk kategori) dan getimage sesuai konfigurasi bqo_api.
+ -     // Coba brwdef dulu
+ -     let res = await bqo_api.getListBrwdef({});
+ -     let useBrwDef = !!(res?.result && res?.columns?.length > 0 && Array.isArray(res?.data?.[0]));
+ - 
+ -     if (!useBrwDef) {
+ -       // Fallback ke non-brwdef
+ -       res = await bqo_api.getList({});
+ -     }
+ - 
+ +     const res = await bqo_api.getList({});
  // ... (truncated)
- #### 1. nv/qorestoweb/.env [20260807_142208]
+ #### 1. env/qorestoweb/.env [20260807_142211]
+ **Lines:** 23-33
+ 
+ ```javascript
+ // Line 20:
+ + 
+ + # ── Katalog Menu (bstock_x) ──────────────────────────────────────────────────
+ + # REACT_APP_MENU_USE_BRWDEF:
+ + #   Y = usebrwdef true  → kolom dinamis dari brwdef server (data berformat array)
+ + #   N = usebrwdef false → object statis dengan cfamcode sebagai kategori (RECOMMENDED)
+ + REACT_APP_MENU_USE_BRWDEF=Y
+ + 
+ + # REACT_APP_MENU_GETIMAGE:
+ + #   Y = aktifkan getimage (butuh ShowImageAPI dikonfigurasi di apicsa.cfg server)
+ + #   N = nonaktif, gunakan placeholder
+ + REACT_APP_MENU_GETIMAGE=Y
+ ```
// Line 1289:
- - **✨ Features:** 9 items
- - **📖 Documentation:** 8 items
+ - **✨ Features:** 10 items
+ - **📖 Documentation:** 9 items
- - **Total Files Modified:** 27
+ - **Total Files Modified:** 29
```

---

#### 10. docs/changelog/daily/codeChange-20260807.md [20260807_142211]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 7-68, 129, 154, 183, 234, 291, 343, 404, 406-407, 410-419, 421-434, 436-444, 446-460, 467-528, 589, 650, 711, 772, 833, 894, 937-957, 1010, 1051, 1066, 1127, 1140, 1151, 1154-1189, 1209-1212, 1214

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_135032]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_140514]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Tambah fungsi: findIdx; Tambah fungsi: parseHarga  
+ **Lines:** 97-98, 101, 103, 105-106, 114-129, 131-134, 137-156, 158
+ 
+ ```javascript
+ // Line 94:
+ -    * Coba usebrwdef:true dulu (mengikuti pola trenly).
+ -    * Jika response punya columns → data berformat array, map pakai index kolom.
+ -    * Jika tidak punya columns → data berformat object {key:value}, map langsung.
+ +    * Coba usebrwdef:true dulu — data berformat array of arrays sesuai columns brwdef.
+ +    * Fallback ke usebrwdef:false jika brwdef gagal.
+ -     const useBrwRef = { current: true };
+ - 
+ -     // Pertama coba dengan usebrwdef: true
+ +     // Coba brwdef dulu
+ +     let useBrwDef = !!(res?.result && res?.columns?.length > 0 && Array.isArray(res?.data?.[0]));
+ -     // Jika brwdef gagal atau tidak return columns, fallback ke usebrwdef: false
+ -     if (!res || !res.result || !res.data || res.data.length === 0) {
+ +     if (!useBrwDef) {
+ +       // Fallback ke non-brwdef
+ -       useBrwRef.current = false;
+ -     if (useBrwRef.current && res.columns && res.columns.length > 0) {
  // ... (truncated)
+ -    * Dipakai sebagai primary fetch di bqo_home.js, fallback ke getList jika gagal.
+ +    * getListBrwdef — alias dengan usebrwdef:true paksa.
+ +    * Dipakai jika ingin eksplisit pakai brwdef terlepas dari env.
+ // Line 99:
+ -       getimage: false,
+ +       getimage: MENU_GETIMAGE,
+ ```
+ 
+ ---
+ 
+ ### ⚙️ Config
+ 
+ #### 1. nv/qorestoweb/.env [20260807_142208]
+ **Fungsi:** Implementasi: .env  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
// Line 1206:
- - **✨ Features:** 8 items
- - **📖 Documentation:** 7 items
- - **🔌 API:** 7 items
+ - **✨ Features:** 9 items
+ - **📖 Documentation:** 8 items
+ - **🔌 API:** 8 items
+ - **⚙️ Config:** 1 item
- - **Total Files Modified:** 23
+ - **Total Files Modified:** 27
```

---

#### 11. docs/changelog/daily/codeChange-20260807.md [20260807_140514]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 7-68, 93, 122, 173, 230, 282, 343, 345-346, 349-373, 375-399, 406-467, 528, 589, 650, 711, 772, 815-868, 909, 924, 985, 998, 1009, 1031-1033, 1035

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_133241]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_135032]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Tambah fungsi: key; Tambah fungsi: get  
+ **Lines:** 96-99, 102-112, 115-161
+ 
+ ```javascript
+ // Line 93:
+ -    * getDatas — ambil menu dari bstock_x dan map ke format yang dipakai frontend.
+ -    * bstock_x response: { result, data: [{ cstocode, cstoname, nhrgjua, cfamcode, ... }] }
+ -    * Frontend format:   { datas: [...], categories: [...] }
+ +    * getDatas — ambil menu dari bstock_x.
+ +    * Coba usebrwdef:true dulu (mengikuti pola trenly).
+ +    * Jika response punya columns → data berformat array, map pakai index kolom.
+ +    * Jika tidak punya columns → data berformat object {key:value}, map langsung.
+ -     const res = await bqo_api.getList({});
+ +     const useBrwRef = { current: true };
+ + 
+ +     // Pertama coba dengan usebrwdef: true
+ +     let res = await bqo_api.getListBrwdef({});
+ + 
+ +     // Jika brwdef gagal atau tidak return columns, fallback ke usebrwdef: false
+ +     if (!res || !res.result || !res.data || res.data.length === 0) {
+ +       res = await bqo_api.getList({});
  // ... (truncated)
+ #### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_133241]
// Line 906:
- #### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_131834]
+ #### 3. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_131834]
// Line 921:
- #### 3. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_114122]
+ #### 4. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_114122]
// Line 982:
- #### 4. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
+ #### 5. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
// Line 995:
- #### 5. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
+ #### 6. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
// Line 1006:
- #### 6. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_135030]
+ #### 7. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_140512]
// Line 1028:
- - **✨ Features:** 7 items
- - **📖 Documentation:** 6 items
- - **🔌 API:** 6 items
+ - **✨ Features:** 8 items
+ - **📖 Documentation:** 7 items
+ - **🔌 API:** 7 items
- - **Total Files Modified:** 20
+ - **Total Files Modified:** 23
```

---

#### 12. docs/changelog/daily/codeChange-20260807.md [20260807_135032]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 7-32, 61, 112, 169, 221, 282, 284-285, 288-338, 345-406, 467, 528, 589, 650, 693-734, 749, 810, 823, 834, 856-858, 860

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_131834]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_133241]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 112, 122, 125, 161
+ 
+ ```javascript
+ // Line 109:
+ -       // Gunakan cprocod sebagai kategori (lebih deskriptif dari cfamcode kode 2-3 huruf)
+ -       // Fallback ke cfamcode jika cprocod kosong
+ -       category:  (item.cprocod || item.cfamcode || 'UMUM').trim(),
+ +       category:  (item.cfamcode || 'UMUM').trim(),
+ // Line 119:
+ -     // Bangun kategori unik
+ +     // Bangun kategori unik dari cfamcode
+ -     // Tab Promo hanya muncul jika ada item yang punya diskon
+ -     const hasPromo = datas.some((item) => item.ndisc > 0);
+ -     if (hasPromo) catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
+ +     catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
+ // Line 158:
+ -         datasFilter = resJson.datas.filter((data) => data.ndisc > 0);
+ +         datasFilter = resJson.datas.filter((data) => data.price !== data.sellPrice);
+ ```
+ 
  // ... (truncated)
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_131834]
// Line 746:
- #### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_114122]
+ #### 3. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_114122]
// Line 807:
- #### 3. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
+ #### 4. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
// Line 820:
- #### 4. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
+ #### 5. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
// Line 831:
- #### 5. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_133238]
+ #### 6. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_135030]
// Line 853:
- - **✨ Features:** 6 items
- - **📖 Documentation:** 5 items
- - **🔌 API:** 5 items
+ - **✨ Features:** 7 items
+ - **📖 Documentation:** 6 items
+ - **🔌 API:** 6 items
- - **Total Files Modified:** 17
+ - **Total Files Modified:** 20
```

---

#### 13. docs/changelog/daily/codeChange-20260807.md [20260807_133241]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 7-36, 87, 144, 196, 257, 260, 264-277, 284-345, 406, 467, 528, 571-586, 647, 660, 671, 693-695, 697

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/controllers/bqo_mock.js [20260807_114122]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_131834]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 112-114, 124, 126-129, 132, 165
+ 
+ ```javascript
+ // Line 109:
+ -       category:  (item.cfamcode || item.cprocod || 'UMUM').trim(),
+ +       // Gunakan cprocod sebagai kategori (lebih deskriptif dari cfamcode kode 2-3 huruf)
+ +       // Fallback ke cfamcode jika cprocod kosong
+ +       category:  (item.cprocod || item.cfamcode || 'UMUM').trim(),
+ // Line 121:
+ -     // Bangun kategori unik dari cfamcode
+ +     // Bangun kategori unik
+ -     catMap['all']   = { id: 'all',   label: 'Semua' };
+ -     catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
+ +     catMap['all']    = { id: 'all',    label: 'Semua' };
+ +     // Tab Promo hanya muncul jika ada item yang punya diskon
+ +     const hasPromo = datas.some((item) => item.ndisc > 0);
+ +     if (hasPromo) catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
+ -       if (key && !catMap[key]) catMap[key] = { id: key, label: key };
+ +       if (key && key !== '-' && !catMap[key]) catMap[key] = { id: key, label: key };
+ // Line 162:
  // ... (truncated)
+ -       getimage: false, // getimage butuh ShowImageAPI di apicsa.cfg
+ +       getimage: true, // getimage butuh ShowImageAPI di apicsa.cfg
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_114122]
// Line 644:
- #### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
+ #### 3. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
// Line 657:
- #### 3. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
+ #### 4. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
// Line 668:
- #### 4. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_131833]
+ #### 5. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_133238]
// Line 690:
- - **✨ Features:** 5 items
- - **📖 Documentation:** 4 items
- - **🔌 API:** 4 items
+ - **✨ Features:** 6 items
+ - **📖 Documentation:** 5 items
+ - **🔌 API:** 5 items
- - **Total Files Modified:** 14
+ - **Total Files Modified:** 17
```

---

#### 14. docs/changelog/daily/codeChange-20260807.md [20260807_131834]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 228-256, 259-320, 381, 442, 570-575, 592-594, 596

```javascript
// Line 225:
+ #### 5. src/scripts/modules/BQO/views/bqo_home.js [20260807_131833]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 112-114, 124, 126-129, 132, 165
+ 
+ ```javascript
+ // Line 109:
+ -       category:  (item.cfamcode || item.cprocod || 'UMUM').trim(),
+ +       // Gunakan cprocod sebagai kategori (lebih deskriptif dari cfamcode kode 2-3 huruf)
+ +       // Fallback ke cfamcode jika cprocod kosong
+ +       category:  (item.cprocod || item.cfamcode || 'UMUM').trim(),
+ // Line 121:
+ -     // Bangun kategori unik dari cfamcode
+ +     // Bangun kategori unik
+ -     catMap['all']   = { id: 'all',   label: 'Semua' };
+ -     catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
+ +     catMap['all']    = { id: 'all',    label: 'Semua' };
+ +     // Tab Promo hanya muncul jika ada item yang punya diskon
+ +     const hasPromo = datas.some((item) => item.ndisc > 0);
+ +     if (hasPromo) catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
+ -       if (key && !catMap[key]) catMap[key] = { id: key, label: key };
+ +       if (key && key !== '-' && !catMap[key]) catMap[key] = { id: key, label: key };
+ // Line 162:
+ -         datasFilter = resJson.datas.filter((data) => data.price !== data.sellPrice);
  // ... (truncated)
+ ---
+ 
+ #### 2. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
// Line 378:
- #### 2. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
+ #### 3. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
// Line 439:
- #### 3. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
+ #### 4. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
// Line 567:
+ #### 4. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_131833]
+ **Fungsi:** Modul: bqo_api  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
// Line 589:
- - **✨ Features:** 4 items
- - **📖 Documentation:** 3 items
- - **🔌 API:** 3 items
+ - **✨ Features:** 5 items
+ - **📖 Documentation:** 4 items
+ - **🔌 API:** 4 items
- - **Total Files Modified:** 11
+ - **Total Files Modified:** 14
```

---

#### 15. docs/changelog/daily/codeChange-20260807.md [20260807_130318]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Tambah error handling  
**Lines:** 7, 58, 115, 167, 230-291, 352, 395-456, 469, 497, 500

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/controllers/bqo_mock.js [20260807_114121]
+ #### 1. src/scripts/modules/BQO/controllers/bqo_mock.js [20260807_114122]
// Line 55:
- #### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_114121]
+ #### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_114122]
// Line 112:
- #### 3. src/scripts/modules/BQO/views/bqo_home.js [20260807_114121]
+ #### 3. src/scripts/modules/BQO/views/bqo_home.js [20260807_114122]
// Line 164:
- #### 4. src/scripts/modules/BQO/views/bqo_payment.js [20260807_114121]
+ #### 4. src/scripts/modules/BQO/views/bqo_payment.js [20260807_114122]
// Line 227:
- #### 1. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
+ #### 1. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
+ **Fungsi:** Implementasi: codeChange-20260807  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 5-227, 230-291, 334-347, 358, 380-382, 384-385
+ 
+ ```javascript
+ // Line 2:
+ + ### ✨ Features
+ + 
+ + #### 1. src/scripts/modules/BQO/controllers/bqo_mock.js [20260807_114121]
+ + **Fungsi:** Modul: bqo_mock  
  // ... (truncated)
+ +    * add — simpan pesanan ke bqo_x.
+ +    * Payload mengikuti pola trenly bjual_x add:
+ +    *   headerInfo: info pesanan (meja, nama, telepon, tanggal, dll)
+ +    *   lineItemsInfo: detail item (cstocode, cstoname, cuom, nqjual, nhrgjua, namtjua, ndisc, nrpdisc)
+ +    *   paymentInfo: { cbnkid, namount }
+ +    */
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
// Line 466:
- #### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
+ #### 3. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
// Line 477:
- #### 3. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_114121]
- **Fungsi:** Modul: bqo_api  
- **Perubahan:** Pembaruan kode  
- 
- 
// Line 494:
- - **📖 Documentation:** 2 items
+ - **📖 Documentation:** 3 items
- - **Total Files Modified:** 10
+ - **Total Files Modified:** 11
```

---

#### 16. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 5-227, 230-291, 334-347, 358, 380-382, 384-385

```javascript
// Line 2:
+ ### ✨ Features
+ 
+ #### 1. src/scripts/modules/BQO/controllers/bqo_mock.js [20260807_114121]
+ **Fungsi:** Modul: bqo_mock  
+ **Perubahan:** Hapus debug log  
+ **Lines:** 130, 133-143, 146-147, 154-160, 164-166
+ 
+ ```javascript
+ // Line 127:
+ -       // ── getList ──────────────────────────────────────────────────────────
+ +       // ── getList — return format bstock_x agar konsisten dengan backend ───
+ -         console.log('[BQO MOCK] getList called', data);
+ +         // Map MOCK_MENU ke format bstock_x response
+ +         const mockData = MOCK_MENU.map((item) => ({
+ +           key:       item.id,
+ +           cstocode:  item.id,
+ +           cstoname:  item.name,
+ +           cstoname2: item.desc,
+ +           nhrgjua:   parseFloat(item.sellPrice),
+ +           cfamcode:  item.category,
+ +           cprocod:   item.category,
+ +           npict:     0,
+ +         }));
+ -           datas: MOCK_MENU,
  // ... (truncated)
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 40
+ 
+ ```javascript
+ // Line 37:
+ -     return this.fetching('getList', data);
+ +     return this.fetching('getlist', data);
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
// Line 355:
- #### 2. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
+ #### 3. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_114121]
// Line 377:
- - **📖 Documentation:** 1 item
- - **🔌 API:** 2 items
+ - **✨ Features:** 4 items
+ - **📖 Documentation:** 2 items
+ - **🔌 API:** 3 items
- - **Total Files Modified:** 4
- - **Main Focus:** 🔌 API
+ - **Total Files Modified:** 10
+ - **Main Focus:** Features
```

---

#### 17. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 5-47, 50, 61-66, 69, 72-78, 83-84, 86

```javascript
// Line 2:
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
+ **Fungsi:** Implementasi: codeChange-20260807  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 1-30
+ 
+ ```javascript
+ // Line 1:
+ + # Code Changes Summary
+ + 
+ + ## 7 Agustus 2026
+ + 
+ + ### 🔌 API
+ + 
+ + #### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083314]
+ + **Fungsi:** Modul: bqo_api  
+ + **Perubahan:** Hapus debug log  
+ + 
+ + ```javascript
+ + // Line 10:
+ + -     console.log('[bqo_api] useMock:', useMock, '| config:', getAppConfig());
+ + ```
+ + 
  // ... (truncated)
+ ---
+ 
- #### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083314]
+ #### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
// Line 58:
+ #### 2. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
+ **Fungsi:** Modul: bqo_api  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
- #### 1. ublic/app.cfg [20260807_083314]
+ #### 1. public/app.cfg [20260807_083315]
+ **Lines:** 8
+ 
+ ```javascript
+ // Line 5:
+ -   "xendit_show_simulate": true,
+ +   "xendit_show_simulate": false,
+ ```
- - **🔌 API:** 1 item
+ - **📖 Documentation:** 1 item
+ - **🔌 API:** 2 items
- - **Total Files Modified:** 2
+ - **Total Files Modified:** 4
```

---

#### 18. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
**Fungsi:** Implementasi: codeChange-20260807  
**Perubahan:** Pembaruan kode  
**Lines:** 1-30

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 7 Agustus 2026
+ 
+ ### 🔌 API
+ 
+ #### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083314]
+ **Fungsi:** Modul: bqo_api  
+ **Perubahan:** Hapus debug log  
+ 
+ ```javascript
+ // Line 10:
+ -     console.log('[bqo_api] useMock:', useMock, '| config:', getAppConfig());
+ ```
+ 
+ ---
+ 
+ ### ⚙️ Others
+ 
+ #### 1. ublic/app.cfg [20260807_083314]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **🔌 API:** 1 item
+ - **⚙️ Others:** 1 item
+ - **Total Files Modified:** 2
+ - **Main Focus:** 🔌 API
```

---

### 🔌 API

#### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_160440]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  
**Lines:** 15-17, 69-70, 76, 88-89, 106

```javascript
// Line 12:
- // Kontrol dari env — bisa di-set per environment tanpa rebuild bqo_api
- const MENU_USE_BRWDEF = process.env.REACT_APP_MENU_USE_BRWDEF === 'Y';
- const MENU_GETIMAGE   = process.env.REACT_APP_MENU_GETIMAGE   === 'Y';
+ // usebrwdef dikontrol via Config.USE_BRWDEF (bukan env — konsisten dengan webcsa-v2)
+ // getimage dikontrol via env REACT_APP_MENU_GETIMAGE
+ const MENU_GETIMAGE = process.env.REACT_APP_MENU_GETIMAGE === 'Y';
// Line 66:
-    * usebrwdef dan getimage dikontrol via env:
-    *   REACT_APP_MENU_USE_BRWDEF: Y/N
-    *   REACT_APP_MENU_GETIMAGE:   Y/N
+    * usebrwdef : Config.USE_BRWDEF (true/false di Config.js)
+    * getimage  : REACT_APP_MENU_GETIMAGE env (Y/N)
-       usebrwdef:  MENU_USE_BRWDEF,
+       usebrwdef:  Config.USE_BRWDEF,
// Line 85:
-    * getListBrwdef — alias dengan usebrwdef:true paksa.
-    * Dipakai jika ingin eksplisit pakai brwdef terlepas dari env.
-    */
-   static getListBrwdef(data) {
-     return this.fetchStock('getlist', {
-       offset:     0,
-       limit:      999,
-       usebrwdef:  true,
-       listfields: MENU_LISTFIELDS,
-       query: {
-         freefilter: { search: '!LDISCONT' },
-         textfilter: { search: '' },
-       },
-       getimage: MENU_GETIMAGE,
-       ...data,
-     });
-   }
- 
-   /**
-    * getActiveOrders — ambil list pesanan aktif dari bqo_x.
-    * Dipakai untuk cek meja mana yang sudah terisi (ctabid occupied).
-    * Hanya ambil field minimal: cqonum, ctabid, cstatus.
+    * add — simpan pesanan ke bqo_x.
+    * Payload: { qoHeaderInfo, lineItemsInfo, paymentInfo }
// Line 103:
-    * Payload mengikuti pola trenly bjual_x add:
-    *   headerInfo: info pesanan (meja, nama, telepon, tanggal, dll)
-    *   lineItemsInfo: detail item (cstocode, cstoname, cuom, nqjual, nhrgjua, namtjua, ndisc, nrpdisc)
-    *   paymentInfo: { cbnkid, namount }
+    * Payload: { qoHeaderInfo, lineItemsInfo, paymentInfo }
```

---

#### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_145524]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  
**Lines:** 107-124

```javascript
// Line 104:
+   /**
+    * getActiveOrders — ambil list pesanan aktif dari bqo_x.
+    * Dipakai untuk cek meja mana yang sudah terisi (ctabid occupied).
+    * Hanya ambil field minimal: cqonum, ctabid, cstatus.
+    */
+   static getActiveOrders() {
+     return this.fetching('getlist', {
+       offset:     0,
+       limit:      999,
+       usebrwdef:  false,
+       listfields: ['cqonum', 'ctabid', 'cstatus', 'cremark'],
+       query: {
+         freefilter: { search: '' },
+         textfilter: { search: '' },
+       },
+     });
+   }
+ 
```

---

#### 3. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_142211]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  
**Lines:** 15-18, 68-71, 77, 83, 89-90, 102

```javascript
// Line 12:
+ // Kontrol dari env — bisa di-set per environment tanpa rebuild bqo_api
+ const MENU_USE_BRWDEF = process.env.REACT_APP_MENU_USE_BRWDEF === 'Y';
+ const MENU_GETIMAGE   = process.env.REACT_APP_MENU_GETIMAGE   === 'Y';
+ 
// Line 65:
-    * getList — ambil katalog menu dari bstock_x dengan usebrwdef:false.
-    * Response: array of objects {cstocode, cstoname, nhrgjua, ...}
+    * getList — ambil katalog menu dari bstock_x.
+    * usebrwdef dan getimage dikontrol via env:
+    *   REACT_APP_MENU_USE_BRWDEF: Y/N
+    *   REACT_APP_MENU_GETIMAGE:   Y/N
-       usebrwdef:  true,
+       usebrwdef:  MENU_USE_BRWDEF,
-       getimage: true,
+       getimage: MENU_GETIMAGE,
-    * getListBrwdef — ambil katalog menu dengan usebrwdef:true.
-    * Response: { columns:[{title,...}], data:[[...]] } — format array of arrays
-    * Dipakai sebagai primary fetch di bqo_home.js, fallback ke getList jika gagal.
+    * getListBrwdef — alias dengan usebrwdef:true paksa.
+    * Dipakai jika ingin eksplisit pakai brwdef terlepas dari env.
// Line 99:
-       getimage: false,
+       getimage: MENU_GETIMAGE,
```

---

#### 4. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_140514]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  
**Lines:** 64-65, 84-85

```javascript
// Line 61:
-    * getList — ambil katalog menu dari bstock_x.
-    * Coba brwdef dulu, fallback ke listfields jika brwdef tidak tersedia.
+    * getList — ambil katalog menu dari bstock_x dengan usebrwdef:false.
+    * Response: array of objects {cstocode, cstoname, nhrgjua, ...}
// Line 81:
-    * Response: { result, columns:[...], data:[[...]] } — format array
-    * Dipakai di bqo_home.js sebagai fallback ke tampilan kolom dinamis.
+    * Response: { columns:[{title,...}], data:[[...]] } — format array of arrays
+    * Dipakai sebagai primary fetch di bqo_home.js, fallback ke getList jika gagal.
```

---

#### 5. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_135032]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  
**Lines:** 9, 11-12, 65, 70, 82-101

```javascript
// Line 6:
- // Field yang diambil dari bstock_x — mengikuti pola trenly (semua field BSTOCKF)
+ // Field minimal yang diambil dari bstock_x untuk katalog menu
-   'citemtype','cstocode','cstoname','ldiscont','cprocode','cfamcode','cdefwhseid',
-   'cmatcode','lbckflsh','csource','ccostmetho','ltaxable','coricode','cgencode',
-   'ccolor','csatuan','csortcode','pstcost','nqround','nmargin','nhrgjua','ndisc',
-   'pstprice','cdscsch','nqrj','nqrb','nqbeli','nqjual','nqin','nqout','nqrcv',
-   'nqsnd','nqpro','nqused','nqakhir','ncrj','ncrb','ncbeli','ncjual','ncin',
-   'ncout','ncrcv','ncsnd','ncpro','ncused','ncakhir','cnotes1','cnotes2','cnotes3',
-   'cnegstk','conegstk','nqmin','nqmax','creqbase','nleadtime','nordtime','nsafety',
-   'lavgsys','davgdate1','davgdate2','nqoutavg','nqinavg','nqalloc','nqorder','npict',
-   'dldatbel','nhrgbel','nlhrgbel','nlhrgbelbr','nldscbelit','nldscbelto','nldscbelal',
-   'dldatpro','nlhrgpro','nqtybrk1','nhrgbrk1','nqtybrk2','nhrgbrk2','nqtybrk3',
-   'nhrgbrk3','nqtybrk4','nhrgbrk4','nqtybrk5','nhrgbrk5',
+   'cstocode', 'cstoname', 'cstoname2', 'nhrgjua', 'ndisc',
+   'cfamcode', 'cprocod', 'csatuan', 'cnotes1',
// Line 62:
-    * Payload sama persis dengan trenly, kecuali getimage=false
-    * (server belum dikonfigurasi ShowImageAPI di apicsa.cfg)
+    * Coba brwdef dulu, fallback ke listfields jika brwdef tidak tersedia.
-       limit:      25,
+       limit:      999,
// Line 79:
+   /**
+    * getListBrwdef — ambil katalog menu dengan usebrwdef:true.
+    * Response: { result, columns:[...], data:[[...]] } — format array
+    * Dipakai di bqo_home.js sebagai fallback ke tampilan kolom dinamis.
+    */
+   static getListBrwdef(data) {
+     return this.fetchStock('getlist', {
+       offset:     0,
+       limit:      999,
+       usebrwdef:  true,
+       listfields: MENU_LISTFIELDS,
+       query: {
+         freefilter: { search: '!LDISCONT' },
+         textfilter: { search: '' },
+       },
+       getimage: false,
+       ...data,
+     });
+   }
+ 
```

---

#### 6. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_133241]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  
**Lines:** 9, 11-21, 74-75, 80, 84-85, 87

```javascript
// Line 6:
- // Field yang diambil dari bstock_x untuk katalog menu — mengikuti pola trenly
+ // Field yang diambil dari bstock_x — mengikuti pola trenly (semua field BSTOCKF)
-   'cstocode', 'cstoname', 'cstoname2', 'nhrgjua', 'ndisc',
-   'cfamcode', 'cprocod', 'csatuan', 'npict',
+   'citemtype','cstocode','cstoname','ldiscont','cprocode','cfamcode','cdefwhseid',
+   'cmatcode','lbckflsh','csource','ccostmetho','ltaxable','coricode','cgencode',
+   'ccolor','csatuan','csortcode','pstcost','nqround','nmargin','nhrgjua','ndisc',
+   'pstprice','cdscsch','nqrj','nqrb','nqbeli','nqjual','nqin','nqout','nqrcv',
+   'nqsnd','nqpro','nqused','nqakhir','ncrj','ncrb','ncbeli','ncjual','ncin',
+   'ncout','ncrcv','ncsnd','ncpro','ncused','ncakhir','cnotes1','cnotes2','cnotes3',
+   'cnegstk','conegstk','nqmin','nqmax','creqbase','nleadtime','nordtime','nsafety',
+   'lavgsys','davgdate1','davgdate2','nqoutavg','nqinavg','nqalloc','nqorder','npict',
+   'dldatbel','nhrgbel','nlhrgbel','nlhrgbelbr','nldscbelit','nldscbelto','nldscbelal',
+   'dldatpro','nlhrgpro','nqtybrk1','nhrgbrk1','nqtybrk2','nhrgbrk2','nqtybrk3',
+   'nhrgbrk3','nqtybrk4','nhrgbrk4','nqtybrk5','nhrgbrk5',
// Line 71:
-    * Mengikuti pola trenly useCashierCatalog:
-    *   - listfields: field minimal untuk tampil di menu
-    *   - freefilter: '!LDISCONT' → hanya item yang aktif dijual (bukan discontinue)
-    * Response: { result, data: [{cstocode, cstoname, nhrgjua, csatuan, ndisc, ...}] }
+    * Payload sama persis dengan trenly, kecuali getimage=false
+    * (server belum dikonfigurasi ShowImageAPI di apicsa.cfg)
-       limit:      999,
+       limit:      25,
-         freefilter:  { search: '!LDISCONT' },
-         textfilter:  { search: '' },
+         freefilter: { search: '!LDISCONT' },
+         textfilter: { search: '' },
-       getimage: true, // getimage butuh ShowImageAPI di apicsa.cfg
+       getimage: true,
```

---

#### 7. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_131834]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  
**Lines:** 74, 80

```javascript
// Line 71:
-       usebrwdef:  false,
+       usebrwdef:  true,
-       getimage: false, // getimage butuh ShowImageAPI di apicsa.cfg
+       getimage: true, // getimage butuh ShowImageAPI di apicsa.cfg
```

---

#### 8. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_114122]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Tambah error handling; Tambah HTTP request  
**Lines:** 9-14, 16-21, 23-25, 38-46, 48-60, 63-69, 71-82, 85-91

```javascript
// Line 6:
+ // Field yang diambil dari bstock_x untuk katalog menu — mengikuti pola trenly
+ const MENU_LISTFIELDS = [
+   'cstocode', 'cstoname', 'cstoname2', 'nhrgjua', 'ndisc',
+   'cfamcode', 'cprocod', 'csatuan', 'npict',
+ ];
+ 
+   // ── Mock mode check ──────────────────────────────────────────────────────
+   static _useMock() {
+     return getAppConfig().use_mock_bqo === true;
+   }
+ 
+   // ── fetch ke BQO_X (transaksi pesanan) ───────────────────────────────────
-     // ── MOCK MODE — dibaca dari app.cfg (runtime, tanpa rebuild) ────────────
-     const useMock = getAppConfig().use_mock_bqo === true;
-     if (useMock) {
-       try {
-         return await bqo_mock.handle(action, data);
-       } catch (error) {
-         return error;
-       }
+     if (this._useMock()) {
+       try { return await bqo_mock.handle(action, data); }
+       catch (error) { return error; }
-     // ── NORMAL MODE ─────────────────────────────────────────────────────────
  // ... (truncated)
+    * Mengikuti pola trenly useCashierCatalog:
+    *   - listfields: field minimal untuk tampil di menu
+    *   - freefilter: '!LDISCONT' → hanya item yang aktif dijual (bukan discontinue)
+    * Response: { result, data: [{cstocode, cstoname, nhrgjua, csatuan, ndisc, ...}] }
+    */
-     return this.fetching('getlist', data);
+     return this.fetchStock('getlist', {
+       offset:     0,
+       limit:      999,
+       usebrwdef:  false,
+       listfields: MENU_LISTFIELDS,
+       query: {
+         freefilter:  { search: '!LDISCONT' },
+         textfilter:  { search: '' },
+       },
+       getimage: false, // getimage butuh ShowImageAPI di apicsa.cfg
+       ...data,
+     });
+   /**
+    * add — simpan pesanan ke bqo_x.
+    * Payload mengikuti pola trenly bjual_x add:
+    *   headerInfo: info pesanan (meja, nama, telepon, tanggal, dll)
+    *   lineItemsInfo: detail item (cstocode, cstoname, cuom, nqjual, nhrgjua, namtjua, ndisc, nrpdisc)
+    *   paymentInfo: { cbnkid, namount }
+    */
```

---

#### 9. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  
**Lines:** 40

```javascript
// Line 37:
-     return this.fetching('getList', data);
+     return this.fetching('getlist', data);
```

---

#### 10. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Hapus debug log  

```javascript
// Line 10:
-     console.log('[bqo_api] useMock:', useMock, '| config:', getAppConfig());
```

---

### ⚙️ Config

#### 1. env/qorestoweb/.env [20260807_162431]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 40

```javascript
// Line 37:
- REACT_APP_BQO_DEFAULT_WHSE=GDG-01
+ REACT_APP_BQO_DEFAULT_WHSE=CINTA01
```

---

#### 2. env/qorestoweb/.env [20260807_160440]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 24-30, 39-41, 43

```javascript
// Line 21:
+ # ── Pajak / PPN ──────────────────────────────────────────────────────────────
+ # BASE_TAX_PERCENTAGE : rate dasar (12% sesuai UU HPP)
+ # EFFECTIVE_TAX_RATE  : DPP Nilai Lain per PMK 131/2024 — format pecahan "11/12"
+ # Pajak efektif ke pelanggan = BASE_TAX_PERCENTAGE * (11/12) = 11%
+ REACT_APP_TAX_BASE=12
+ REACT_APP_TAX_EFFECTIVE_RATE=11/12
+ 
// Line 36:
+ # Warehouse ID default untuk transaksi BQO (field cwhseid wajib di backend)
+ REACT_APP_BQO_DEFAULT_WHSE=GDG-01
+ 
- # REACT_APP_MENU_USE_BRWDEF:
- #   Y = usebrwdef true  → kolom dinamis dari brwdef server (data berformat array)
- #   N = usebrwdef false → object statis dengan cfamcode sebagai kategori (RECOMMENDED)
- REACT_APP_MENU_USE_BRWDEF=Y
+ # REACT_APP_MENU_USE_BRWDEF sudah tidak dipakai — dikontrol via Config.USE_BRWDEF di Config.js
```

---

#### 3. env/qorestoweb/.env [20260807_152307]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 28-31

```javascript
// Line 25:
+ # ── Customer Default BQO ─────────────────────────────────────────────────────
+ # Customer ID untuk transaksi walk-in / self-order (field ccusid wajib di backend)
+ REACT_APP_BQO_DEFAULT_CUSTOMER=UMUM
+ 
```

---

#### 4. env/qorestoweb/.env [20260807_145524]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 24-27

```javascript
// Line 21:
+ # ── Nomor Meja ───────────────────────────────────────────────────────────────
+ # Jumlah meja yang tersedia di restoran (untuk dropdown pilih meja)
+ REACT_APP_TABLE_COUNT=20
+ 
```

---

#### 5. env/qorestoweb/.env [20260807_142211]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 23-33

```javascript
// Line 20:
+ 
+ # ── Katalog Menu (bstock_x) ──────────────────────────────────────────────────
+ # REACT_APP_MENU_USE_BRWDEF:
+ #   Y = usebrwdef true  → kolom dinamis dari brwdef server (data berformat array)
+ #   N = usebrwdef false → object statis dengan cfamcode sebagai kategori (RECOMMENDED)
+ REACT_APP_MENU_USE_BRWDEF=Y
+ 
+ # REACT_APP_MENU_GETIMAGE:
+ #   Y = aktifkan getimage (butuh ShowImageAPI dikonfigurasi di apicsa.cfg server)
+ #   N = nonaktif, gunakan placeholder
+ REACT_APP_MENU_GETIMAGE=Y
```

---

#### 6. nv/qorestoweb/.env [20260807_162847]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  

---

### ⚙️ Others

#### 1. src/scripts/Config.js [20260807_160440]
**Fungsi:** Konfigurasi aplikasi (base URL, konstanta)  
**Perubahan:** Pembaruan kode  

```javascript
// Line 13:
- 
-   // Pajak/PPN — mengikuti pola webcsa-v2 (trenly):
-   //   BASE_TAX_PERCENTAGE: rate dasar (12% sesuai UU HPP)
-   //   EFFECTIVE_TAX_RATE : DPP Nilai Lain per PMK 131/2024 (11/12)
-   //   Pajak efektif yang dibebankan ke pelanggan = 12 * (11/12) = 11%
-   BASE_TAX_PERCENTAGE: 12,
-   EFFECTIVE_TAX_RATE: 11 / 12,   // PMK 131 Tahun 2024
```

---

#### 2. src/scripts/Config.js [20260807_145524]
**Fungsi:** Konfigurasi aplikasi (base URL, konstanta)  
**Perubahan:** Pembaruan kode  
**Lines:** 16-22

```javascript
// Line 13:
+ 
+   // Pajak/PPN — mengikuti pola webcsa-v2 (trenly):
+   //   BASE_TAX_PERCENTAGE: rate dasar (12% sesuai UU HPP)
+   //   EFFECTIVE_TAX_RATE : DPP Nilai Lain per PMK 131/2024 (11/12)
+   //   Pajak efektif yang dibebankan ke pelanggan = 12 * (11/12) = 11%
+   BASE_TAX_PERCENTAGE: 12,
+   EFFECTIVE_TAX_RATE: 11 / 12,   // PMK 131 Tahun 2024
```

---

#### 3. public/app.cfg [20260807_083315]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 8

```javascript
// Line 5:
-   "xendit_show_simulate": true,
+   "xendit_show_simulate": false,
```

---

## 📊 **Summary**
- **✨ Features:** 21 items
- **📖 Documentation:** 18 items
- **🔌 API:** 10 items
- **⚙️ Config:** 6 items
- **⚙️ Others:** 3 items
- **Total Files Modified:** 58
- **Main Focus:** Features
