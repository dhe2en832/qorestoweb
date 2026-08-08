# Code Changes Summary

## 8 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_132610]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: AlertDialog  
**Lines:** 32, 428-429, 450-456

```javascript
// Line 29:
+ import AlertDialog from '../../../components/AlertDialog';
// Line 425:
+         // Refresh daftar meja setelah pesanan berhasil — meja yang baru dipesan langsung terisi
+         fetchOccupiedTables();
// Line 447:
+     // Print guard — wajib cetak dulu sebelum bisa pesanan baru (pola trenly)
+     if (printCount === 0) {
+       AlertDialog('warning', 'Belum Cetak Tanda Pesanan',
+         'Silakan cetak tanda pesanan terlebih dahulu sebelum membuat pesanan baru.',
+         () => handlePrint());
+       return;
+     }
```

---

#### 2. src/scripts/modules/BQO/views/bqo_home.js [20260808_132610]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Pembaruan kode  
**Lines:** 583

```javascript
// Line 580:
-                 Maaf, Menu Ini Belum Terdaftar.
+                 Maaf, Menu Ini Belum Tersedia.
```

---

#### 3. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_131204]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Tambah fungsi: isSessionExpired; Akses localStorage; Tambah state management; Tambah error handling; Tambah navigasi halaman  
**Lines:** 36-42, 139-145, 429-436

```javascript
// Line 33:
+ /** Deteksi apakah error dari backend adalah session expired */
+ const isSessionExpired = (msg) =>
+   typeof msg === 'string' &&
+   (msg.includes('Session Id telah expired') ||
+    msg.includes('Session Id tidak valid') ||
+    msg.includes('expired'));
+ 
// Line 136:
-   // Info Order
-   const [info, setInfo] = useState({
-     seatNumber: '',
-     orderByName: '',
-     phoneNumber: '',
+   // Info Order — restore dari localStorage jika ada (setelah re-login dari session expired)
+   const [info, setInfo] = useState(() => {
+     const saved = window.localStorage.getItem('QoOrderInfo');
+     if (saved) {
+       try { return JSON.parse(saved); } catch (_) {}
+     }
+     return { seatNumber: '', orderByName: '', phoneNumber: '' };
// Line 426:
+         // Deteksi session expired — simpan state lalu redirect ke login
+         if (isSessionExpired(errMsg)) {
+           window.localStorage.setItem('QoOrderInfo', JSON.stringify(info));
+           window.localStorage.setItem('QoReturnPath', '/checkout');
+           ToastBar('warning', 'Session habis. Silakan login kembali — pesanan Anda tersimpan.', 4000);
+           setTimeout(() => navigate('/login', { state: { from: { pathname: '/checkout' } } }), 1500);
+           return;
+         }
```

---

#### 4. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_114717]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Tambah fungsi: BQO_DEFAULT_CPCODE  
**Lines:** 52, 363, 389-392

```javascript
// Line 49:
+ const BQO_DEFAULT_CPCODE   = (process.env.REACT_APP_BQO_DEFAULT_CPCODE   || 'STD').trim();
// Line 360:
-           ccpcode:  '',
+           ccpcode:  BQO_DEFAULT_CPCODE,
// Line 386:
-           creason:   '',
-           cadjdesc:  '',
-           creason2:  ' ',
-           cadjdesc2: ' ',
+           creason:   '-',
+           cadjdesc:  '-',
+           creason2:  '-',
+           cadjdesc2: '-',
```

---

#### 5. src/scripts/modules/BQO/views/bqo_payment.js [20260808_114717]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Tambah fungsi: BQO_DEFAULT_CPCODE  
**Lines:** 44, 165, 191-194

```javascript
// Line 41:
+ const BQO_DEFAULT_CPCODE   = (process.env.REACT_APP_BQO_DEFAULT_CPCODE   || 'STD').trim();
// Line 162:
-         ccpcode:  '',
+         ccpcode:  BQO_DEFAULT_CPCODE,
// Line 188:
-         creason:   '',
-         cadjdesc:  '',
-         creason2:  ' ',
-         cadjdesc2: ' ',
+         creason:   '-',
+         cadjdesc:  '-',
+         creason2:  '-',
+         cadjdesc2: '-',
```

---

#### 6. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_103848]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  
**Lines:** 390-391

```javascript
// Line 387:
+           creason2:  ' ',
+           cadjdesc2: ' ',
```

---

#### 7. src/scripts/modules/BQO/views/bqo_payment.js [20260808_103848]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Pembaruan kode  
**Lines:** 192-193

```javascript
// Line 189:
+         creason2:  ' ',
+         cadjdesc2: ' ',
```

