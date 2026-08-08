# Code Changes Summary

## 8 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260808_092914]
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

#### 2. src/scripts/modules/BQO/views/bqo_payment.js [20260808_092914]
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

### ⚙️ Config

#### 1. nv/qorestoweb/.env [20260808_092914]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  

---

## 📊 **Summary**
- **✨ Features:** 2 items
- **⚙️ Config:** 1 item
- **Total Files Modified:** 3
- **Main Focus:** Features
