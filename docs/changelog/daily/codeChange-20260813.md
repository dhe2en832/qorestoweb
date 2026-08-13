# Code Changes Summary

## 13 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_100856]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Tambah state management  
**Lines:** 180-190, 504, 640, 643-644, 647, 654-660, 662

```javascript
// Line 177:
-       const res = await bqo_api.getActiveOrders();
+       let res = await bqo_api.getActiveOrders();
+ 
+       // Jika session expired di QR mode → silent re-login lalu retry
+       if (res && res.result === false && getTableId()) {
+         const errMsg = res.onfail?.cerror || '';
+         if (errMsg.includes('expired') || errMsg.includes('tidak valid')) {
+           await new Promise((resolve) => auth.signinAsGuest(resolve));
+           res = await bqo_api.getActiveOrders();
+         }
+       }
+ 
// Line 501:
-           // QR mode: auto re-login lalu retry submit
+           // QR mode: auto re-login lalu retry submit — silent, tanpa pesan ke user
-             ToastBar('info', 'Session habis. Sedang login ulang...', 2000);
// Line 637:
+     setReceiptDownloaded(true);
+   const [receiptDownloaded, setReceiptDownloaded] = useState(false);
+ 
-     // Print guard hanya berlaku jika tombol print ditampilkan (bukan QR/HP mode)
+     // Print guard: cetak dulu (mode PC/kasir)
+     // Download guard: wajib download dulu (mode HP/QR)
+     if (!showPrint && !receiptDownloaded) {
+       AlertDialog('warning', 'Belum Download Bukti Pesanan',
+         'Silakan download bukti pesanan terlebih dahulu.',
+         () => handleDownloadReceipt());
+       return;
+     }
+     setReceiptDownloaded(false);
```

---

#### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_094055]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  
**Lines:** 382-383

```javascript
// Line 379:
-           <p>Tambahkan Pesanan?</p>,
-           'Ya, Tambahkan',
+           <p>Pesanan baru akan dibuat terpisah dengan nomor order baru. Lanjutkan?</p>,
+           'Ya, Buat Pesanan Baru',
```

---

#### 3. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_092723]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: ConfirmDialog  
**Lines:** 34, 378-388

```javascript
// Line 31:
+ import ConfirmDialog from '../../../components/ConfirmDialog';
// Line 375:
+       if (isTableLocked) {
+         // QR mode — tampilkan warning tapi tetap bisa lanjut (bisa jadi satu grup)
+         ConfirmDialog(
+           'Meja ini ada pesanan aktif',
+           <p>Tambahkan Pesanan?</p>,
+           'Ya, Tambahkan',
+           () => setShowPaymentMethodDlg(true),
+         );
+         return;
+       }
+       // Mode manual (dropdown) — blokir total
```

---

#### 4. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084541]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: AuthContext  
**Lines:** 39, 71, 480, 482-498

```javascript
// Line 36:
+ import { useAuth } from '../../../contexts/AuthContext';
// Line 68:
+   const auth = useAuth();
// Line 477:
-         // Deteksi session expired — simpan state lalu redirect ke login
+         // Deteksi session expired
+           // QR mode: auto re-login lalu retry submit
+           if (getTableId()) {
+             ToastBar('info', 'Session habis. Sedang login ulang...', 2000);
+             await new Promise((resolve) => auth.signinAsGuest(resolve));
+             // Retry submit setelah re-login
+             const retryResult = await bqo_api.add(payload);
+             if (retryResult.result === true) {
+               const bon2    = retryResult.onsuccess?.cordernum || retryResult.onsuccess?.csonum || '';
+               const cqonum2 = retryResult.onsuccess?.cqonum    || bon2;
+               setKasirResult({ nomorBon: bon2, cqonum: cqonum2, cartItems, subtotal, taxAmount, total });
+               fetchOccupiedTables();
+             } else {
+               ToastBar('error', `Gagal: ${retryResult.onfail?.cerror || 'Error setelah re-login'}`, 5000);
+             }
+             return;
+           }
+           // Mode biasa: redirect ke login
```

---

