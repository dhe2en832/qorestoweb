# Code Changes Summary

## 30 Juli 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260730_090039]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: BQOOrderSlip  
**Lines:** 33, 672, 675, 678-683, 764

```javascript
// Line 30:
- import BQOReceipt from '../reports/BQOReceipt';
+ import BQOOrderSlip from '../reports/BQOOrderSlip';
// Line 669:
-       {/* Hidden receipt component untuk kasir — rendered tapi tidak terlihat */}
+       {/* Hidden order slip component untuk kasir — rendered tapi tidak terlihat */}
-           <BQOReceipt
+           <BQOOrderSlip
-               cart:          kasirResult.cartItems,
-               orderInfo:     info,
-               subtotal:      kasirResult.subtotal,
-               taxAmount:     kasirResult.taxAmount,
-               total:         kasirResult.total,
-               paymentMethod: 'Bayar di Kasir',
-               nomorBon:      kasirResult.nomorBon,
-               isLocalServer: false,
-               showArchiveCopy: false,
-               isUnrecorded:  false,
+               orderInfo:    info,
+               cart:         kasirResult.cartItems,
+               subtotal:     kasirResult.subtotal,
+               taxAmount:    kasirResult.taxAmount,
+               total:        kasirResult.total,
+               nomorPesanan: kasirResult.nomorBon,
// Line 761:
-             {printCount > 0 ? `Cetak Ulang (${printCount}×)` : 'Cetak Struk'}
+             {printCount > 0 ? `Cetak Ulang (${printCount}×)` : 'Cetak Tanda Pesanan'}
```

---

#### 2. src/scripts/modules/BQO/views/bqo_payment.js [20260730_090039]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Tambah fungsi: CASH_BANK_CODE; Tambah fungsi: XENDIT_BANK_CODE  
**Lines:** 39-41

```javascript
// Line 36:
- const USE_XENDIT     = process.env.REACT_APP_USE_XENDIT_PAYMENT === 'Y';
- const CASH_BANK_CODE = (process.env.REACT_APP_CASH_BANK_CODE  || 'TUNAI').trim();
- const XENDIT_BANK_CODE = (process.env.REACT_APP_XENDIT_BANK_CODE || 'XENDIT').trim();
+ const USE_XENDIT      = process.env.REACT_APP_USE_XENDIT_PAYMENT === 'Y';
+ const CASH_BANK_CODE  = (process.env.REACT_APP_CASH_BANK_CODE   || 'T000').trim();
+ const XENDIT_BANK_CODE = (process.env.REACT_APP_XENDIT_BANK_CODE || 'X000').trim();
```

---

#### 3. src/scripts/modules/BQO/reports/BQOOrderSlip.jsx [20260730_090039]
**Fungsi:** Modul: BQOOrderSlip  
**Perubahan:** Pembaruan kode  

---

### ⚙️ Config

#### 1. nv/qorestoweb/.env [20260730_090039]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  

---

#### 2. env/qorestoweb/.env.dev [20260730_090039]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 1-4, 12, 15-16, 20

```javascript
// Line 1:
+ # ============================================================
+ # Development — API ke .13 sebagai utama
+ # ============================================================
+ 
// Line 9:
- # API
+ # API CSA — utama: .13, fallback: .85
+ 
+ # Payment Gateway Xendit
- # Mock — aktif di development
+ # Mock — aktif di development (bqo_x belum siap di backend)
```

---

#### 3. env/qorestoweb/.env.prod [20260730_090039]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 1-4, 12, 15-16

```javascript
// Line 1:
+ # ============================================================
+ # Production PRIMARY — .13 sebagai utama, .85 sebagai fallback
+ # ============================================================
+ 
// Line 9:
- # API — server utama: .13, fallback: .85
+ # API CSA — server utama: .13, fallback: .85
+ 
+ # Payment Gateway Xendit
```

---

#### 4. env/qorestoweb/.env.prod.cadangan [20260730_090039]
**Fungsi:** Implementasi: .env.prod  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 1-4, 12, 15-16

```javascript
// Line 1:
+ # ============================================================
+ # Production CADANGAN — .85 sebagai utama, .13 sebagai fallback
+ # ============================================================
+ 
// Line 9:
- # API — server cadangan: .85 sebagai utama, .13 sebagai fallback
+ # API CSA — server cadangan: .85 sebagai utama, .13 sebagai fallback
+ 
+ # Payment Gateway Xendit — .85 sebagai utama, .13 sebagai fallback
```

---

#### 5. env/qorestoweb/.env.qa [20260730_090039]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 1-4, 12

```javascript
// Line 1:
+ # ============================================================
+ # QA / Testing — API ke localhost
+ # ============================================================
+ 
// Line 9:
- # API
+ # API CSA — lokal untuk testing
```

---

## 📊 **Summary**
- **✨ Features:** 3 items
- **⚙️ Config:** 5 items
- **Total Files Modified:** 8
- **Main Focus:** ⚙️ Config