---

#### 8. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_103531]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  

```javascript
// Line 387:
-           creason2:  '',
-           cadjdesc2: '',
```

---

#### 9. src/scripts/modules/BQO/views/bqo_payment.js [20260808_103531]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Pembaruan kode  

```javascript
// Line 189:
-         creason2:  '',
-         cadjdesc2: '',
```

---

#### 10. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_103051]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  
**Lines:** 380-385

```javascript
// Line 377:
-           ccusid:    BQO_DEFAULT_CUSTOMER,    // langsung di header, bukan nested
+           customer: {
+             ccusid:   BQO_DEFAULT_CUSTOMER,
+             cinitial: '',
+             cnotelp:  info.phoneNumber || '',
+             cemail:   '',
+           },
```

---

#### 11. src/scripts/modules/BQO/views/bqo_payment.js [20260808_103051]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Pembaruan kode  
**Lines:** 182-187

```javascript
// Line 179:
-         ccusid:    BQO_DEFAULT_CUSTOMER,
+         customer: {
+           ccusid:   BQO_DEFAULT_CUSTOMER,
+           cinitial: '',
+           cnotelp:  orderInfo.phoneNumber || '',
+           cemail:   '',
+         },
```

---

#### 12. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_101932]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  
**Lines:** 354, 359, 362-363, 376-398

```javascript
// Line 351:
-           crefnote: 'ONLINE',
+           crefnote: '',
-           ncqo:     '',
+           ncqo:     0,
+           ccpcode:  '',
+           csalesid: BQO_DEFAULT_SALES,
-           csalesid: '',
-           nkomisi:  '',
// Line 373:
-           cqonum:     '',
-           ctabid:     info.seatNumber  || '',
-           cwhseid:    BQO_DEFAULT_WHSE,
-           cremark:    info.orderByName || '',
-           customer: {
-             ccusid:   BQO_DEFAULT_CUSTOMER,
-             cinitial: '',
-             cnotelp:  info.phoneNumber || '',
-             cemail:   '',
-           },
-           cshiptoadr: '',
-           nexchrate:  1,
-           csalesid:   BQO_DEFAULT_SALES,
-           lmulsales:  false,
-           npctdisc:   0,
  // ... (truncated)
-           cqofoot2:   '',
-           cqofoot3:   '',
+           cqonum:    '',
+           ctabid:    info.seatNumber  || '',
+           cwhseid:   BQO_DEFAULT_WHSE,
+           cremark:   info.orderByName || '',
+           ccusid:    BQO_DEFAULT_CUSTOMER,    // langsung di header, bukan nested
+           csalesid:  BQO_DEFAULT_SALES,
+           lmulsales: false,
+           creason:   '',
+           cadjdesc:  '',
+           creason2:  '',
+           cadjdesc2: '',
+           cpaytype:  '',
+           cbnkid:    CASH_BANK_CODE,
+           ccrdnum:   '',
+           nkupon:    0,
+           npctdisc:  0,
+           npctppn:   TAX_PERCENT,
+           namount:   subtotal,
+           ndp:       total,
+           nsaleschg: 0,
+           cqofoot1:  '',
+           cqofoot2:  '',
+           cqofoot3:  '',
```

---

#### 13. src/scripts/modules/BQO/views/bqo_payment.js [20260808_101932]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Pembaruan kode  
**Lines:** 156, 161, 164-165, 178-189, 191-200

```javascript
// Line 153:
-         crefnote: 'ONLINE',
+         crefnote: '',
-         ncqo:     '',
+         ncqo:     0,
+         ccpcode:  '',
+         csalesid: BQO_DEFAULT_SALES,
-         csalesid: '',
-         nkomisi:  '',
// Line 175:
-         cqonum:     '',
-         ctabid:     orderInfo.seatNumber  || '',
-         cwhseid:    BQO_DEFAULT_WHSE,
-         cremark:    orderInfo.orderByName || '',
-         customer: {
-           ccusid:   BQO_DEFAULT_CUSTOMER,
-           cinitial: '',
-           cnotelp:  orderInfo.phoneNumber || '',
-           cemail:   '',
-         },
-         cshiptoadr: '',
-         nexchrate:  1,
-         csalesid:   BQO_DEFAULT_SALES,
-         lmulsales:  false,
-         npctdisc:   0,
  // ... (truncated)
+         cwhseid:   BQO_DEFAULT_WHSE,
+         cremark:   orderInfo.orderByName || '',
+         ccusid:    BQO_DEFAULT_CUSTOMER,
+         csalesid:  BQO_DEFAULT_SALES,
+         lmulsales: false,
+         creason:   '',
+         cadjdesc:  '',
+         creason2:  '',
+         cadjdesc2: '',
+         cpaytype:  '',
-         nsaleschg:  0,
-         ccrdnum:    '',
-         cqofoot1:   '',
-         cqofoot2:   '',
-         cqofoot3:   '',
+         ccrdnum:   '',
+         nkupon:    0,
+         npctdisc:  0,
+         npctppn:   TAX_PERCENT,
+         namount:   subtotal,
+         ndp:       total,
+         nsaleschg: 0,
+         cqofoot1:  '',
+         cqofoot2:  '',
+         cqofoot3:  '',
```