#### 5. rc/scripts/modules/BQO/views/bqo_checkout.js [20260813_101422]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260813.md [20260813_100856]
**Fungsi:** Implementasi: codeChange-20260813  
**Perubahan:** Akses localStorage  
**Lines:** 7-22, 46, 80, 88-149, 210, 271, 447-448, 450

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_092723]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_094055]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 382-383
+ 
+ ```javascript
+ // Line 379:
+ -           <p>Tambahkan Pesanan?</p>,
+ -           'Ya, Tambahkan',
+ +           <p>Pesanan baru akan dibuat terpisah dengan nomor order baru. Lanjutkan?</p>,
+ +           'Ya, Buat Pesanan Baru',
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_092723]
// Line 43:
- #### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084541]
+ #### 3. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084541]
// Line 77:
- #### 3. rc/scripts/modules/BQO/views/bqo_checkout.js [20260813_094054]
+ #### 4. rc/scripts/modules/BQO/views/bqo_checkout.js [20260813_100855]
// Line 85:
  // ... (truncated)
+ - - **📖 Documentation:** 2 items
+ + - **✨ Features:** 3 items
+ + - **📖 Documentation:** 3 items
+ - - **Total Files Modified:** 7
+ - - **Main Focus:** 🔐 Auth/Session
+ + - **Total Files Modified:** 9
+ + - **Main Focus:** Features
+ ```
+ 
+ ---
+ 
+ #### 2. docs/changelog/daily/codeChange-20260813.md [20260813_092723]
// Line 207:
- #### 2. docs/changelog/daily/codeChange-20260813.md [20260813_085040]
+ #### 3. docs/changelog/daily/codeChange-20260813.md [20260813_085040]
// Line 268:
- #### 3. docs/changelog/daily/codeChange-20260813.md [20260813_084541]
+ #### 4. docs/changelog/daily/codeChange-20260813.md [20260813_084541]
// Line 444:
- - **✨ Features:** 3 items
- - **📖 Documentation:** 3 items
+ - **✨ Features:** 4 items
+ - **📖 Documentation:** 4 items
- - **Total Files Modified:** 9
+ - **Total Files Modified:** 11
```

---

#### 2. docs/changelog/daily/codeChange-20260813.md [20260813_094055]
**Fungsi:** Implementasi: codeChange-20260813  
**Perubahan:** Akses localStorage  
**Lines:** 7-31, 65, 73-134, 195, 371-372, 374-375

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084541]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_092723]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Import: ConfirmDialog  
+ **Lines:** 34, 378-388
+ 
+ ```javascript
+ // Line 31:
+ + import ConfirmDialog from '../../../components/ConfirmDialog';
+ // Line 375:
+ +       if (isTableLocked) {
+ +         // QR mode — tampilkan warning tapi tetap bisa lanjut (bisa jadi satu grup)
+ +         ConfirmDialog(
+ +           'Meja ini ada pesanan aktif',
+ +           <p>Tambahkan Pesanan?</p>,
+ +           'Ya, Tambahkan',
+ +           () => setShowPaymentMethodDlg(true),
+ +         );
+ +         return;
+ +       }
+ +       // Mode manual (dropdown) — blokir total
+ ```
+ 
+ ---
  // ... (truncated)
+ - 
+ - 
+ - - **✨ Features:** 1 item
+ - - **📖 Documentation:** 1 item
+ + - **✨ Features:** 2 items
+ + - **📖 Documentation:** 2 items
+ - - **Total Files Modified:** 5
+ + - **Total Files Modified:** 7
+ ```
+ 
+ ---
+ 
+ #### 2. docs/changelog/daily/codeChange-20260813.md [20260813_085040]
// Line 192:
- #### 2. docs/changelog/daily/codeChange-20260813.md [20260813_084541]
+ #### 3. docs/changelog/daily/codeChange-20260813.md [20260813_084541]
// Line 368:
- - **✨ Features:** 2 items
- - **📖 Documentation:** 2 items
+ - **✨ Features:** 3 items
+ - **📖 Documentation:** 3 items
- - **Total Files Modified:** 7
- - **Main Focus:** 🔐 Auth/Session
+ - **Total Files Modified:** 9
+ - **Main Focus:** Features
```

---

#### 3. docs/changelog/daily/codeChange-20260813.md [20260813_092723]
**Fungsi:** Implementasi: codeChange-20260813  
**Perubahan:** Akses localStorage; Tambah state management  
**Lines:** 41-46, 49-110, 173-234, 249, 286-287, 289

```javascript
// Line 38:
+ #### 2. rc/scripts/modules/BQO/views/bqo_checkout.js [20260813_092722]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
- #### 1. docs/changelog/daily/codeChange-20260813.md [20260813_084541]
+ #### 1. docs/changelog/daily/codeChange-20260813.md [20260813_085040]
+ **Fungsi:** Implementasi: codeChange-20260813  
+ **Perubahan:** Akses localStorage; Tambah state management; Tambah side effect  
+ **Lines:** 7, 41-103, 106, 108-117, 121, 157-162, 165-167
+ 
+ ```javascript
+ // Line 4:
+ - #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084540]
+ + #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084541]
+ // Line 38:
+ + ### 📖 Documentation
+ + 
+ + #### 1. docs/changelog/daily/codeChange-20260813.md [20260813_084541]
+ + **Fungsi:** Implementasi: codeChange-20260813  
+ + **Perubahan:** Akses localStorage; Tambah state management; Tambah side effect  
+ + **Lines:** 1-89
+ + 
  // ... (truncated)
+ +         window.localStorage.removeItem('QoReturnPath');
+ // Line 76:
+ +   // Early return setelah semua hooks
+ +   if (autoLogging) return <ProgressLoader />;
+ + 
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/contexts/AuthContext.js [20260813_084541]
// Line 246:
- #### 2. src/scripts/modules/LOGIN/index.js [20260813_084541]
+ #### 3. src/scripts/modules/LOGIN/index.js [20260813_084541]
// Line 282:
- #### 3. rc/scripts/modules/LOGIN/index.js [20260813_085040]
- **Fungsi:** Entry point / registrasi React  
- **Perubahan:** Pembaruan kode  
- 
- 
- - **✨ Features:** 1 item
- - **📖 Documentation:** 1 item
+ - **✨ Features:** 2 items
+ - **📖 Documentation:** 2 items
- - **Total Files Modified:** 5
+ - **Total Files Modified:** 7
```

