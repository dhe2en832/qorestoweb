# Code Changes Summary

## 13 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260813_084541]
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

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260813.md [20260813_084541]
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

#### 1. src/scripts/contexts/AuthContext.js [20260813_084541]
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

#### 2. src/scripts/modules/LOGIN/index.js [20260813_084541]
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

#### 3. rc/scripts/modules/LOGIN/index.js [20260813_085040]
**Fungsi:** Entry point / registrasi React  
**Perubahan:** Pembaruan kode  

---

## 📊 **Summary**
- **✨ Features:** 1 item
- **📖 Documentation:** 1 item
- **🔐 Auth/Session:** 3 items
- **Total Files Modified:** 5
- **Main Focus:** 🔐 Auth/Session