---

#### 14. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_092914]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Tambah fungsi: BQO_DEFAULT_SALES  
**Lines:** 51, 362, 364-365, 376-381, 386-396, 402-403

```javascript
// Line 48:
+ const BQO_DEFAULT_SALES    = (process.env.REACT_APP_BQO_DEFAULT_SALES    || 'ONLINE').trim();
// Line 359:
-           nhrgjua:  String(nhrgjua),
+           nhrgjua,
-           ndisc:    discPct > 0 ? String(discPct) : '',
-           nrpdisc:  String(nrpdisc),
+           ndisc:    discPct > 0 ? discPct : 0,
+           nrpdisc,
// Line 373:
-           cqonum:   '',                            // kosong, auto-generate dari backend
-           ctabid:   info.seatNumber  || '',        // Nomor Meja
-           cwhseid:  BQO_DEFAULT_WHSE,              // dari env REACT_APP_BQO_DEFAULT_WHSE
-           cremark:  info.orderByName || '',        // Nama pemesan
-           customer: {                              // nested object sesuai spec
-             ccusid:   BQO_DEFAULT_CUSTOMER,        // dari env REACT_APP_BQO_DEFAULT_CUSTOMER
+           cqonum:     '',
+           ctabid:     info.seatNumber  || '',
+           cwhseid:    BQO_DEFAULT_WHSE,
+           cremark:    info.orderByName || '',
+           customer: {
+             ccusid:   BQO_DEFAULT_CUSTOMER,
-           cshiptoadr: '',                          // alamat kirim (kosong untuk dine-in)
-           nexchrate:  '1',
-           csalesid:   'ONLINE',                    // sales person
-           lmulsales:  'false',
-           npctdisc:   '0',                         // discount header
-           npctppn:    String(TAX_PERCENT),         // pajak
-           namount:    String(subtotal),            // total sebelum pajak
-           ndp:        String(total),               // pembayaran diterima (DP)
-           cpaytype:   '',                          // blank = tunai
-           cbnkid:     CASH_BANK_CODE,              // dari env REACT_APP_CASH_BANK_CODE
-           nsaleschg:  '0',
+           cshiptoadr: '',
+           nexchrate:  1,
+           csalesid:   BQO_DEFAULT_SALES,
+           lmulsales:  false,
+           npctdisc:   0,
+           npctppn:    TAX_PERCENT,
+           namount:    subtotal,
+           ndp:        total,
+           cpaytype:   '',
+           cbnkid:     CASH_BANK_CODE,
+           nsaleschg:  0,
-             crefnum: externalId.substring(0, 10), // ref order (max 10 char)
-             creftrn: externalId.substring(0, 10), // ref transaksi (max 10 char)
+             crefnum: externalId.substring(0, 10),
+             creftrn: externalId.substring(0, 10),
```

---

#### 15. src/scripts/modules/BQO/views/bqo_payment.js [20260808_092914]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Tambah fungsi: BQO_DEFAULT_SALES  
**Lines:** 43, 164, 166-167, 178-181, 189-195, 198

```javascript
// Line 40:
+ const BQO_DEFAULT_SALES    = (process.env.REACT_APP_BQO_DEFAULT_SALES    || 'ONLINE').trim();
// Line 161:
-         nhrgjua:  String(nhrgjua),
+         nhrgjua,
-         ndisc:    discPct > 0 ? String(discPct) : '',
-         nrpdisc:  String(nrpdisc),
+         ndisc:    discPct > 0 ? discPct : 0,
+         nrpdisc,
// Line 175:
-         cqonum:   '',
-         ctabid:   orderInfo.seatNumber  || '',
-         cwhseid:  BQO_DEFAULT_WHSE,
-         cremark:  orderInfo.orderByName || '',
+         cqonum:     '',
+         ctabid:     orderInfo.seatNumber  || '',
+         cwhseid:    BQO_DEFAULT_WHSE,
+         cremark:    orderInfo.orderByName || '',
// Line 186:
-         nexchrate:  '1',
-         csalesid:   'ONLINE',
-         lmulsales:  'false',
-         npctdisc:   '0',
-         npctppn:    String(TAX_PERCENT),
-         namount:    String(subtotal),
-         ndp:        String(total),
+         nexchrate:  1,
+         csalesid:   BQO_DEFAULT_SALES,
+         lmulsales:  false,
+         npctdisc:   0,
+         npctppn:    TAX_PERCENT,
+         namount:    subtotal,
+         ndp:        total,
-         nsaleschg:  '0',
+         nsaleschg:  0,
```

