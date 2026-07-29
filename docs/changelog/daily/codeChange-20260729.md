# Code Changes Summary

## 29 Juli 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/index.js [20260729_131606]
**Fungsi:** Entry point / registrasi React  
**Perubahan:** Import: bqo_payment  
**Lines:** 6, 13, 15-16

```javascript
// Line 3:
+ import BQOPayment from './views/bqo_payment';
-                     <Route path={"/menu"} element={<BQOHome />} />
+                     <Route path={"/menu"}     element={<BQOHome />} />
-                     <Route path="*" element={<Navigate to="/404" />} />
+                     <Route path={"/payment"}  element={<BQOPayment />} />
+                     <Route path="*"           element={<Navigate to="/404" />} />
```

---

#### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260729_131606]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: DialogTitle; Import: Divider; Import: PointOfSale; Import: PhoneAndroid; Tambah state management; Tambah fungsi: handleOnCheckout; Tambah fungsi: handlePayAtKasir; Tambah error handling; Akses localStorage; Tambah navigasi halaman; Tambah fungsi: handlePaySelf  
**Lines:** 7, 15, 22-23, 233-236, 249-276, 278-282, 514-519, 562-651

```javascript
// Line 4:
+ import DialogTitle from '@mui/material/DialogTitle';
// Line 12:
+ import Divider from '@mui/material/Divider';
+ import CashierIcon from '@mui/icons-material/PointOfSale';
+ import SelfPayIcon from '@mui/icons-material/PhoneAndroid';
// Line 230:
-   const handleOnCheckout = async () => {
+   // Dialog pilihan metode bayar: kasir vs mandiri
+   const [showPaymentMethodDlg, setShowPaymentMethodDlg] = useState(false);
+ 
+   const handleOnCheckout = () => {
// Line 246:
+     // Tampilkan dialog pilihan: bayar di kasir atau mandiri
+     setShowPaymentMethodDlg(true);
+   };
+ 
+   // Bayar di kasir — submit pesanan ke backend, tanpa halaman payment
+   const [isSubmittingKasir, setIsSubmittingKasir] = useState(false);
+   const handlePayAtKasir = async () => {
+     setShowPaymentMethodDlg(false);
+     setIsSubmittingKasir(true);
+     try {
+       const payload = { info, cart: Object.values(cart) };
+       const result = await bqo_api.add(payload);
  // ... (truncated)
+               '&:hover': { borderWidth: 2, bgcolor: '#f0fff4' },
+             }}
+           >
+             <SelfPayIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
+             <div style={{ textAlign: 'left' }}>
+               <Typography variant="body1" fontWeight={600} color="text.primary">
+                 Bayar Sendiri (Mandiri)
+               </Typography>
+               <Typography variant="caption" color="text.secondary">
+                 Bayar sekarang lewat QRIS, transfer,{'\n'}
+                 atau metode digital lainnya.
+               </Typography>
+             </div>
+           </Button>
+         </DialogContent>
+         <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
+           <Button
+             size="small"
+             color="inherit"
+             onClick={() => setShowPaymentMethodDlg(false)}
+           >
+             Batal
+           </Button>
+         </DialogActions>
+       </Dialog>
```

---

#### 3. src/scripts/modules/BBANK/ [20260729_131606]
**Fungsi:** Modul: BBANK  
**Perubahan:** Pembaruan kode  

---

#### 4. src/scripts/modules/BQO/hooks/ [20260729_131606]
**Fungsi:** Custom hook: hooks  
**Perubahan:** Pembaruan kode  

---

#### 5. src/scripts/modules/BQO/reports/ [20260729_131606]
**Fungsi:** Modul: reports  
**Perubahan:** Pembaruan kode  

---

#### 6. src/scripts/modules/BQO/views/bqo_payment.js [20260729_131606]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Pembaruan kode  

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260729.md [20260729_112046]
**Fungsi:** Implementasi: codeChange-20260729  
**Perubahan:** Pembaruan kode  
**Lines:** 5-63, 93, 95-96, 98-104, 109, 111-113

