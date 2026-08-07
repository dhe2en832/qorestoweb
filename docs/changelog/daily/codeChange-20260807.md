# Code Changes Summary

## 7 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_home.js [20260807_133241]
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

#### 2. src/scripts/modules/BQO/views/bqo_home.js [20260807_131834]
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

#### 3. src/scripts/modules/BQO/controllers/bqo_mock.js [20260807_114122]
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

#### 4. src/scripts/modules/BQO/views/bqo_checkout.js [20260807_114122]
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

#### 5. src/scripts/modules/BQO/views/bqo_home.js [20260807_114122]
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

#### 6. src/scripts/modules/BQO/views/bqo_payment.js [20260807_114122]
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

#### 7. src/scripts/modules/BQO/views/bqo_home.js [20260807_135030]
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

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260807.md [20260807_133241]
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

#### 2. docs/changelog/daily/codeChange-20260807.md [20260807_131834]
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

#### 3. docs/changelog/daily/codeChange-20260807.md [20260807_130318]
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

#### 4. docs/changelog/daily/codeChange-20260807.md [20260807_114122]
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

#### 5. docs/changelog/daily/codeChange-20260807.md [20260807_084349]
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

#### 6. docs/changelog/daily/codeChange-20260807.md [20260807_083315]
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

#### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_133241]
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

#### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_131834]
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

#### 3. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_114122]
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

#### 4. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_084349]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  
**Lines:** 40

```javascript
// Line 37:
-     return this.fetching('getList', data);
+     return this.fetching('getlist', data);
```

---

#### 5. src/scripts/modules/BQO/controllers/bqo_api.js [20260807_083315]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Hapus debug log  

```javascript
// Line 10:
-     console.log('[bqo_api] useMock:', useMock, '| config:', getAppConfig());
```

---

#### 6. rc/scripts/modules/BQO/controllers/bqo_api.js [20260807_135030]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  

---

### ⚙️ Others

#### 1. public/app.cfg [20260807_083315]
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
- **✨ Features:** 7 items
- **📖 Documentation:** 6 items
- **🔌 API:** 6 items
- **⚙️ Others:** 1 item
- **Total Files Modified:** 20
- **Main Focus:** Features