---

#### 16. rc/scripts/modules/BQO/reports/BQOOrderSlip.jsx [20260808_140214]
**Fungsi:** Modul: BQOOrderSlip  
**Perubahan:** Pembaruan kode  

---

#### 17. src/scripts/modules/BQO/reports/BQOReceipt.jsx [20260808_140214]
**Fungsi:** Modul: BQOReceipt  
**Perubahan:** Pembaruan kode  
**Lines:** 15, 29, 60-65

```javascript
// Line 12:
+  *   datas.cqonum          - string (nomor QO dari backend, misal "2608000022")
// Line 26:
+     cqonum = '',
// Line 57:
+       {cqonum && (
+         <div style={styles.row}>
+           <span>No. Order</span>
+           <span>{cqonum}</span>
+         </div>
+       )}
```

---

#### 18. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_140214]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Ubah render/return JSX  
**Lines:** 166-171, 176, 192-194, 432-434, 880

```javascript
// Line 163:
-         // Status pesanan yang dianggap "masih aktif" (meja masih terisi)
-         // Sesuaikan dengan status yang dipakai di backend BQO
-         const ACTIVE_STATUSES = ['O', 'P', 'open', 'pending', 'OPEN', 'PENDING'];
+         // Status aktif dari data aktual backend BQO:
+         //   C = Created (baru dibuat, belum dibayar)
+         //   O = Open
+         //   P = Pending
+         // Status yang dianggap SELESAI (meja bebas): kosong/null atau selain C/O/P
+         const ACTIVE_STATUSES = new Set(['C', 'O', 'P']);
-               return ACTIVE_STATUSES.some((s) => s.toUpperCase() === status) || status === '';
+               return ACTIVE_STATUSES.has(status);
// Line 189:
+     // Refresh saat user kembali ke tab/window ini
+     window.addEventListener('focus', fetchOccupiedTables);
+     return () => window.removeEventListener('focus', fetchOccupiedTables);
// Line 429:
-         const bon = result.onsuccess?.cordernum || result.onsuccess?.csonum || '';
-         setKasirResult({ nomorBon: bon, cartItems, subtotal, taxAmount, total });
+         const bon    = result.onsuccess?.cordernum || result.onsuccess?.csonum || '';
+         const cqonum = result.onsuccess?.cqonum    || bon;
+         setKasirResult({ nomorBon: bon, cqonum, cartItems, subtotal, taxAmount, total });
// Line 877:
-               nomorPesanan: kasirResult.nomorBon,
+               nomorPesanan: kasirResult.cqonum || kasirResult.nomorBon,
```

---

#### 19. src/scripts/modules/BQO/views/bqo_payment.js [20260808_140214]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Tambah state management  
**Lines:** 90, 231, 255, 967