```javascript
// Line 2:
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260729.md [20260729_104543]
+ **Fungsi:** Implementasi: codeChange-20260729  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 1-46
+ 
+ ```javascript
+ // Line 1:
+ + # Code Changes Summary
+ + 
+ + ## 29 Juli 2026
+ + 
+ + ### 🔌 API
+ + 
+ + #### 1. src/scripts/routes/ApiRoute.js [20260729_104543]
+ + **Fungsi:** Route: ApiRoute  
+ + **Perubahan:** Pembaruan kode  
+ + **Lines:** 4-11
+ + 
+ + ```javascript
+ + // Line 1:
+ + -   LOGIN_X: `${Config.BASE_URL}/csa/pulauplastik/login_x`,
+ + -   BCUST_X: `${Config.BASE_URL}/csa/pulauplastik/bcust_x`,
  // ... (truncated)
+ ```
+ 
+ ---
+ 
// Line 90:
- ### ⚙️ Others
+ ### ⚙️ Config
- #### 1. env-cmdrc [20260729_104543]
- **Fungsi:** Implementasi: env-cmdrc  
+ #### 1. .env-cmdrc [20260729_104543]
+ **Fungsi:** Implementasi: .env-cmdrc  
+ **Lines:** 19
+ 
+ ```javascript
+ // Line 16:
+ -         "REACT_APP_API_ENDPOINT": "https://csacomputer.ddns.net/api",
+ +          "REACT_APP_API_ENDPOINT": "http://192.168.100.13/api",
+ ```
+ - **📖 Documentation:** 1 item
- - **⚙️ Others:** 1 item
- - **Total Files Modified:** 2
- - **Main Focus:** 🔌 API
+ - **⚙️ Config:** 1 item
+ - **Total Files Modified:** 3
+ - **Main Focus:** 📖 Documentation
```

---

#### 2. docs/changelog/daily/codeChange-20260729.md [20260729_104543]
**Fungsi:** Implementasi: codeChange-20260729  
**Perubahan:** Pembaruan kode  
**Lines:** 1-46

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 29 Juli 2026
+ 
+ ### 🔌 API
+ 
+ #### 1. src/scripts/routes/ApiRoute.js [20260729_104543]
+ **Fungsi:** Route: ApiRoute  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 4-11
+ 
+ ```javascript
+ // Line 1:
+ -   LOGIN_X: `${Config.BASE_URL}/csa/pulauplastik/login_x`,
+ -   BCUST_X: `${Config.BASE_URL}/csa/pulauplastik/bcust_x`,
+ -   BWHSE_X: `${Config.BASE_URL}/csa/pulauplastik/bwhse_x`,
+ -   BSALESP_X: `${Config.BASE_URL}/csa/pulauplastik/bsalesp_x`,
+ -   BSTOCK_X: `${Config.BASE_URL}/csa/pulauplastik/bstock_x`,
+ -   BSO_X: `${Config.BASE_URL}/csa/pulauplastik/bso_x`,
+ -   BITMSO_X: `${Config.BASE_URL}/csa/pulauplastik/bitmso_x`,
+ -   BQO_X: `${Config.BASE_URL}/csa/pulauplastik/bqo_x`,
+ +   LOGIN_X: `${Config.BASE_URL}/csa/resto/login_x`,
+ +   BCUST_X: `${Config.BASE_URL}/csa/resto/bcust_x`,
+ +   BWHSE_X: `${Config.BASE_URL}/csa/resto/bwhse_x`,
+ +   BSALESP_X: `${Config.BASE_URL}/csa/resto/bsalesp_x`,
+ +   BSTOCK_X: `${Config.BASE_URL}/csa/resto/bstock_x`,
+ +   BSO_X: `${Config.BASE_URL}/csa/resto/bso_x`,
+ +   BITMSO_X: `${Config.BASE_URL}/csa/resto/bitmso_x`,
+ +   BQO_X: `${Config.BASE_URL}/csa/resto/bqo_x`,
+ ```
+ 
+ ---
+ 
+ ### ⚙️ Others
+ 
+ #### 1. env-cmdrc [20260729_104543]
+ **Fungsi:** Implementasi: env-cmdrc  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
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

#### 3. docs/major-update-payment-dualserver-print.md [20260729_131606]
**Fungsi:** Implementasi: major-update-payment-dualserver-print  
**Perubahan:** Pembaruan kode  

---

#### 4. docs/panduan-build-dan-development.md [20260729_131606]
**Fungsi:** Implementasi: panduan-build-dan-development  
**Perubahan:** Pembaruan kode  

---

### 🔌 API

#### 1. src/scripts/routes/ApiRoute.js [20260729_104543]
**Fungsi:** Route: ApiRoute  
**Perubahan:** Pembaruan kode  
**Lines:** 4-11

```javascript
// Line 1:
-   LOGIN_X: `${Config.BASE_URL}/csa/pulauplastik/login_x`,
-   BCUST_X: `${Config.BASE_URL}/csa/pulauplastik/bcust_x`,
-   BWHSE_X: `${Config.BASE_URL}/csa/pulauplastik/bwhse_x`,
-   BSALESP_X: `${Config.BASE_URL}/csa/pulauplastik/bsalesp_x`,
-   BSTOCK_X: `${Config.BASE_URL}/csa/pulauplastik/bstock_x`,
-   BSO_X: `${Config.BASE_URL}/csa/pulauplastik/bso_x`,
-   BITMSO_X: `${Config.BASE_URL}/csa/pulauplastik/bitmso_x`,
-   BQO_X: `${Config.BASE_URL}/csa/pulauplastik/bqo_x`,
+   LOGIN_X: `${Config.BASE_URL}/csa/resto/login_x`,
+   BCUST_X: `${Config.BASE_URL}/csa/resto/bcust_x`,
+   BWHSE_X: `${Config.BASE_URL}/csa/resto/bwhse_x`,
+   BSALESP_X: `${Config.BASE_URL}/csa/resto/bsalesp_x`,
+   BSTOCK_X: `${Config.BASE_URL}/csa/resto/bstock_x`,
+   BSO_X: `${Config.BASE_URL}/csa/resto/bso_x`,
+   BITMSO_X: `${Config.BASE_URL}/csa/resto/bitmso_x`,
+   BQO_X: `${Config.BASE_URL}/csa/resto/bqo_x`,
```

---

#### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260729_131606]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Tambah fungsi: LOCAL_BASE_URL; Akses localStorage; Tambah HTTP request; Tambah error handling  
**Lines:** 4-6, 18, 34-113

```javascript
// Line 1:
+ // URL server lokal sebagai fallback. Kosong = fitur lokal tidak aktif.
+ const LOCAL_BASE_URL = (process.env.REACT_APP_API_LOCAL_ENDPOINT || '').trim();
+ 
// Line 15:
+         signal: AbortSignal.timeout(15000),
// Line 31:
+ 
+   /**
+    * addToLocal — kirim transaksi ke server lokal sebagai fallback.
+    * Dipanggil saat server utama tidak bisa dijangkau.
+    *
+    * Mekanisme: auto-login ke server lokal dengan credential dari localStorage,
+    * kirim transaksi, lalu auto-logout.
+    */
+   static async addToLocal(data) {
+     if (!LOCAL_BASE_URL) {
+       throw new Error('Server lokal tidak dikonfigurasi (REACT_APP_API_LOCAL_ENDPOINT kosong).');
+     }
+ 
+     const localUser = window.localStorage.getItem('auth_local_user');
+     const localPass = window.localStorage.getItem('auth_local_pass');
+ 
+     if (!localUser || !localPass) {
+       throw new Error('Credential fallback tidak tersedia. Silakan login ulang.');
  // ... (truncated)
+     });
+ 
+     // Logout dari server lokal
+     try {
+       await fetch(`${LOCAL_BASE_URL}/csa/resto/login_x`, {
+         method: 'POST',
+         headers: {
+           'content-type': 'application/json',
+           'x-user': localUser,
+           secretkey: localSessionKey,
+           sessionid: localSessionID,
+         },
+         body: JSON.stringify({ action: 'logout' }),
+         signal: AbortSignal.timeout(5000),
+       });
+     } catch (_) { /* silent */ }
+ 
+     // Bersihkan safety net
+     window.sessionStorage.removeItem('local_stale_secretkey');
+     window.sessionStorage.removeItem('local_stale_sessionid');
+     window.sessionStorage.removeItem('local_stale_userid');
+ 
+     const json = await res.json();
+     return { ...json, source: 'local' };
+   }
```

---

#### 3. src/scripts/routes/ApiRoute.js [20260729_131606]
**Fungsi:** Route: ApiRoute  
**Perubahan:** Pembaruan kode  
**Lines:** 12

```javascript
// Line 9:
+   BBANK_X: `${Config.BASE_URL}/csa/resto/bbank_x`,
```

---

#### 4. src/scripts/utils/payment-api.js [20260729_131606]
**Fungsi:** Utility: payment-api  
**Perubahan:** Pembaruan kode  

---

### ⚙️ Config

#### 1. .env-cmdrc [20260729_104543]
**Fungsi:** Implementasi: .env-cmdrc  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 19

```javascript
// Line 16:
-         "REACT_APP_API_ENDPOINT": "https://csacomputer.ddns.net/api",
+          "REACT_APP_API_ENDPOINT": "http://192.168.100.13/api",
```

---

#### 2. package.json [20260729_131606]
**Fungsi:** Implementasi: package  
**Perubahan:** Pembaruan kode  
**Lines:** 47-51

```javascript
// Line 44:
-     "build:staging": "rm -rf build && env-cmd -e staging yarn build",
-     "build:prod": "rm -rf build && env-cmd -e production yarn build",
+     "build:staging": "rm -rf build && env-cmd -e staging react-scripts build",
+     "build:prod": "rm -rf build && env-cmd -e production react-scripts build",
+     "build:primary": "node build-deploy.cjs --mode=primary",
+     "build:cadangan": "node build-deploy.cjs --mode=cadangan",
+     "build:all": "node build-deploy.cjs --mode=primary && node build-deploy.cjs --mode=cadangan",
```

---

#### 3. build-deploy.cjs [20260729_131606]
**Fungsi:** Implementasi: build-deploy  
**Perubahan:** Pembaruan kode  

---

### ⚙️ Others

#### 1. env-cmdrc [20260729_131606]
**Fungsi:** Implementasi: env-cmdrc  
**Perubahan:** Ubah konfigurasi environment / API endpoint  

---

#### 2. src/scripts/App.js [20260729_131606]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Import: react; Tambah side effect; Import: app-config  
**Lines:** 1, 11, 19-23

```javascript
// Line 1:
- import React, { useRef, lazy, Suspense } from 'react';
+ import React, { useRef, lazy, Suspense, useEffect } from 'react';
// Line 8:
+ import { loadAppConfig } from './utils/app-config';
// Line 16:
+ 
+   // Load runtime config (app.cfg) sekali saat app pertama mount
+   useEffect(() => {
+     loadAppConfig();
+   }, []);
```

---

#### 3. public/app.cfg [20260729_131606]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  

---

#### 4. public/app.cfg.cadangan [20260729_131606]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  

---

#### 5. src/scripts/utils/app-config.js [20260729_131606]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  

---

#### 6. src/scripts/utils/failed-trx-download.js [20260729_131606]
**Fungsi:** Utility: failed-trx-download  
**Perubahan:** Pembaruan kode  

---

## 📊 **Summary**
- **✨ Features:** 6 items
- **📖 Documentation:** 4 items
- **🔌 API:** 4 items
- **⚙️ Config:** 3 items
- **⚙️ Others:** 6 items
- **Total Files Modified:** 23
- **Main Focus:** Features