---

#### 4. docs/changelog/daily/codeChange-20260813.md [20260813_085040]
**Fungsi:** Implementasi: codeChange-20260813  
**Perubahan:** Akses localStorage; Tambah state management; Tambah side effect  
**Lines:** 7, 41-103, 106, 108-117, 121, 157-162, 165-167

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084540]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084541]
// Line 38:
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260813.md [20260813_084541]
+ **Fungsi:** Implementasi: codeChange-20260813  
+ **Perubahan:** Akses localStorage; Tambah state management; Tambah side effect  
+ **Lines:** 1-89
+ 
+ ```javascript
+ // Line 1:
+ + # Code Changes Summary
+ + 
+ + ## 13 Agustus 2026
+ + 
+ + ### ✨ Features
+ + 
+ + #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084540]
+ + **Fungsi:** Halaman checkout & submit order  
+ + **Perubahan:** Import: AuthContext  
+ + **Lines:** 39, 71, 480, 482-498
+ + 
+ + ```javascript
  // ... (truncated)
- **Perubahan:** Pembaruan kode  
+ **Perubahan:** Import: table-session  
+ **Lines:** 11, 212-213
+ 
+ ```javascript
+ // Line 8:
+ + import { getTableId } from '../utils/table-session';
+ // Line 209:
+ +     // Di QR mode, jangan invalidasi session — biarkan silent retry yang handle
+ +     if (getTableId()) return;
+ ```
- #### 2. src/scripts/modules/LOGIN/index.js [20260813_084540]
+ #### 2. src/scripts/modules/LOGIN/index.js [20260813_084541]
// Line 154:
+ #### 3. rc/scripts/modules/LOGIN/index.js [20260813_085040]
+ **Fungsi:** Entry point / registrasi React  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
- - **🔐 Auth/Session:** 2 items
- - **Total Files Modified:** 3
+ - **📖 Documentation:** 1 item
+ - **🔐 Auth/Session:** 3 items
+ - **Total Files Modified:** 5
```

---

#### 5. docs/changelog/daily/codeChange-20260813.md [20260813_084541]
**Fungsi:** Implementasi: codeChange-20260813  
**Perubahan:** Akses localStorage; Tambah state management; Tambah side effect  
**Lines:** 1-89

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 13 Agustus 2026
+ 
+ ### ✨ Features
+ 
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084540]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Import: AuthContext  
+ **Lines:** 39, 71, 480, 482-498
+ 
+ ```javascript
+ // Line 36:
+ + import { useAuth } from '../../../contexts/AuthContext';
+ // Line 68:
+ +   const auth = useAuth();
+ // Line 477:
+ -         // Deteksi session expired — simpan state lalu redirect ke login
+ +         // Deteksi session expired
+ +           // QR mode: auto re-login lalu retry submit
+ +           if (getTableId()) {
+ +             ToastBar('info', 'Session habis. Sedang login ulang...', 2000);
+ +             await new Promise((resolve) => auth.signinAsGuest(resolve));
+ +             // Retry submit setelah re-login
  // ... (truncated)
+ +   // QR mode: jika pelanggan sampai di halaman login (misal session expired redirect),
+ +   // auto re-login tanpa tampilkan form
+ +   const [autoLogging, setAutoLogging] = useState(false);
+ +   useEffect(() => {
+ +     if (tableId && !isForm && !authForQR.loggedIn) {
+ +       setAutoLogging(true);
+ +       authForQR.signinAsGuest(() => {
+ +         const returnPath = window.localStorage.getItem('QoReturnPath') || '/menu';
+ +         window.localStorage.removeItem('QoReturnPath');
+ +         navigateQR(returnPath, { replace: true });
+ +       });
+ +     }
+ +   // eslint-disable-next-line react-hooks/exhaustive-deps
+ +   }, []);
+ + 
+ +   if (autoLogging) return <ProgressLoader />;
+ ```
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **✨ Features:** 1 item
+ - **🔐 Auth/Session:** 2 items
+ - **Total Files Modified:** 3
+ - **Main Focus:** 🔐 Auth/Session
```

---

### 🔐 Auth/Session

#### 1. src/scripts/modules/LOGIN/index.js [20260813_085040]
**Fungsi:** Entry point / registrasi React  
**Perubahan:** Tambah state management; Tambah fungsi: login; Akses localStorage  
**Lines:** 22-23, 25-32, 34-39, 56, 60-61, 65, 71, 79-81

```javascript
// Line 19:
-   const authForQR = useAuth();
+   // ── Semua hooks harus di atas, sebelum conditional return apapun ──
+   const authForQR  = useAuth();
+   const location   = useLocation();
+   const auth       = useAuth();
+   const navigate   = useNavigate();
+ 
+   const [state,       setState]       = useState({ cuserid: '', cpassw: '' });
+   const [loading,     setLoading]     = useState(false);
+   const [autoLogging, setAutoLogging] = useState(false);
+ 
+   const { from } = location.state || { from: { pathname: '/' } };
+ 
+   const styles = {
+     root:   { padding: '16px' },
+     margin: { margin: '8px'   },
+   };
-   const [autoLogging, setAutoLogging] = useState(false);
// Line 52:
-   if (autoLogging) return <ProgressLoader />;
-   const styles = {
-     root: {
-       padding: '16px',
-     },
  // ... (truncated)
-     if (event.defaultPrevented) {
-       return;
-     }
-     switch (event.key) {
-       case 'Enter':
-         login(event);
-         break;
-       default:
-         return;
-     }
+     if (event.defaultPrevented) return;
+     if (event.key === 'Enter') login(event);
-   let auth = useAuth();
-   let navigate = useNavigate();
-   let location = useLocation();
-   let { from } = location.state || { from: { pathname: '/' } };
-   let login = (event) => {
+   const login = (event) => {
-       // Setelah login berhasil — cek apakah ada returnPath dari session expired
-         window.localStorage.removeItem('QoReturnPath'); // clear flag re-login
+         window.localStorage.removeItem('QoReturnPath');
// Line 76:
+   // Early return setelah semua hooks
+   if (autoLogging) return <ProgressLoader />;
+ 
```

---

#### 2. src/scripts/contexts/AuthContext.js [20260813_084541]
**Fungsi:** Context autentikasi global  
**Perubahan:** Import: table-session  
**Lines:** 11, 212-213

```javascript
// Line 8:
+ import { getTableId } from '../utils/table-session';
// Line 209:
+     // Di QR mode, jangan invalidasi session — biarkan silent retry yang handle
+     if (getTableId()) return;
```

---

#### 3. src/scripts/modules/LOGIN/index.js [20260813_084541]
**Fungsi:** Entry point / registrasi React  
**Perubahan:** Import: react; Tambah state management; Tambah side effect; Import: table-session; Import: ProgressLoader; Akses localStorage  
**Lines:** 1, 18-19, 22-41

```javascript
// Line 1:
- import React, { useState } from 'react';
+ import React, { useState, useEffect } from 'react';
// Line 15:
+ import { getTableId } from '../../utils/table-session';
+ import ProgressLoader from '../../components/ProgressLoader';
+   const authForQR = useAuth();
+   const navigateQR = useNavigate();
+   const tableId = getTableId();
+ 
+   // QR mode: jika pelanggan sampai di halaman login (misal session expired redirect),
+   // auto re-login tanpa tampilkan form
+   const [autoLogging, setAutoLogging] = useState(false);
+   useEffect(() => {
+     if (tableId && !isForm && !authForQR.loggedIn) {
+       setAutoLogging(true);
+       authForQR.signinAsGuest(() => {
+         const returnPath = window.localStorage.getItem('QoReturnPath') || '/menu';
+         window.localStorage.removeItem('QoReturnPath');
+         navigateQR(returnPath, { replace: true });
+       });
+     }
+   // eslint-disable-next-line react-hooks/exhaustive-deps
+   }, []);
+ 
+   if (autoLogging) return <ProgressLoader />;
```

---

## 📊 **Summary**
- **✨ Features:** 5 items
- **📖 Documentation:** 5 items
- **🔐 Auth/Session:** 3 items
- **Total Files Modified:** 13
- **Main Focus:** Features