```javascript
// Line 87:
+   const [cqonum,              setCqonum]              = useState('');
// Line 228:
+         setCqonum(result.onsuccess?.cqonum || bon);
// Line 252:
+             setCqonum(retryResult.onsuccess?.cqonum || bon);
// Line 964:
+             cqonum:   cqonum   || nomorBon || externalId,
```

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260808.md [20260808_132610]
**Fungsi:** Implementasi: codeChange-20260808  
**Perubahan:** Akses localStorage; Tambah state management; Tambah error handling; Tambah navigasi halaman  
**Lines:** 7-47, 71, 95, 108, 121, 133, 145, 163, 181, 242, 303, 361, 406, 408-415, 418-420, 427-488, 549, 610, 671, 732, 793, 856, 858-874, 878, 935-936, 939

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_114717]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_131204]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Tambah fungsi: isSessionExpired; Akses localStorage; Tambah state management; Tambah error handling; Tambah navigasi halaman  
+ **Lines:** 36-42, 139-145, 429-436
+ 
+ ```javascript
+ // Line 33:
+ + /** Deteksi apakah error dari backend adalah session expired */
+ + const isSessionExpired = (msg) =>
+ +   typeof msg === 'string' &&
+ +   (msg.includes('Session Id telah expired') ||
+ +    msg.includes('Session Id tidak valid') ||
+ +    msg.includes('expired'));
+ + 
+ // Line 136:
+ -   // Info Order
+ -   const [info, setInfo] = useState({
+ -     seatNumber: '',
+ -     orderByName: '',
+ -     phoneNumber: '',
+ +   // Info Order — restore dari localStorage jika ada (setelah re-login dari session expired)
+ +   const [info, setInfo] = useState(() => {
+ +     const saved = window.localStorage.getItem('QoOrderInfo');
  // ... (truncated)
+ **Lines:** 61-66, 121-124
+ 
+ ```javascript
+ // Line 58:
+ +         // Saat login fresh (bukan re-login dari session expired), clear BQO data
+ +         const isRelogin = window.localStorage.getItem('QoReturnPath') !== null;
+ +         if (!isRelogin) {
+ +           window.localStorage.removeItem('QoCart');
+ +           window.localStorage.removeItem('QoOrderInfo');
+ +         }
+ // Line 118:
+ +     // Bersihkan data BQO saat logout — pelanggan berikutnya mulai fresh
+ +     window.localStorage.removeItem('QoCart');
+ +     window.localStorage.removeItem('QoOrderInfo');
+ +     window.localStorage.removeItem('QoReturnPath');
+ ```
- #### 2. src/scripts/modules/LOGIN/index.js [20260808_131202]
+ #### 2. src/scripts/modules/LOGIN/index.js [20260808_131204]
// Line 932:
- - **✨ Features:** 13 items
- - **📖 Documentation:** 6 items
+ - **✨ Features:** 15 items
+ - **📖 Documentation:** 7 items
- - **Total Files Modified:** 23
+ - **Total Files Modified:** 26
```

---

#### 2. docs/changelog/daily/codeChange-20260808.md [20260808_131204]
**Fungsi:** Implementasi: codeChange-20260808  
**Perubahan:** Akses localStorage; Tambah state management; Tambah error handling; Tambah navigasi halaman  
**Lines:** 7-55, 68, 81, 93, 105, 123, 141, 202, 263, 321, 366, 368-369, 372-401, 406-411, 414-464, 469, 530, 591, 652, 713, 774-805, 808-822, 839-841, 843

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_103848]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_114717]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Tambah fungsi: BQO_DEFAULT_CPCODE  
+ **Lines:** 52, 363, 389-392
+ 
+ ```javascript
+ // Line 49:
+ + const BQO_DEFAULT_CPCODE   = (process.env.REACT_APP_BQO_DEFAULT_CPCODE   || 'STD').trim();
+ // Line 360:
+ -           ccpcode:  '',
+ +           ccpcode:  BQO_DEFAULT_CPCODE,
+ // Line 386:
+ -           creason:   '',
+ -           cadjdesc:  '',
+ -           creason2:  ' ',
+ -           cadjdesc2: ' ',
+ +           creason:   '-',
+ +           cadjdesc:  '-',
+ +           creason2:  '-',
+ +           cadjdesc2: '-',
+ ```
+ 
+ ---
  // ... (truncated)
+ **Lines:** 45-47
+ 
+ ```javascript
+ // Line 42:
+ + # CPCode (Price Code) default untuk line item BQO
+ + REACT_APP_BQO_DEFAULT_CPCODE=STD
+ + 
+ ```
+ 
+ ---
+ 
+ #### 2. env/qorestoweb/.env [20260808_092914]
// Line 835:
- #### 2. nv/qorestoweb/.env [20260808_114715]
- **Fungsi:** Implementasi: .env  
- **Perubahan:** Ubah konfigurasi environment / API endpoint  
- 
- 
- - **✨ Features:** 12 items
- - **📖 Documentation:** 5 items
+ - **✨ Features:** 13 items
+ - **📖 Documentation:** 6 items
+ - **🔐 Auth/Session:** 2 items
- - **Total Files Modified:** 19
+ - **Total Files Modified:** 23
```

---

#### 3. docs/changelog/daily/codeChange-20260808.md [20260808_114717]
**Fungsi:** Implementasi: codeChange-20260808  
**Perubahan:** Pembaruan kode  
**Lines:** 7-33, 45, 57, 75, 93, 154, 215, 273, 318, 320-338, 342, 344-345, 348-361, 368-429, 490, 551, 612, 691-696, 698-701

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_103531]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_103848]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 390-391
+ 
+ ```javascript
+ // Line 387:
+ +           creason2:  ' ',
+ +           cadjdesc2: ' ',
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_payment.js [20260808_103848]
+ **Fungsi:** Modul: bqo_payment  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 192-193
+ 
+ ```javascript
+ // Line 189:
+ +         creason2:  ' ',
+ +         cadjdesc2: ' ',
+ ```
  // ... (truncated)
+ #### 2. docs/changelog/daily/codeChange-20260808.md [20260808_103531]
// Line 487:
- #### 2. docs/changelog/daily/codeChange-20260808.md [20260808_103051]
+ #### 3. docs/changelog/daily/codeChange-20260808.md [20260808_103051]
// Line 548:
- #### 3. docs/changelog/daily/codeChange-20260808.md [20260808_101932]
+ #### 4. docs/changelog/daily/codeChange-20260808.md [20260808_101932]
// Line 609:
- #### 4. docs/changelog/daily/codeChange-20260808.md [20260808_092914]
+ #### 5. docs/changelog/daily/codeChange-20260808.md [20260808_092914]
// Line 688:
+ #### 2. nv/qorestoweb/.env [20260808_114715]
+ **Fungsi:** Implementasi: .env  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ 
+ ---
+ 
- - **✨ Features:** 10 items
- - **📖 Documentation:** 4 items
- - **⚙️ Config:** 1 item
- - **Total Files Modified:** 15
+ - **✨ Features:** 12 items
+ - **📖 Documentation:** 5 items
+ - **⚙️ Config:** 2 items
+ - **Total Files Modified:** 19
```

---

#### 4. docs/changelog/daily/codeChange-20260808.md [20260808_103848]
**Fungsi:** Implementasi: codeChange-20260808  
**Perubahan:** Pembaruan kode  
**Lines:** 7-31, 49, 67, 128, 189, 247, 292, 298, 301, 305-306, 313-374, 435, 496, 576-577, 579

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_103051]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_103531]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ 
+ ```javascript
+ // Line 387:
+ -           creason2:  '',
+ -           cadjdesc2: '',
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_payment.js [20260808_103531]
+ **Fungsi:** Modul: bqo_payment  
+ **Perubahan:** Pembaruan kode  
+ 
+ ```javascript
+ // Line 189:
+ -         creason2:  '',
+ -         cadjdesc2: '',
+ ```
+ 
+ ---
  // ... (truncated)
+ // Line 487:
+ - - **✨ Features:** 6 items
+ - - **📖 Documentation:** 2 items
+ + - **✨ Features:** 8 items
+ + - **📖 Documentation:** 3 items
+ - - **Total Files Modified:** 9
+ + - **Total Files Modified:** 12
+ ```
+ 
+ ---
+ 
+ #### 2. docs/changelog/daily/codeChange-20260808.md [20260808_103051]
// Line 432:
- #### 2. docs/changelog/daily/codeChange-20260808.md [20260808_101932]
+ #### 3. docs/changelog/daily/codeChange-20260808.md [20260808_101932]
// Line 493:
- #### 3. docs/changelog/daily/codeChange-20260808.md [20260808_092914]
+ #### 4. docs/changelog/daily/codeChange-20260808.md [20260808_092914]
// Line 573:
- - **✨ Features:** 8 items
- - **📖 Documentation:** 3 items
+ - **✨ Features:** 10 items
+ - **📖 Documentation:** 4 items
- - **Total Files Modified:** 12
+ - **Total Files Modified:** 15
```

---

#### 5. docs/changelog/daily/codeChange-20260808.md [20260808_103531]
**Fungsi:** Implementasi: codeChange-20260808  
**Perubahan:** Pembaruan kode  
**Lines:** 7-43, 104, 165, 223, 268, 274, 279-281, 288-349, 410, 490-491, 493

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_101932]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_103051]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 380-385
+ 
+ ```javascript
+ // Line 377:
+ -           ccusid:    BQO_DEFAULT_CUSTOMER,    // langsung di header, bukan nested
+ +           customer: {
+ +             ccusid:   BQO_DEFAULT_CUSTOMER,
+ +             cinitial: '',
+ +             cnotelp:  info.phoneNumber || '',
+ +             cemail:   '',
+ +           },
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_payment.js [20260808_103051]
+ **Fungsi:** Modul: bqo_payment  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 182-187
+ 
  // ... (truncated)
+ + ---
+ + 
+ + #### 2. docs/changelog/daily/codeChange-20260808.md [20260808_092914]
+ // Line 396:
+ - - **✨ Features:** 4 items
+ - - **📖 Documentation:** 1 item
+ + - **✨ Features:** 6 items
+ + - **📖 Documentation:** 2 items
+ - - **Total Files Modified:** 6
+ + - **Total Files Modified:** 9
+ ```
+ 
+ ---
+ 
+ #### 2. docs/changelog/daily/codeChange-20260808.md [20260808_101932]
// Line 407:
- #### 2. docs/changelog/daily/codeChange-20260808.md [20260808_092914]
+ #### 3. docs/changelog/daily/codeChange-20260808.md [20260808_092914]
// Line 487:
- - **✨ Features:** 6 items
- - **📖 Documentation:** 2 items
+ - **✨ Features:** 8 items
+ - **📖 Documentation:** 3 items
- - **Total Files Modified:** 9
+ - **Total Files Modified:** 12
```

---

#### 6. docs/changelog/daily/codeChange-20260808.md [20260808_103051]
**Fungsi:** Implementasi: codeChange-20260808  
**Perubahan:** Pembaruan kode  
**Lines:** 7-129, 187, 232, 238, 241, 244-251, 258-319, 399-400, 402

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_092914]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_101932]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 354, 359, 362-363, 376-398
+ 
+ ```javascript
+ // Line 351:
+ -           crefnote: 'ONLINE',
+ +           crefnote: '',
+ -           ncqo:     '',
+ +           ncqo:     0,
+ +           ccpcode:  '',
+ +           csalesid: BQO_DEFAULT_SALES,
+ -           csalesid: '',
+ -           nkomisi:  '',
+ // Line 373:
+ -           cqonum:     '',
+ -           ctabid:     info.seatNumber  || '',
+ -           cwhseid:    BQO_DEFAULT_WHSE,
+ -           cremark:    info.orderByName || '',
+ -           customer: {
+ -             ccusid:   BQO_DEFAULT_CUSTOMER,
+ -             cinitial: '',
  // ... (truncated)
+ + ```javascript
+ + // Line 34:
+ + - REACT_APP_BQO_DEFAULT_CUSTOMER=CASH
+ + + REACT_APP_BQO_DEFAULT_CUSTOMER=UMUM
+ + + # Sales Person ID default untuk transaksi BQO
+ + + REACT_APP_BQO_DEFAULT_SALES=TKO
+ + + 
+ + ```
+ - - **✨ Features:** 2 items
+ + - **✨ Features:** 4 items
+ + - **📖 Documentation:** 1 item
+ - - **Total Files Modified:** 3
+ + - **Total Files Modified:** 6
+ ```
+ 
+ ---
+ 
+ #### 2. docs/changelog/daily/codeChange-20260808.md [20260808_092914]
// Line 396:
- - **✨ Features:** 4 items
- - **📖 Documentation:** 1 item
+ - **✨ Features:** 6 items
+ - **📖 Documentation:** 2 items
- - **Total Files Modified:** 6
+ - **Total Files Modified:** 9
```

---

#### 7. docs/changelog/daily/codeChange-20260808.md [20260808_101932]
**Fungsi:** Implementasi: codeChange-20260808  
**Perubahan:** Pembaruan kode  
**Lines:** 110-239, 242, 245-254, 259-260, 262

```javascript
// Line 107:
+ #### 3. rc/scripts/modules/BQO/views/bqo_checkout.js [20260808_101931]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ #### 4. src/scripts/modules/BQO/views/bqo_payment.js [20260808_101931]
+ **Fungsi:** Modul: bqo_payment  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 156, 161, 164-165, 178-189, 191-200
+ 
+ ```javascript
+ // Line 153:
+ -         crefnote: 'ONLINE',
+ +         crefnote: '',
+ -         ncqo:     '',
+ +         ncqo:     0,
+ +         ccpcode:  '',
+ +         csalesid: BQO_DEFAULT_SALES,
+ -         csalesid: '',
+ -         nkomisi:  '',
+ // Line 175:
+ -         cqonum:     '',
+ -         ctabid:     orderInfo.seatNumber  || '',
  // ... (truncated)
+ + - **✨ Features:** 2 items
+ + - **⚙️ Config:** 1 item
+ + - **Total Files Modified:** 3
+ + - **Main Focus:** Features
+ ```
+ 
+ ---
+ 
- #### 1. nv/qorestoweb/.env [20260808_092914]
+ #### 1. env/qorestoweb/.env [20260808_092914]
+ **Lines:** 37, 42-44
+ 
+ ```javascript
+ // Line 34:
+ - REACT_APP_BQO_DEFAULT_CUSTOMER=CASH
+ + REACT_APP_BQO_DEFAULT_CUSTOMER=UMUM
+ + # Sales Person ID default untuk transaksi BQO
+ + REACT_APP_BQO_DEFAULT_SALES=TKO
+ + 
+ ```
- - **✨ Features:** 2 items
+ - **✨ Features:** 4 items
+ - **📖 Documentation:** 1 item
- - **Total Files Modified:** 3
+ - **Total Files Modified:** 6
```

---

#### 8. docs/changelog/daily/codeChange-20260808.md [20260808_092914]
**Fungsi:** Implementasi: codeChange-20260808  
**Perubahan:** Pembaruan kode  
**Lines:** 1-122

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 8 Agustus 2026
+ 
+ ### ✨ Features
+ 
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_092914]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Tambah fungsi: BQO_DEFAULT_SALES  
+ **Lines:** 51, 362, 364-365, 376-381, 386-396, 402-403
+ 
+ ```javascript
+ // Line 48:
+ + const BQO_DEFAULT_SALES    = (process.env.REACT_APP_BQO_DEFAULT_SALES    || 'ONLINE').trim();
+ // Line 359:
+ -           nhrgjua:  String(nhrgjua),
+ +           nhrgjua,
+ -           ndisc:    discPct > 0 ? String(discPct) : '',
+ -           nrpdisc:  String(nrpdisc),
+ +           ndisc:    discPct > 0 ? discPct : 0,
+ +           nrpdisc,
+ // Line 373:
+ -           cqonum:   '',                            // kosong, auto-generate dari backend
+ -           ctabid:   info.seatNumber  || '',        // Nomor Meja
  // ... (truncated)
+ +         csalesid:   BQO_DEFAULT_SALES,
+ +         lmulsales:  false,
+ +         npctdisc:   0,
+ +         npctppn:    TAX_PERCENT,
+ +         namount:    subtotal,
+ +         ndp:        total,
+ -         nsaleschg:  '0',
+ +         nsaleschg:  0,
+ ```
+ 
+ ---
+ 
+ ### ⚙️ Config
+ 
+ #### 1. nv/qorestoweb/.env [20260808_092914]
+ **Fungsi:** Implementasi: .env  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **✨ Features:** 2 items
+ - **⚙️ Config:** 1 item
+ - **Total Files Modified:** 3
+ - **Main Focus:** Features
```

---

### 🔐 Auth/Session

#### 1. src/scripts/contexts/AuthContext.js [20260808_131204]
**Fungsi:** Context autentikasi global  
**Perubahan:** Akses localStorage  
**Lines:** 61-66, 121-124

```javascript
// Line 58:
+         // Saat login fresh (bukan re-login dari session expired), clear BQO data
+         const isRelogin = window.localStorage.getItem('QoReturnPath') !== null;
+         if (!isRelogin) {
+           window.localStorage.removeItem('QoCart');
+           window.localStorage.removeItem('QoOrderInfo');
+         }
// Line 118:
+     // Bersihkan data BQO saat logout — pelanggan berikutnya mulai fresh
+     window.localStorage.removeItem('QoCart');
+     window.localStorage.removeItem('QoOrderInfo');
+     window.localStorage.removeItem('QoReturnPath');
```

---

#### 2. src/scripts/modules/LOGIN/index.js [20260808_131204]
**Fungsi:** Entry point / registrasi React  
**Perubahan:** Akses localStorage; Tambah navigasi halaman  
**Lines:** 56-66

```javascript
// Line 53:
-     setLoading(true)
-     auth.signin(state, () => (isForm ? afterLogin() : navigate(from)), isForm, setLoading);
+     setLoading(true);
+     auth.signin(state, () => {
+       // Setelah login berhasil — cek apakah ada returnPath dari session expired
+       const returnPath = window.localStorage.getItem('QoReturnPath');
+       if (returnPath) {
+         window.localStorage.removeItem('QoReturnPath'); // clear flag re-login
+         isForm ? afterLogin() : navigate(returnPath);
+       } else {
+         isForm ? afterLogin() : navigate(from);
+       }
+     }, isForm, setLoading);
```

---

### ⚙️ Config

#### 1. env/qorestoweb/.env [20260808_114717]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 45-47

```javascript
// Line 42:
+ # CPCode (Price Code) default untuk line item BQO
+ REACT_APP_BQO_DEFAULT_CPCODE=STD
+ 
```

---

#### 2. env/qorestoweb/.env [20260808_092914]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 37, 42-44

```javascript
// Line 34:
- REACT_APP_BQO_DEFAULT_CUSTOMER=CASH
+ REACT_APP_BQO_DEFAULT_CUSTOMER=UMUM
+ # Sales Person ID default untuk transaksi BQO
+ REACT_APP_BQO_DEFAULT_SALES=TKO
+ 
```

---

## 📊 **Summary**
- **✨ Features:** 19 items
- **📖 Documentation:** 8 items
- **🔐 Auth/Session:** 2 items
- **⚙️ Config:** 2 items
- **Total Files Modified:** 31
- **Main Focus:** Features
